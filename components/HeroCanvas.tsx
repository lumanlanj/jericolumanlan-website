"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Particle-sphere hero: thousands of glowing points distributed evenly over a
 * sphere (Fibonacci lattice), shaded red with a luminous rim and a dark
 * core, on near-black — additive blending makes the silhouette glow where
 * points overlap along the view direction.
 *
 * Mouse interaction:
 *  - the sphere gently rotates to follow the cursor (parallax tilt), and
 *  - points near the cursor bulge outward and brighten (an interactive ripple).
 *
 * prefers-reduced-motion → one static frame, no loop. Pauses when hidden /
 * offscreen. No WebGL → CSS gradient fallback shows through.
 */
export default function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const FOV = 42;
    const camera = new THREE.PerspectiveCamera(
      FOV,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 5.0);

    const isSmall = window.innerWidth < 768;
    const COUNT = isSmall ? 7000 : 14000;

    // --- Fibonacci-sphere point cloud ---------------------------------------
    const positions = new Float32Array(COUNT * 3);
    const rand = new Float32Array(COUNT);
    const golden = Math.PI * (3 - Math.sqrt(5)); // golden angle
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r;
      // deterministic per-point variation (no Math.random — keeps SSR/resume calm)
      rand[i] = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      if (rand[i] < 0) rand[i] += 1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("a_rand", new THREE.BufferAttribute(rand, 1));

    const uniforms = {
      u_time: { value: 0 },
      u_dpr: { value: DPR },
      u_mouseView: { value: new THREE.Vector2(0, 0) }, // cursor in view-plane units
    };

    const NOISE_GLSL = /* glsl */ `
      vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
      vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
                   i.z + vec4(0.0, i1.z, i2.z, 1.0))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 1.0/7.0;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float u_time;
        uniform float u_dpr;
        uniform vec2 u_mouseView;
        attribute float a_rand;
        varying float vBright;
        ${NOISE_GLSL}
        void main(){
          vec3 dir = normalize(position);
          // Surface shimmer.
          float n = snoise(position * 1.6 + vec3(0.0, 0.0, u_time * 0.14));
          float radius = 1.0 + n * 0.035;
          vec3 pos = dir * radius;

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          vec3 vn = normalize(normalMatrix * dir);
          vec3 V = normalize(-mv.xyz);
          float fres = 1.0 - abs(dot(vn, V));   // 0 core .. 1 rim
          vBright = pow(fres, 1.6);

          // Cursor bulge: points near the projected cursor push outward + glow.
          vec2 ndc = mv.xy / -mv.z;
          float d = distance(ndc, u_mouseView);
          float push = smoothstep(0.5, 0.0, d) * 0.32;
          mv.xyz += vn * push;
          vBright += push * 1.4;

          gl_Position = projectionMatrix * mv;
          float twinkle = 0.85 + 0.3 * sin(u_time * 1.5 + a_rand * 30.0);
          gl_PointSize = u_dpr * (1.3 + 2.4 * vBright) * twinkle * (4.6 / -mv.z);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying float vBright;
        void main(){
          vec2 uv = gl_PointCoord - 0.5;
          float dd = length(uv);
          if (dd > 0.5) discard;
          float soft = smoothstep(0.5, 0.0, dd);
          vec3 core = vec3(0.82, 0.18, 0.20);
          vec3 rim  = vec3(1.0, 0.84, 0.80);
          float b = clamp(vBright, 0.0, 1.0);
          vec3 col = mix(core, rim, b * b);
          gl_FragColor = vec4(col, soft * (0.16 + 1.35 * vBright));
        }
      `,
    });

    const orb = new THREE.Points(geo, material);
    orb.position.y = 0.32; // lift above the bottom-left intro
    scene.add(orb);

    // Faint outer haze so the glow doesn't end hard at the rim.
    const hazeMat = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform float u_time;
        void main(){
          float d = length(vUv - 0.5) * 2.0;
          float a = pow(smoothstep(1.0, 0.0, d), 2.6);
          a *= 0.85 + 0.15 * sin(u_time * 0.5);
          gl_FragColor = vec4(vec3(0.66, 0.15, 0.17), a * 0.35);
        }
      `,
    });
    const haze = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 5.5), hazeMat);
    haze.position.set(0, 0.32, -1.0);
    scene.add(haze);

    // Fit the orb to the viewport shape: on tall/narrow (portrait phone, iPad
    // portrait) viewports, push the camera back (smaller orb) and raise it so
    // the bottom-left intro always has clear space beneath it.
    const applyLayout = () => {
      const a = camera.aspect;
      let z: number, y: number;
      if (a < 0.85) {
        z = 6.9; // portrait phone
        y = 1.05;
      } else if (a < 1.25) {
        z = 6.0; // square-ish / iPad portrait
        y = 0.62;
      } else {
        z = 5.0; // landscape / desktop
        y = 0.32;
      }
      camera.position.z = z;
      camera.updateProjectionMatrix();
      orb.position.y = y;
      haze.position.y = y;
    };
    applyLayout();

    // --- Input + responsiveness ---------------------------------------------
    const targetMouse = new THREE.Vector2(0, 0);
    const smoothMouse = new THREE.Vector2(0, 0);
    const halfTan = Math.tan((FOV * Math.PI) / 180 / 2);

    const onPointerMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      targetMouse.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -(((e.clientY - r.top) / r.height) * 2 - 1)
      );
    };
    // Touch has no resting hover: when the finger lifts (or the mouse leaves),
    // ease the cursor influence back to center so the bulge relaxes.
    const recenter = () => targetMouse.set(0, 0);
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === "touch") recenter();
    };
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      applyLayout();
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    mount.addEventListener("pointerleave", recenter, { passive: true });
    window.addEventListener("resize", onResize);

    // --- Render loop with pausing -------------------------------------------
    const clock = new THREE.Clock();
    let raf = 0;
    let running = true;

    const renderFrame = () => {
      smoothMouse.lerp(targetMouse, 0.05);
      const tEl = clock.getElapsedTime();
      uniforms.u_time.value = tEl;
      uniforms.u_mouseView.value.set(
        smoothMouse.x * halfTan * camera.aspect,
        smoothMouse.y * halfTan
      );

      orb.rotation.y = tEl * 0.05 + smoothMouse.x * 0.5;
      orb.rotation.x = -smoothMouse.y * 0.35;

      renderer.render(scene, camera);
    };

    const loop = () => {
      if (!running) return;
      renderFrame();
      raf = requestAnimationFrame(loop);
    };

    if (reduceMotion) {
      uniforms.u_time.value = 6.0;
      renderFrame();
    } else {
      loop();
    }

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };
    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      clock.start();
      loop();
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.01 }
    );
    io.observe(mount);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      mount.removeEventListener("pointerleave", recenter);
      window.removeEventListener("resize", onResize);
      geo.dispose();
      material.dispose();
      haze.geometry.dispose();
      hazeMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
