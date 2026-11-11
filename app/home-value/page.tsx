import type { Metadata } from "next";
import ValuationForm from "@/components/landing/ValuationForm";
import FaqAccordion from "@/components/landing/FaqAccordion";
import Reveal from "@/components/landing/Reveal";
import { LandingFooter, LandingHeader } from "@/components/landing/LandingChrome";
import { site } from "@/content/site";
import "../landing.css";

/*
 * Seller ad landing page. Deliberately `noindex, follow`: it targets the same
 * intent as /sell, and two pages competing for "[market] home value" split
 * the signal. Google Ads does not require indexation.
 *
 * Everything client-specific comes from the config: site.landing for the
 * market and accents, site.stats for proof, site.about.blocks for the bio.
 */

const landing = site.landing;
const firstName = site.footer.agentName.split(" ")[0];
const serviceArea = landing?.serviceArea ?? "";

export const metadata: Metadata = {
  title: `What's Your ${serviceArea} Home Worth? | ${site.footer.agentName}`,
  description: `Request a personal home value analysis from ${site.footer.agentName} of ${site.footer.brokerage}, grounded in current ${serviceArea} sales.`,
  robots: { index: false, follow: true },
  alternates: { canonical: "/home-value" },
};

const FAQS = [
  {
    q: "How is this different from an online estimate?",
    a: `Automated estimates can't see your renovation quality, views, lot size and usability, school boundaries, or how your street actually shows. ${firstName} evaluates your home the way buyers do and prices it against what is actually selling in ${serviceArea} right now.`,
  },
  {
    q: "What if I'm not selling right away?",
    a: "That's perfectly fine. Many homeowners simply want to understand their position in the market. There's no obligation, and an early conversation often leads to better timing and preparation decisions.",
  },
  {
    q: "I need to sell and buy at the same time. Can you help?",
    a: `Yes. ${firstName} has guided families through contingent moves where both sides had moving parts, coordinating timelines, inspections, and negotiations so both transactions stay on track.`,
  },
  {
    q: "Is my information kept confidential?",
    a: "Completely. Your details are shared with no one, and discretion is standard practice.",
  },
  {
    q: "How quickly will I hear back?",
    a: `${firstName} personally reviews every request and typically responds the same day with next steps or your completed analysis.`,
  },
  {
    q: "What if I'd rather just talk it through?",
    a: `Call or text ${site.contact?.phone} any time. A short conversation about your home, the current market, and your goals is often the best starting point.`,
  },
];

export default function HomeValuePage() {
  const [years, volume, closings] = site.stats ?? [];
  const prose = site.about.blocks.filter((b) => b.text).slice(0, 2);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <LandingHeader />

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero__bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={landing?.homeValueImage ?? site.hero.image} alt={`Home in ${serviceArea}`} />
        </div>
        <div className="lp-hero__scrim" />
        <div className="lp-hero__inner">
          <div className="lp-hero__copy">
            <p className="lp-hero__eyebrow">{serviceArea}</p>
            <h1 className="lp-hero__title">
              {landing?.homeValueTitle ?? "Find Out What Your Home Is Worth Today"}
            </h1>
            <p className="lp-hero__lede">
              A personal valuation from a local specialist, shaped by real buyer demand,
              recent comparable sales, and the details that make your home stand out. Not a
              generic algorithm.
            </p>
            <p className="lp-hero__tagline">{landing?.tagline}</p>
          </div>
          <div className="lp-hero__form">
            <ValuationForm />
          </div>
        </div>
      </section>

      {/* Agent profile */}
      <section className="lp__section lp__section--cream">
        <div className="lp__wrap">
          <div className="lp-agent">
            <Reveal>
              <div className="lp-agent__frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={landing?.portrait ?? site.about.image} alt={site.footer.agentName} />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="lp-agent__name">{site.footer.agentName}</h2>
              <p className="lp-agent__creds">
                {landing?.designations?.length ? `${landing.designations.join(" · ")} · ` : ""}
                {site.footer.brokerage}
                {site.legal?.licenseNumber ? ` · License # ${site.legal.licenseNumber}` : ""}
              </p>
              <p className="lp-agent__body">
                Pricing grounded in current comparables, presentation that earns showings,
                and steady communication from the first walkthrough to closing, backed by
                the marketing reach of {site.footer.brokerage}.
              </p>
              <div className="lp-agent__stats">
                {[years, volume, closings].filter(Boolean).map((stat) => (
                  <div className="lp-agent__stat" key={stat.label}>
                    <p>{stat.value}</p>
                    <p>{stat.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Value proposition */}
      <section className="lp__section lp__section--white">
        <div className="lp__wrap">
          <Reveal className="lp-prose">
            <h2 className="lp-prose__title">
              A valuation shaped by <em>real buyer demand</em>, not a generic algorithm.
            </h2>
            <div className="lp-prose__body">
              <p>
                In {serviceArea}, value lives in the details: the view from the terrace,
                walkable streets, school boundaries, a usable yard, and how a home actually
                shows. Two homes on the same street can sell very differently, and no
                automated estimate can see why.
              </p>
              {prose[0] && <p>{prose[0].text}</p>}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQs */}
      <section className="lp__section lp__section--cream">
        <div className="lp__wrap">
          <Reveal>
            <h2 className="lp-prose__title" style={{ textAlign: "center" }}>
              Before you request <em>your number</em>.
            </h2>
            <FaqAccordion items={FAQS} />
          </Reveal>
        </div>
      </section>

      {/* Social proof band */}
      <section className="lp-band">
        <div className="lp__wrap">
          <Reveal className="lp-band__grid">
            {[volume, years].filter(Boolean).map((stat) => (
              <div key={stat.label}>
                <p className="lp-band__stat">{stat.value}</p>
                <p className="lp-band__label">{stat.label}</p>
              </div>
            ))}
            <div>
              <p className="lp-band__stat">{site.footer.brokerage}</p>
              <p className="lp-band__label">{landing?.tagline ?? site.brand.tagline}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Communities */}
      <section className="lp__section--white">
        <div className="lp__wrap">
          <Reveal className="lp-communities">
            <h2 className="lp-communities__eyebrow">Communities</h2>
            <p className="lp-communities__list">
              {landing?.communities.map((c) => (
                <span key={c.label}>{c.label}</span>
              ))}
            </p>
            <p className="lp-communities__foot">Serving All of {serviceArea}</p>
          </Reveal>
        </div>
      </section>

      <LandingFooter advertisement />
    </div>
  );
}
