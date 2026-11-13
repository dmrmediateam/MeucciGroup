"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteContent } from "@/content/site";

/* ==========================================================================
   Seasons hero: a slow four-season crossfade of the valley with an
   editorial, left-anchored statement and a season index. Replaces the
   centered classic hero for clients whose market sells on its seasons.
   ========================================================================== */

const INTERVAL = 6800;

export default function SeasonsHero({ hero }: { hero: SiteContent["hero"] }) {
  const slides = hero.slides && hero.slides.length > 0 ? hero.slides : [{ image: hero.image, label: "", caption: "" }];
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (slides.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const start = () => {
      timer.current = window.setInterval(() => {
        setActive((a) => (a + 1) % slides.length);
        setCycle((c) => c + 1);
      }, INTERVAL);
    };
    // hold the first frame while the splash plays
    const splashing = document.documentElement.classList.contains("splash-on");
    const t = window.setTimeout(start, splashing ? 3200 : 0);
    return () => {
      window.clearTimeout(t);
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [slides.length, cycle === -1]);

  const goTo = (i: number) => {
    setActive(i);
    setCycle((c) => c + 1);
    if (timer.current) {
      window.clearInterval(timer.current);
      timer.current = window.setInterval(() => {
        setActive((a) => (a + 1) % slides.length);
        setCycle((c) => c + 1);
      }, INTERVAL);
    }
  };

  const current = slides[active];

  return (
    <section className="video-section sv-hero" aria-label={hero.title}>
      <div className="sv-hero__media" aria-hidden="true">
        {slides.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.image}
            src={s.image}
            alt=""
            className={`sv-hero__slide${i === active ? " is-active" : ""}`}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding="async"
          />
        ))}
        <div className="sv-hero__shade" />
      </div>

      <div className="sv-hero__content lp-container">
        <div className="sv-hero__block">
          <span className="sv-hero__rule" aria-hidden="true" />
          <div className="sv-hero__text">
            <h5 className="pre-title sv-hero__pre">{hero.preTitle}</h5>
            <h1 className="sv-hero__title">{hero.title}</h1>
            {hero.lead && <p className="sv-hero__lead">{hero.lead}</p>}
            {hero.ctas && hero.ctas.length > 0 && (
              <div className="sv-hero__actions">
                {hero.ctas.map((c, i) => (
                  <a key={c.label} href={c.href} className={`sv-btn${i === 0 ? "" : " sv-btn--ghost"}`}>
                    <span>{c.label}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 12h15" /><path d="M13 6l6 6-6 6" /></svg>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="sv-hero__index" role="tablist" aria-label="Seasons">
          <div className="sv-hero__caption" key={`cap-${active}`}>
            <span className="sv-hero__caption-season">{current.label}</span>
            {current.caption && <span className="sv-hero__caption-place">{current.caption}</span>}
          </div>
          <div className="sv-hero__dots">
            {slides.map((s, i) => (
              <button
                key={s.label + i}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={s.label}
                className={`sv-hero__dot${i === active ? " is-active" : ""}`}
                onClick={() => goTo(i)}
              >
                <span className="sv-hero__dot-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="sv-hero__dot-bar">
                  {i === active && <span className="sv-hero__dot-fill" key={cycle} style={{ animationDuration: `${INTERVAL}ms` }} />}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <a href="#after-hero" className="sv-hero__scroll" aria-label="Scroll down">
        <span>Scroll</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
}
