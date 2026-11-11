"use client";

import { useEffect, useState } from "react";

/* ==========================================================================
   First-load splash: brand white, the collaborative logo blur-reveals, a
   short red line draws beneath it, then the panel lifts to reveal the hero.
   Shown once per browser session; skipped for reduced-motion users.
   ========================================================================== */

const KEY = "mm-splash-seen";
const HOLD = 2500;
const OUT = 950;

// Runs before paint so the splash is never a flash and never shows twice.
const boot = `(function(){try{var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(!r&&!sessionStorage.getItem('${KEY}')){document.documentElement.classList.add('splash-on');}}catch(e){}})();`;

export default function Splash({ logo, line }: { logo: string; line: string }) {
  const [phase, setPhase] = useState<"idle" | "out" | "done">("idle");

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("splash-on")) {
      setPhase("done");
      return;
    }
    const t1 = window.setTimeout(() => setPhase("out"), HOLD);
    const t2 = window.setTimeout(() => {
      root.classList.remove("splash-on");
      try { sessionStorage.setItem(KEY, "1"); } catch {}
      setPhase("done");
    }, HOLD + OUT);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, []);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: boot }} />
      {phase !== "done" && (
        <div className={`splash${phase === "out" ? " splash--out" : ""}`} aria-hidden="true">
          <div className="splash__inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="" className="splash__logo" />
            <span className="splash__line" />
            <span className="splash__tag">{line}</span>
          </div>
        </div>
      )}
    </>
  );
}
