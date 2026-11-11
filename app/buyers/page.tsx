import type { Metadata } from "next";
import BuyerStepsForm from "@/components/landing/BuyerStepsForm";
import Reveal from "@/components/landing/Reveal";
import { LandingFooter, LandingLockup } from "@/components/landing/LandingChrome";
import { site } from "@/content/site";
import "../landing.css";

/*
 * Buyer ad landing page (squeeze page): no navigation, one form, proof below.
 * `noindex, follow` because it targets the same intent as /buy; Google Ads
 * does not need it indexed and AdsBot can still reach it.
 *
 * Everything client-specific comes from the config: site.landing for the
 * market and accents, site.stats for proof, site.about.blocks for the bio.
 */

const landing = site.landing;
const firstName = site.footer.agentName.split(" ")[0];
const serviceArea = landing?.serviceArea ?? "";
const communityLabels = landing?.communities.map((c) => c.label) ?? [];
const communityLine =
  communityLabels.length > 1
    ? `${communityLabels.slice(0, -1).join(", ")}, or ${communityLabels[communityLabels.length - 1]}`
    : communityLabels[0] ?? serviceArea;

export const metadata: Metadata = {
  title: `Find Your ${serviceArea} Home | ${site.footer.agentName}`,
  description: `Tell ${site.footer.agentName} of ${site.footer.brokerage} what you're looking for and get a curated search across ${communityLabels.join(", ")}.`,
  robots: { index: false, follow: true },
  alternates: { canonical: "/buyers" },
};

const STEPS = [
  {
    title: `Tell ${firstName} What You're Looking For`,
    body: "Budget, timeline, and the life you want: the neighborhoods you love, top-rated schools, a big yard, room for family, or privacy and a view.",
  },
  {
    title: "Get a Curated, Insider Search",
    body: `${firstName} narrows ${serviceArea} to genuinely strong matches, including homes before they hit the portals, and flags the details that matter: school boundaries, lot size, HOAs, and more.`,
  },
  {
    title: "Tour and Offer With Confidence",
    body: "Private showings on your schedule, honest guidance on value, and offers structured to win in a competitive market without overpaying.",
  },
  {
    title: "Close With a Clear Plan",
    body: "Inspections scheduled fast, contingencies and timelines managed, and steady communication from contract to keys, so nothing surprises you at closing.",
  },
];

const DEFAULT_POINTS = [
  {
    title: "The Team",
    body: `${site.footer.brokerage}, serving buyers across ${communityLabels.join(", ")}.`,
  },
  {
    title: "The Standard",
    body: "A personalized, organized, proactive process: clear communication, transparent advice, and offers structured to protect your interests.",
  },
  {
    title: "The Advantage",
    body: "Deep local relationships that surface homes early, and the negotiating experience to make your offer the one that wins.",
  },
];

export default function BuyersPage() {
  const phone = site.contact?.phone ?? "";
  const phoneHref = `tel:${phone.replace(/[^+\d]/g, "")}`;
  const stats = site.stats ?? [];
  const points = landing?.brokeragePoints ?? DEFAULT_POINTS;
  const bio = site.about.blocks.filter((b) => b.text).slice(0, 2);

  return (
    <div
      className="lp"
      style={
        {
          "--lp-accent": landing?.accent,
          "--lp-accent-light": landing?.accentLight,
          "--lp-accent-pale": landing?.accentPale,
        } as React.CSSProperties
      }
    >
      {/* Hero: lockup, pitch, two-step form, proof strip */}
      <section className="bq-hero">
        <div className="bq-hero__bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={landing?.buyersImage ?? site.hero.image} alt={`Home in ${serviceArea}`} />
        </div>
        <div className="bq-hero__scrim" />
        <div className="bq-hero__inner">
          <div className="bq-hero__logo">
            <a href="/" aria-label={site.brand.name}><LandingLockup tone="light" /></a>
          </div>

          <div className="bq-hero__grid">
            <div className="bq-hero__head">
              <p className="bq-eyebrow bq-eyebrow--light">{serviceArea}</p>
              <h1 className="bq-title">{landing?.buyersTitle ?? "Find your next home."}</h1>
              <p className="bq-lede">
                Tell {firstName} where to reach you and get matched with the right home in {communityLine}.
              </p>
            </div>
            <div className="bq-hero__details">
              <ul className="bq-bullets">
                <li>Homes matched to your budget, must-haves, and the way your family lives</li>
                <li>Early access to homes before they reach the portals</li>
                <li>Clear next steps from first tour to closing, including relocations from out of state</li>
              </ul>
              <p className="bq-trust">
                <span aria-hidden="true">★★★★★</span>
                {site.brand.tagline}{landing?.designations?.[0] ? ` · ${landing.designations[0]}` : ""}
              </p>
            </div>
            <div className="bq-hero__form">
              <BuyerStepsForm />
            </div>
          </div>

          <div className="bq-stats">
            {stats.slice(0, 2).map((stat) => (
              <div key={stat.label}>
                <p className="bq-stat__value">{stat.value}</p>
                <p className="bq-stat__label">{stat.label}</p>
              </div>
            ))}
            {communityLabels.length > 0 && (
              <div>
                <p className="bq-stat__value">{communityLabels.length}</p>
                <p className="bq-stat__label">Communities served: {communityLabels.join(" · ")}</p>
              </div>
            )}
            <div>
              <p className="bq-stat__value">{site.footer.brokerage}</p>
              <p className="bq-stat__label">{landing?.tagline ?? site.brand.tagline}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the agent */}
      <section className="bq-agent">
        <div className="lp__wrap">
          <div className="bq-agent__grid">
            <Reveal>
              <div className="bq-portrait">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={landing?.portrait ?? site.about.image} alt={site.footer.agentName} />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <p className="bq-eyebrow">Meet Your Agent</p>
              <h2 className="bq-agent__name">{site.footer.agentName}</h2>
              <p className="bq-agent__creds">
                {landing?.designations?.length ? `${landing.designations.join(" · ")}, ` : ""}
                {site.footer.brokerage}
                {site.legal?.licenseNumber ? ` · License # ${site.legal.licenseNumber}` : ""}
              </p>
              {bio.map((block) => (
                <p className="bq-agent__body" key={block.text.slice(0, 24)}>{block.text}</p>
              ))}
              {landing?.tagline && <p className="bq-agent__tagline">{landing.tagline}</p>}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Brokerage authority */}
      <section className="bq-brand">
        <div className="bq-brand__bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={landing?.brandImage ?? site.cta.image} alt="" />
        </div>
        {site.brand.decal && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="bq-brand__decal" src={site.brand.decal} alt="" aria-hidden="true" />
        )}
        <Reveal className="bq-brand__inner">
          <div className="bq-brand__bar" />
          <p className="bq-eyebrow bq-eyebrow--light">{site.footer.brokerage}</p>
          <h2 className="bq-brand__title">
            A trusted name, <em>rooted in {serviceArea}.</em>
          </h2>
          <p className="bq-brand__sub">
            The reach of an established brokerage, with an agent who knows these streets.
          </p>
          <div className="bq-points">
            {points.map((point, i) => (
              <div className="bq-point" key={point.title}>
                <span className="bq-point__num">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="bq-point__title">{point.title}</p>
                  <p className="bq-point__body">{point.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bq-serving">
            <p className="bq-serving__label">Serving</p>
            <ul className="bq-serving__list">
              {communityLabels.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* Process */}
      <section className="bq-process">
        <div className="lp__wrap">
          <Reveal className="bq-process__head">
            <h2 className="bq-h2 bq-h2--dark">From first conversation to <em>keys in hand.</em></h2>
            <p className="bq-process__sub">
              A straightforward buying experience with clear advice at every decision, even
              if you are moving from out of state.
            </p>
          </Reveal>
          <div className="bq-steps">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 100} className="bq-step">
                <p className="bq-step__num">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="bq-step__title">{step.title}</h3>
                <p className="bq-step__body">{step.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bq-cta">
        <Reveal className="bq-cta__inner">
          <h2 className="bq-h2">Ready to <em>get started?</em></h2>
          <p className="bq-cta__sub">Call or text {firstName} directly, or send a message.</p>
          <div className="bq-cta__actions">
            <a className="bq-btn bq-btn--solid" href={phoneHref}>{phone}</a>
            <a className="bq-btn bq-btn--ghost" href={`mailto:${site.contact?.email}`}>Send a Message</a>
          </div>
          <p className="bq-cta__address">
            {site.footer.agentName} · {site.footer.brokerage} · {site.footer.addressLines.join(", ")}
            {site.legal?.licenseNumber ? ` · License # ${site.legal.licenseNumber}` : ""}
          </p>
        </Reveal>
      </section>

      <LandingFooter advertisement />
    </div>
  );
}
