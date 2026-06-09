"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Shot } from "@/lib/dribbble";

// A single shot tile. Animated shots (MP4) autoplay muted/looping like a GIF,
// but fall back to the still poster when the user prefers reduced motion.
export default function DribbbleCard({ shot }: { shot: Shot }) {
  const [animate, setAnimate] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setAnimate(!mq.matches && !!shot.video);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [shot.video]);

  return (
    <a
      href={shot.url}
      target="_blank"
      rel="noopener"
      className="group block no-underline"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-(--color-border) bg-(--color-border)/40">
        {animate && shot.video ? (
          <video
            ref={videoRef}
            src={shot.video}
            poster={shot.image ?? undefined}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : shot.image ? (
          <Image
            src={shot.image}
            alt={shot.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : null}

        {shot.video && (
          <span
            className="absolute right-2.5 top-2.5 rounded-full bg-black/55 px-2 py-0.5
                       font-mono text-[10px] uppercase tracking-[0.12em] text-white/90
                       backdrop-blur-sm"
          >
            Motion
          </span>
        )}
      </div>

      <p className="mt-3 text-[14px] md:text-[15px] leading-snug text-(--color-bio) group-hover:text-(--color-ink) transition">
        {shot.title}
      </p>
    </a>
  );
}
