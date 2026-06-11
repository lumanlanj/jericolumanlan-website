"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Particle-solid hero: thousands of glowing red particles scattered across the
 * faces of a regular solid, shaded by their flat face normals so the facets
 * read. Additive blending makes the silhouette glow.
 *
 * Interactions:
 *  - drag to spin (with inertia that eases back into a slow auto-tumble),
 *  - double-click / double-tap to morph between shapes (icosahedron →
 *    dodecahedron → sphere → …), and
 *  - the cursor bulges + brightens the particles nearest it.
 *
 * prefers-reduced-motion → one static frame, no loop, no spin. Pauses when
 * hidden / offscreen.
 */
export default function IcosahedronCanvas({
  onDomainChange,
}: {
  /** Fired with the active shape index (0=Climate, 1=Commerce, 2=AI) on mount
   *  and every morph, so the hero callout can track the orb. */
  onDomainChange?: (index: number) => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  // Keep the latest callback without re-running the (expensive) WebGL setup.
  const domainCb = useRef(onDomainChange);
  domainCb.current = onDomainChange;

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

    // --- Shape point clouds -------------------------------------------------
    // Each shape provides COUNT (position, face-normal) pairs so we can morph
    // particle-for-particle between them. Correspondence is arbitrary — points
    // simply fly from one shape's slot to the next, which reads as a reform.
    const makeRng = (seedInit: number) => {
      let seed = seedInit;
      return () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    };

    const samplePoly = (
      geometry: THREE.BufferGeometry,
      count: number,
      rng: () => number
    ) => {
      const sp = geometry.getAttribute("position").array as Float32Array;
      const sn = geometry.getAttribute("normal").array as Float32Array;
      const tris = sp.length / 9;
      const areas = new Float32Array(tris);
      let total = 0;
      const a = new THREE.Vector3(),
        b = new THREE.Vector3(),
        c = new THREE.Vector3();
      for (let t = 0; t < tris; t++) {
        const o = t * 9;
        a.set(sp[o], sp[o + 1], sp[o + 2]);
        b.set(sp[o + 3], sp[o + 4], sp[o + 5]);
        c.set(sp[o + 6], sp[o + 7], sp[o + 8]);
        const ar = b.clone().sub(a).cross(c.clone().sub(a)).length() * 0.5;
        areas[t] = ar;
        total += ar;
      }
      const pos = new Float32Array(count * 3);
      const nrm = new Float32Array(count * 3);
      let p = 0;
      for (let t = 0; t < tris && p < count; t++) {
        const o = t * 9;
        const share =
          t === tris - 1 ? count - p : Math.round((areas[t] / total) * count);
        const nx = sn[o],
          ny = sn[o + 1],
          nz = sn[o + 2];
        for (let k = 0; k < share && p < count; k++, p++) {
          let u = rng(),
            v = rng();
          if (u + v > 1) {
            u = 1 - u;
            v = 1 - v;
          }
          const w = 1 - u - v;
          pos[p * 3] = sp[o] * w + sp[o + 3] * u + sp[o + 6] * v;
          pos[p * 3 + 1] = sp[o + 1] * w + sp[o + 4] * u + sp[o + 7] * v;
          pos[p * 3 + 2] = sp[o + 2] * w + sp[o + 5] * u + sp[o + 8] * v;
          nrm[p * 3] = nx;
          nrm[p * 3 + 1] = ny;
          nrm[p * 3 + 2] = nz;
        }
      }
      geometry.dispose();
      return { pos, nrm };
    };

    const sampleSphere = (count: number, radius: number) => {
      const pos = new Float32Array(count * 3);
      const nrm = new Float32Array(count * 3);
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const th = golden * i;
        const dx = Math.cos(th) * r,
          dz = Math.sin(th) * r;
        pos[i * 3] = dx * radius;
        pos[i * 3 + 1] = y * radius;
        pos[i * 3 + 2] = dz * radius;
        nrm[i * 3] = dx;
        nrm[i * 3 + 1] = y;
        nrm[i * 3 + 2] = dz;
      }
      return { pos, nrm };
    };

    // A tesseract (4D hypercube), surface-sampled to match the density/glow of
    // the other shapes: outer cube + inner cube + the walls connecting them.
    const sampleTesseract = (count: number, rng: () => number) => {
      const o = 0.78,
        ii = 0.42;
      const cube = (s: number) => [
        [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
        [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s],
      ];
      const verts = [...cube(o), ...cube(ii)];
      const faces = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 4, 7, 3], [1, 2, 6, 5], [0, 1, 5, 4], [3, 7, 6, 2]];
      const cubeEdges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
      const quads: number[][] = [];
      faces.forEach((f) => quads.push(f)); // outer cube
      faces.forEach((f) => quads.push(f.map((i) => i + 8))); // inner cube
      cubeEdges.forEach((e) => quads.push([e[0], e[1], e[1] + 8, e[0] + 8])); // connecting walls
      const pts: number[] = [];
      quads.forEach((q) => {
        const A = verts[q[0]], B = verts[q[1]], C = verts[q[2]], D = verts[q[3]];
        pts.push(...A, ...B, ...C, ...A, ...C, ...D);
      });
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
      g.computeVertexNormals();
      return samplePoly(g, count, rng);
    };

    const rng = makeRng(0x9e3779b9);
    // Each shape maps to a domain Jerico works across:
    // 0 · Climate (sphere) → 1 · Commerce (dodecahedron) → 2 · AI (tesseract).
    const SHAPES = [
      sampleSphere(COUNT, 1.06),
      samplePoly(new THREE.DodecahedronGeometry(1.18, 0), COUNT, rng),
      sampleTesseract(COUNT, rng),
    ];
    let shapeIndex = 0;
    domainCb.current?.(0);

    // A = current shape, B = morph target; u_morph blends A→B in the shader.
    const posA = SHAPES[0].pos.slice();
    const nrmA = SHAPES[0].nrm.slice();
    const posB = SHAPES[0].pos.slice();
    const nrmB = SHAPES[0].nrm.slice();

    const attrPosA = new THREE.BufferAttribute(posA, 3);
    const attrNrmA = new THREE.BufferAttribute(nrmA, 3);
    const attrPosB = new THREE.BufferAttribute(posB, 3);
    const attrNrmB = new THREE.BufferAttribute(nrmB, 3);

    const rand = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      rand[i] = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      if (rand[i] < 0) rand[i] += 1;
    }

    const geo = new THREE.BufferGeometry();
    // `position` exists only so three knows the point count; the shader builds
    // the real position from a_posA/a_posB.
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3)
    );
    geo.setAttribute("a_posA", attrPosA);
    geo.setAttribute("a_nrmA", attrNrmA);
    geo.setAttribute("a_posB", attrPosB);
    geo.setAttribute("a_nrmB", attrNrmB);
    geo.setAttribute("a_rand", new THREE.BufferAttribute(rand, 1));

    const uniforms = {
      u_time: { value: 0 },
      u_dpr: { value: DPR },
      u_morph: { value: 0 },
      u_mouseView: { value: new THREE.Vector2(0, 0) },
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
        vec4 pp = permute(permute(permute(
                   i.z + vec4(0.0, i1.z, i2.z, 1.0))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 1.0/7.0;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = pp - 49.0 * floor(pp * ns.z *ns.z);
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
        uniform float u_morph;
        uniform vec2 u_mouseView;
        attribute float a_rand;
        attribute vec3 a_posA;
        attribute vec3 a_posB;
        attribute vec3 a_nrmA;
        attribute vec3 a_nrmB;
        varying float vBright;
        ${NOISE_GLSL}
        void main(){
          // Blend between the current shape (A) and the morph target (B).
          vec3 P = mix(a_posA, a_posB, u_morph);
          vec3 nrm = normalize(mix(a_nrmA, a_nrmB, u_morph));

          float n = snoise(P * 1.6 + vec3(0.0, 0.0, u_time * 0.14));
          vec3 pos = P + nrm * n * 0.045;

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          vec3 vn = normalize(normalMatrix * nrm);
          vec3 V = normalize(-mv.xyz);
          float fres = 1.0 - abs(dot(vn, V));
          vBright = pow(fres, 1.6);

          vec2 ndc = mv.xy / -mv.z;
          float d = distance(ndc, u_mouseView);
          float push = smoothstep(0.5, 0.0, d) * 0.32;
          mv.xyz += vn * push;
          vBright += push * 1.4;

          // Mid-morph sparkle so the reform reads as energetic.
          vBright += sin(u_morph * 3.14159) * 0.35;

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

    const solid = new THREE.Points(geo, material);
    solid.frustumCulled = false; // dummy `position` => skip bounding-sphere cull
    solid.position.y = 0.32;
    scene.add(solid);

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

    const applyLayout = () => {
      const a = camera.aspect;
      let z: number, y: number;
      if (a < 0.85) {
        z = 6.9;
        y = 1.05;
      } else if (a < 1.25) {
        z = 6.0;
        y = 0.62;
      } else {
        z = 5.0;
        y = 0.32;
      }
      camera.position.z = z;
      camera.updateProjectionMatrix();
      solid.position.y = y;
      haze.position.y = y;
    };
    applyLayout();

    // --- Shape morphing -----------------------------------------------------
    const MORPH_DUR = 0.95; // seconds
    let morphing = false;
    let morphT = 0;
    const smoothstep = (x: number) => x * x * (3 - 2 * x);

    // Auto-cycle the orb through its three domains every 7s (idle, no input).
    let autoTimer: ReturnType<typeof setTimeout> | null = null;
    const AUTO_INTERVAL = 7000;
    const scheduleAuto = () => {
      if (reduceMotion) return;
      if (autoTimer) clearTimeout(autoTimer);
      autoTimer = setTimeout(() => cycleShape(), AUTO_INTERVAL);
    };

    const cycleShape = () => {
      if (morphing) {
        scheduleAuto();
        return;
      }
      const next = (shapeIndex + 1) % SHAPES.length;
      posB.set(SHAPES[next].pos);
      nrmB.set(SHAPES[next].nrm);
      attrPosB.needsUpdate = true;
      attrNrmB.needsUpdate = true;
      morphing = true;
      morphT = 0;
      shapeIndex = next;
      domainCb.current?.(next);
      scheduleAuto();
      if (!running) start(); // wake the loop if it was idle
    };

    // --- Drag-to-spin + inertia + cursor bulge ------------------------------
    const targetMouse = new THREE.Vector2(0, 0);
    const smoothMouse = new THREE.Vector2(0, 0);
    const halfTan = Math.tan((FOV * Math.PI) / 180 / 2);

    const AUTO_X = 0.05,
      AUTO_Y = 0.12; // idle tumble (rad/s)
    const SENS = 0.006; // rad per px of drag
    const MAX_VEL = 8; // clamp fling speed (rad/s)
    const DECAY_TAU = 0.7; // inertia → auto ease (s)
    let rotX = 0,
      rotY = 0,
      velX = AUTO_X,
      velY = AUTO_Y;
    let dragging = false;
    let lastPX = 0,
      lastPY = 0,
      lastT = 0,
      downX = 0,
      downY = 0,
      lastTapT = 0;

    const now = () => performance.now();

    const onPointerMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      targetMouse.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -(((e.clientY - r.top) / r.height) * 2 - 1)
      );
      if (dragging) {
        const t = now();
        const dt = Math.max(8, t - lastT) / 1000;
        const dx = e.clientX - lastPX;
        const dy = e.clientY - lastPY;
        rotY += dx * SENS;
        rotX += dy * SENS;
        const clamp = (v: number) => Math.max(-MAX_VEL, Math.min(MAX_VEL, v));
        velY = clamp(velY * 0.4 + (dx * SENS) / dt * 0.6);
        velX = clamp(velX * 0.4 + (dy * SENS) / dt * 0.6);
        lastPX = e.clientX;
        lastPY = e.clientY;
        lastT = t;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      mount.style.cursor = "grabbing";
      lastPX = downX = e.clientX;
      lastPY = downY = e.clientY;
      lastT = now();
    };

    const endDrag = () => {
      dragging = false;
      mount.style.cursor = "";
    };

    const onPointerUp = (e: PointerEvent) => {
      if (dragging) endDrag();
      const moved =
        Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY);
      // Double-tap (touch) → cycle shape. Mouse uses native dblclick below.
      if (e.pointerType === "touch") {
        const t = now();
        if (t - lastTapT < 320 && moved < 14) {
          cycleShape();
          lastTapT = 0;
        } else {
          lastTapT = t;
        }
        if (moved < 6) targetMouse.set(0, 0); // relax bulge on a clean tap
      }
    };

    const onPointerCancel = () => {
      endDrag();
      targetMouse.set(0, 0);
    };
    const onDblClick = () => cycleShape();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      applyLayout();
    };

    mount.addEventListener("pointerdown", onPointerDown, { passive: true });
    mount.addEventListener("dblclick", onDblClick);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerCancel, { passive: true });
    window.addEventListener("resize", onResize);

    // --- Render loop with pausing -------------------------------------------
    const clock = new THREE.Clock();
    let prevT = 0;
    let raf = 0;
    let running = true;

    const renderFrame = () => {
      smoothMouse.lerp(targetMouse, 0.05);
      const tEl = clock.getElapsedTime();
      const dt = Math.min(0.05, tEl - prevT);
      prevT = tEl;

      uniforms.u_time.value = tEl;
      uniforms.u_mouseView.value.set(
        smoothMouse.x * halfTan * camera.aspect,
        smoothMouse.y * halfTan
      );

      if (morphing) {
        morphT += dt / MORPH_DUR;
        if (morphT >= 1) {
          // Land on B: copy it into A and reset the blend so A is shown.
          posA.set(SHAPES[shapeIndex].pos);
          nrmA.set(SHAPES[shapeIndex].nrm);
          attrPosA.needsUpdate = true;
          attrNrmA.needsUpdate = true;
          uniforms.u_morph.value = 0;
          morphing = false;
        } else {
          uniforms.u_morph.value = smoothstep(morphT);
        }
      }

      // Spin: drag controls rotation directly; otherwise inertia decays to auto.
      if (!dragging) {
        const k = 1 - Math.exp(-dt / DECAY_TAU);
        velX += (AUTO_X - velX) * k;
        velY += (AUTO_Y - velY) * k;
        rotX += velX * dt;
        rotY += velY * dt;
      }
      solid.rotation.set(rotX, rotY, 0);

      renderer.render(scene, camera);
    };

    const loop = () => {
      if (!running) return;
      renderFrame();
      raf = requestAnimationFrame(loop);
    };

    function start() {
      if (running || reduceMotion) return;
      running = true;
      clock.start();
      loop();
      scheduleAuto();
    }
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
      if (autoTimer) clearTimeout(autoTimer);
    };

    if (reduceMotion) {
      running = false;
      uniforms.u_time.value = 6.0;
      renderFrame();
    } else {
      loop();
      scheduleAuto();
    }

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.01 }
    );
    io.observe(mount);

    return () => {
      stop();
      if (autoTimer) clearTimeout(autoTimer);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      mount.removeEventListener("pointerdown", onPointerDown);
      mount.removeEventListener("dblclick", onDblClick);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
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

  // Positioning + touch/cursor live in the `#orb` rule in globals.css so the
  // mobile layout can re-flow it (absolute full-bleed on desktop → contained
  // flex item on phones).
  return <div id="orb" ref={mountRef} aria-hidden="true" />;
}
