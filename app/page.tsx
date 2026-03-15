"use client";

import { useRouter } from "next/navigation";
import { type CSSProperties } from "react";

const stars = [
  { top: "8%", left: "12%", size: 2 },
  { top: "14%", left: "74%", size: 3 },
  { top: "22%", left: "45%", size: 2 },
  { top: "30%", left: "88%", size: 2 },
  { top: "36%", left: "18%", size: 3 },
  { top: "42%", left: "58%", size: 2 },
  { top: "50%", left: "8%", size: 2 },
  { top: "58%", left: "80%", size: 3 },
  { top: "66%", left: "38%", size: 2 },
  { top: "74%", left: "60%", size: 2 },
  { top: "82%", left: "24%", size: 3 },
  { top: "88%", left: "92%", size: 2 },
];

export default function Home() {
  const router = useRouter();

  function handleOpenDashboard() {
    router.push("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020a06] px-6 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,197,94,0.26),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_75%,rgba(20,83,45,0.42),transparent_40%)]" />
      <div className="absolute left-6 right-6 top-5 border-t border-emerald-300/25" />

      {stars.map((star, index) => (
        <span
          key={index}
          className="home-star"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size * 4}px`,
            height: `${star.size * 4}px`,
            animationDelay: `${index * 70}ms`,
          } as CSSProperties}
        />
      ))}

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1400px] flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.26em] text-emerald-200/70">Catch-up Slack Bot</p>
        <h1 className="mt-2 max-w-[94vw] text-[min(23vw,250px)] font-semibold leading-[0.9] tracking-[-0.03em] text-emerald-50">
          Momentum
        </h1>

        <div className="mt-5 max-w-2xl">
          <p className="text-base text-emerald-100/80 md:text-lg">
            Review thread analysis, approve next actions, and ship updates without context switching.
          </p>
          <button
            onClick={handleOpenDashboard}
            className="mt-6 rounded-xl border border-emerald-400/70 bg-emerald-500/20 px-6 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-500/35"
          >
            Open Dashboard
          </button>
        </div>
      </section>
    </main>
  );
}
