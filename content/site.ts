/* ==========================================================================
   Site content — everything rendered on the page lives here.
   Swap this file's values per client; no component edits needed.
   ========================================================================== */

export interface NavLink {
  label: string;
  href: string;
}

export interface GalleryCard {
  /** Small letterspaced line above the title (omit to hide) */
  preTitle?: string;
  title: string;
  /** Underlined line below the title (omit to hide) */
  cta?: string;
  /** Longer text revealed on hover (overlay-style cards, e.g. areas) */
  description?: string;
  href: string;
  image: string;
}

export interface Listing {
  price: string;
  address: string;
  /** Matches the search filter values: single-family, condominium, townhouse, land */
  propertyType?: string;
  beds?: string;
  baths?: string;
  sqft?: string;
  /** e.g. "For Sale", "Pending", "Sold" */
  status?: string;
  mls?: string;
  image: string;
  href: string;
}

export interface TeamMember {
  name: string;
  /** e.g. "Founder & Lead Agent", "Buyer Specialist" */
  role: string;
  image: string;
  phone?: string;
  email?: string;
  license?: string;
  /** 1-2 sentence bio shown on the roster card */
  bio?: string;
  /** Optional link to a fuller profile (a standard SubPage works well) */
  href?: string;
}

export interface SubPage {
  /** URL segment, e.g. "buy" */
  slug: string;
  /** "standard" = editorial; "search" = IDX search; "connect" = contact; "listings" = listing grid; "team" = roster */
  type?: "standard" | "search" | "connect" | "listings" | "team";
  title: string;
  preTitle?: string;
  heroImage: string;
  intro?: string[];
  /** Alternating image/text split sections */
  sections?: { heading: string; text: string; image?: string }[];
  cta?: { label: string; href: string };
  /** Append the client's listings grid to a standard page (e.g. buy) */
  showListings?: boolean;
  /** Render the working property search (filters + results) on this page */
  search?: boolean;
  /** Compact search form (hands off to /listings), e.g. on the buy page */
  searchPanel?: { kicker?: string; title?: string };
  /** Grid of the agent's sold listings, e.g. on the sell page */
  recentClosings?: { intro?: string };
  /** Override the heading over the showListings grid */
  listingsHeading?: { kicker?: string; title?: string };
  /** Prepend the 3-step "What's your property worth?" wizard (e.g. sell) */
  valuation?: boolean;
  /** Full-bleed background for the valuation wizard (defaults to heroImage) */
  valuationImage?: string;
}

export interface SiteContent {
  /**
   * Which homepage design this client uses. Interior pages are shared;
   * the homepage carries the visual identity.
   * "classic" - light, centered serif hero, floating search card (default)
   * "noir"    - dark cinematic gallery: Ken Burns hero, listings rail
   * "estate"  - bright architectural split hero, marquee, hover showcase
   */
  homeVariant?: "classic" | "noir" | "estate";
  /** Brand palette — injected as CSS variables, overrides the defaults in globals.css */
  theme: {
    /** Primary brand color: headings, buttons, accents (original: #004F71) */
    primary: string;
    /** Secondary/muted color: body text, hero overlay tint (original: #88786A) */
    secondary: string;
    /** Page background (original: #FBF9F7) */
    background: string;
    /** Optional sparing accent (red lines, hover marks). Defaults to primary */
    accent?: string;
  };
  brand: {
    /** Wordmark text in the header and footer (used when no logo images) */
    name: string;
    tagline: string;
    /**
     * Optional logo images. `light` shows over the transparent hero nav,
     * `dark` shows on the scrolled white nav and can be reused in the footer.
     */
    logo?: { light: string; dark: string };
    /**
     * Brokerage logo shown under the agent name in the header and footer,
     * sized slightly wider than the name so the brokerage leads.
     */
    brokerageLogo?: { light: string; dark: string };
    /** Brokerage emblem pinned to the bottom-right of the homepage hero */
    emblem?: string;
    /** Large faint mark used as a background decal on the homepage */
    decal?: string;
    /** Where the header logo links. Defaults to "/"; set per client scope. */
    homeHref?: string;
  };
  meta: {
    title: string;
    description: string;
    /** Production origin, no trailing slash (canonicals, sitemap, JSON-LD) */
    siteUrl?: string;
  };
  /**
   * Ad + analytics wiring. The Google Ads conversion id and labels are NOT
   * secrets (they ship in the page source of every site that uses them), so
   * they live here rather than in env and tracking works on deploy.
   * NEXT_PUBLIC_GTM_ID / _GA4_ID / _GOOGLE_ADS_ID still override.
   */
  analytics?: {
    /** Google Ads conversion id, e.g. "AW-17640808645" */
    googleAdsId?: string;
    /** GA4 measurement id, e.g. "G-XXXXXXXXXX" */
    ga4Id?: string;
    /** Maps our semantic events to Google Ads conversion labels */
    conversions?: Partial<Record<string, string>>;
  };
  hero: {
    preTitle: string;
    title: string;
    /** Optional background video; the image is used as poster/fallback */
    video?: {
      webm?: string;
      mp4?: string;
      /** Vertical cut served to portrait phones (sharper and lighter than cropping the landscape file) */
      mobileMp4?: string;
    };
    image: string;
    /** One sentence under the headline (seasons hero) */
    lead?: string;
    /** Up to two buttons under the lead (first is solid, second is outlined) */
    ctas?: { label: string; href: string }[];
    /** Crossfading full-bleed slides; the first is the LCP image. Falls back to `image` */
    slides?: { image: string; label: string; caption?: string }[];
  };
  searchBar: {
    placeholder: string;
    ctaLabel: string;
    ctaHref: string;
  };
  nav: {
    left: NavLink[];
    right: NavLink[];
    /** Hamburger side-menu links */
    menu: NavLink[];
  };
  /**
   * "Featured Properties" band on the homepage highlighting the client's own
   * active listings. Live data comes from IDX Broker when IDX_API_KEY is set
   * in the deployment env; `listings` here is the manual fallback. Hidden when
   * neither yields listings.
   */
  featured?: { title: string; subtitle?: string; listings?: Listing[] };
  /** Interior pages, rendered at /<slug> (or /<client>/<slug>) */
  pages: SubPage[];
  /**
   * IDX Broker hookup. Set the client's IDX subdomain (e.g. "eaganluxury" for
   * eaganluxury.idxbroker.com) and the search page embeds their hosted search.
   * Omit to show a "search coming soon" panel instead.
   */
  idx?: {
    subdomain?: string;
    searchPath?: string;
    /**
     * Custom domain the client's IDX-hosted pages live on (e.g.
     * "search.client.com", set up as a CNAME to subdomains.idxbroker.com and
     * enabled in the IDX control panel). Listings we cannot render natively
     * redirect here rather than to idxbroker.com. Falls back to
     * <subdomain>.idxbroker.com.
     */
    publicHost?: string;
  };
  /** Contact details for the connect page and footer */
  contact?: { phone?: string; email?: string };
  /**
   * Team roster, rendered by a page with type: "team". Individual agents
   * simply omit this. Team sites keep `about` as the founder/lead spotlight
   * (the pattern every reference team site uses) and link here for the
   * full roster.
   */
  team?: {
    /** Small line above the grid, e.g. "Nine specialists. One standard." */
    tagline?: string;
    members: TeamMember[];
  };
  /**
   * Regulatory/compliance values. Boilerplate legal pages (privacy, terms,
   * accessibility, fair housing) and the footer compliance accordion render
   * from these. MLS disclaimer text should be the client's MLS-required
   * paragraph; a generic "deemed reliable" fallback ships by default.
   */
  legal?: {
    licenseNumber?: string;
    licenseState?: string;
    mlsName?: string;
    mlsDisclaimer?: string;
    governingLaw?: string;
    stateCivilRightsAgency?: string;
    lastUpdated?: string;
  };
  /**
   * Ad landing pages (/home-value, /buyers). Stripped header with no nav links,
   * because a landing page that offers ten ways to leave converts worse than one
   * that offers a form. Accents are injected as CSS variables on the wrapper.
   */
  landing?: {
    /** Accent used for eyebrows, rules, and the submit button */
    accent: string;
    /** Lighter accent for hero eyebrows and outlines on dark ground */
    accentLight: string;
    /** Palest accent for small caps on glass */
    accentPale: string;
    /** Marketing line for the landing hero and footer */
    tagline: string;
    /** Title / credentials shown under the agent's name */
    designations: string[];
    /** Spelled-out credentials for the landing footer */
    designationsLong: string;
    /** Communities listed on landing pages; href links to a real page */
    communities: { label: string; href?: string }[];
    /** How the market is described in eyebrows, e.g. "Naples, Florida" */
    serviceArea: string;
    /** Brokerage license number for the landing footer disclosure */
    brokerageLicense?: string;
    /** /buyers hero headline (defaults to a neutral line) */
    buyersTitle?: string;
    /** /home-value hero headline (defaults to a neutral line) */
    homeValueTitle?: string;
    /** /buyers hero background (falls back to hero.image) */
    buyersImage?: string;
    /** /home-value hero background (falls back to hero.image) */
    homeValueImage?: string;
    /** Agent portrait for landing pages (falls back to about.image) */
    portrait?: string;
    /** /buyers brokerage-authority background (falls back to cta.image) */
    brandImage?: string;
    /** Numbered points in the /buyers brokerage-authority section */
    brokeragePoints?: { title: string; body: string }[];
    /** Buyer price bands on /buyers, low to high (defaults to $1M+ luxury bands) */
    priceBands?: string[];
    /** Bands that count as qualified for ad bidding (defaults to all but the lowest) */
    qualifiedBands?: string[];
  };
  /**
   * Registration gate on listing detail pages. The listing still renders (and
   * indexes) underneath; only a modal overlays it. freeViews 0 asks on the
   * first listing; dismissible adds a "Not now" link.
   */
  listingGate?: {
    enabled: boolean;
    freeViews: number;
    dismissible: boolean;
    heading: string;
    subheading: string;
  };
  /** Elfsight All-in-One Reviews widget, loaded site-wide (layout is set in the Elfsight dashboard) */
  reviews?: { elfsightAppId: string };
  /** Optional proof-point band rendered after the intro (e.g. "40+ / Years") */
  stats?: { value: string; label: string }[];
  services: GalleryCard[];
  intro: {
    title: string;
    paragraphs: string[];
    ctaLabel: string;
    ctaHref: string;
  };
  areas: GalleryCard[];
  about: {
    title: string;
    subtitle: string;
    image: string;
    /** "portrait" (default) = circular headshot; "photo" = wide team photo */
    imageStyle?: "portrait" | "photo";
    /** Optional square headshot shown beside the homepage statement, linking down to #about */
    avatar?: string;
    /** Alternate plain paragraphs and bolded lead-ins */
    blocks: { heading?: string; text: string }[];
    /** Buttons under the homepage about statement; first is solid, rest outlined */
    ctas?: { label: string; href: string }[];
  };
  cta: {
    title: string;
    description: string;
    buttonLabel: string;
    buttonHref: string;
    image: string;
  };
  footer: {
    agentName: string;
    brokerage: string;
    links: NavLink[];
    socials: { platform: "instagram" | "facebook" | "linkedin"; href: string }[];
    addressLines: string[];
    newsletter: {
      heading: string;
      tagline: string;
      consent: string;
    };
    copyright: string;
    /** Optional compliance row: Equal Housing logo + license/brokerage line */
    compliance?: { image: string; text: string };
  };
}

/* --------------------------------------------------------------------------
   CLIENT: Mike Meucci, Engel & Völkers Sun Valley (meucci-group)
   Homepage variant "classic" with the four-season hero.
   Voice: genuine, conversational, local. No flashy luxury language.
   -------------------------------------------------------------------------- */

const PHONE = "(208) 928-7223";
const EMAIL = "mike.meucci@evrealestate.com";
const BROKERAGE = "Engel & Völkers Sun Valley";

export const site: SiteContent = {
  homeVariant: "classic",
  theme: {
    primary: "#303030",
    secondary: "#6F6B67",
    background: "#FFFFFF",
    accent: "#E60000",
  },
  brand: {
    name: "Mike Meucci",
    tagline: BROKERAGE,
    logo: { light: "/brand/logo-light.png", dark: "/brand/logo-dark.png" },
    decal: "/brand/decal.svg",
  },
  meta: {
    // TODO: set to the production domain before launch
    siteUrl: "https://meucci-group.vercel.app",
    title: "Sun Valley Real Estate – Mike Meucci, Engel & Völkers Sun Valley",
    description:
      "Homes in Sun Valley, Ketchum, Hailey and Bellevue, Idaho with Mike Meucci of Engel & Völkers Sun Valley. Local knowledge, a personal approach, and a call back the same day.",
  },
  hero: {
    preTitle: "Sun Valley · Ketchum · Hailey · Bellevue",
    title: "Life's Good Here.\nLet's Find Your Place.",
    lead:
      "Real estate in the Wood River Valley, handled the way a good neighbor would handle it: straight answers, local knowledge, and your call returned the same day.",
    ctas: [
      { label: "Search Homes", href: "/listings" },
      { label: "Talk with Mike", href: "/connect" },
    ],
    image: "/photos/season-winter.jpg",
    slides: [
      { image: "/photos/season-winter.jpg", label: "Winter", caption: "First snow on the Boulders" },
      { image: "/photos/season-spring.jpg", label: "Spring", caption: "Silver Creek, south valley" },
      { image: "/photos/season-summer.jpg", label: "Summer", caption: "Bald Mountain above Ketchum" },
      { image: "/photos/season-fall.jpg", label: "Fall", caption: "The Big Wood River in October" },
    ],
  },
  searchBar: {
    placeholder: "Search by town, neighborhood, or address",
    ctaLabel: "Call Mike",
    ctaHref: "/connect",
  },
  nav: {
    left: [
      { label: "Featured Listings", href: "/listings" },
      { label: "Buy", href: "/buy" },
      { label: "Sell", href: "/sell" },
    ],
    right: [
      { label: "The Valley", href: "/the-valley" },
      { label: "Let's Connect", href: "/connect" },
    ],
    menu: [
      { label: "Home", href: "/" },
      { label: "Meet Mike", href: "/about" },
      { label: "Featured Listings", href: "/listings" },
      { label: "Buy a Home", href: "/buy" },
      { label: "Sell Your Home", href: "/sell" },
      { label: "The Valley", href: "/the-valley" },
      { label: "Let's Connect", href: "/connect" },
    ],
  },
  contact: { phone: PHONE, email: EMAIL },
  legal: {
    licenseNumber: "SP41471",
    licenseState: "Licensed in Idaho",
    mlsName: "Sun Valley Board of REALTORS® MLS",
    governingLaw: "the State of Idaho",
    stateCivilRightsAgency: "Idaho Human Rights Commission",
    lastUpdated: "November 2026",
  },
  featured: {
    title: "Featured Properties",
    subtitle: "Around the Valley",
    // DEMO listings: placeholders until IDX Broker is connected. Replace before launch.
    listings: [
      {
        price: "$2,450,000",
        address: "Warm Springs Road, Ketchum",
        propertyType: "single-family",
        beds: "4",
        baths: "3.5",
        sqft: "3,210",
        status: "For Sale",
        mls: "DEMO-0001",
        image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
        href: "/listing/warm-springs-road-ketchum-demo-0001",
      },
      {
        price: "$1,195,000",
        address: "Elkhorn Village, Sun Valley",
        propertyType: "condominium",
        beds: "3",
        baths: "3",
        sqft: "1,860",
        status: "For Sale",
        mls: "DEMO-0002",
        image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80",
        href: "/listing/elkhorn-village-sun-valley-demo-0002",
      },
      {
        price: "$875,000",
        address: "Woodside, Hailey",
        propertyType: "single-family",
        beds: "3",
        baths: "2",
        sqft: "1,940",
        status: "Pending",
        mls: "DEMO-0003",
        image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
        href: "/listing/woodside-hailey-demo-0003",
      },
    ],
  },
  pages: [
    {
      slug: "listings",
      type: "listings",
      title: "Featured Listings",
      preTitle: "Homes Around the Wood River Valley",
      heroImage: "/photos/season-fall.jpg",
      intro: [
        "Homes for sale from Sun Valley and Ketchum down to Hailey and Bellevue. If you see something you like, or you want to know what is coming before it hits the market, call Mike.",
      ],
    },
    {
      slug: "buy",
      title: "Buy a Home",
      preTitle: "Buying in the Wood River Valley",
      heroImage: "/photos/baldy-skier.jpg",
      intro: [
        "Most of the people Mike works with are buying from somewhere else: Seattle, the Bay Area, Southern California, Denver, Chicago. You know the lifestyle you want. Mike knows the valley. He will tell you honestly which neighborhoods fit, what things actually sell for, and when to wait.",
      ],
      sections: [
        {
          heading: "Buying from out of state",
          text: "You cannot be here for every showing, and you should not have to be. Mike previews homes, sends you honest video walkthroughs, and tells you what the photos leave out: road noise, sun exposure, the snow load on that north-facing driveway. When you fly in, you only see the homes worth your time.",
          image: "/photos/season-summer.jpg",
        },
        {
          heading: "Your first Sun Valley home",
          text: "Whether it is a ski condo in Warm Springs, a place in Elkhorn, or a house with room for the whole family in Hailey, the first second home is a big decision. Mike walks you through the practical side: HOA rules, short-term rental restrictions, winter access, and what ownership actually costs year to year.",
          image: "/photos/season-winter.jpg",
        },
        {
          heading: "Relocating for good",
          text: "A lot of folks come for a week and start wondering what it would take to stay. Mike has helped families from Washington and beyond make the move, and he is glad to talk schools, commutes between towns, and which neighborhoods feel right in February as well as July.",
          image: "/photos/mike-community.jpg",
        },
      ],
      cta: { label: "Start Your Search", href: "/listings" },
      searchPanel: { kicker: "Search the Valley", title: "Find Your Place" },
      showListings: true,
      listingsHeading: { kicker: "Featured", title: "Homes Around the Valley" },
    },
    {
      slug: "sell",
      title: "Sell Your Home",
      preTitle: "Selling in the Wood River Valley",
      heroImage: "/photos/historic-home.jpg",
      intro: [
        "Selling a home here is a little different. Many of the buyers are out of state, the market swings with the seasons, and the right price depends on things an online estimate never sees. Mike gives you a straight read on value and a plan that fits your timeline.",
      ],
      sections: [
        {
          heading: "An honest number",
          text: "Mike prices from what is actually closing in your neighborhood right now, not from a formula. He will show you the comparable sales, explain the reasoning, and tell you plainly if he thinks a number is too high. Sellers who price right the first time sell faster and keep more.",
          image: "/photos/ketchum-evening.jpg",
        },
        {
          heading: "Reach beyond the valley",
          text: "Through Engel & Völkers, your home is presented to buyers across the country and around the world, with the professional photography, print, and digital exposure the brand is known for. Locally, Mike's own network of advisors, owners, and visitors is often where the buyer comes from.",
          image: "/photos/office-sign.jpg",
        },
        {
          heading: "Timing the seasons",
          text: "Winter and summer bring the most visitors, and visitors become buyers. Spring and fall are quieter. Mike will help you decide when to list, how to prepare the home, and how to keep it show-ready around your own schedule.",
          image: "/photos/ketchum-town-event.jpg",
        },
        {
          heading: "Handled, start to finish",
          text: "From the first conversation through inspection, appraisal, and closing, Mike manages the details and keeps you informed. You will always know where things stand and what comes next.",
          image: "/photos/office-conference.jpg",
        },
      ],
      cta: { label: "Ask Mike What It's Worth", href: "/connect" },
      valuation: true,
      valuationImage: "/photos/season-fall.jpg",
      recentClosings: {
        intro: "Homes Mike has recently helped clients buy and sell around the valley.",
      },
    },
    {
      slug: "the-valley",
      title: "The Wood River Valley",
      preTitle: "Four Towns. Four Seasons. One Place.",
      heroImage: "/photos/wildflowers.jpg",
      intro: [
        "Twenty-some miles of valley along the Big Wood River, with Bald Mountain at the top and open ranch country at the bottom. Each town has its own feel. Mike can help you figure out which one is yours.",
      ],
      sections: [
        {
          heading: "Sun Valley",
          text: "The original American ski resort and still the heart of winter here. Sun Valley Resort, the Village, Elkhorn, and quiet residential streets near the golf courses and the pool. Summer brings the symphony, the ice shows, and long evenings on the trails.",
          image: "/photos/baldy-torchlight.jpg",
        },
        {
          heading: "Ketchum",
          text: "The walkable town at the base of Baldy, with restaurants, galleries, and the shops a few steps from the Warm Springs and River Run lifts. Neighborhoods range from downtown condos to homes tucked into the hillsides and along the river.",
          image: "/photos/ketchum-evening.jpg",
        },
        {
          heading: "Hailey",
          text: "Twelve miles south, Hailey is where much of the valley actually lives: schools, the airport, Main Street, and friendly neighborhoods like Woodside and Old Hailey. It is where families settle in for good.",
          image: "/photos/hailey-aerial.jpg",
        },
        {
          heading: "Bellevue and the south valley",
          text: "The valley opens up south of Hailey into ranch land, big skies, and Silver Creek, some of the best fly fishing in the West. Bellevue offers a slower pace and a little more room, with the mountains still twenty minutes away.",
          image: "/photos/season-spring.jpg",
        },
        {
          heading: "The life outside",
          text: "Skiing and Nordic trails in winter. Fly fishing, golf, hiking, and mountain biking the rest of the year. Most people who buy here are buying the days they will spend outside, and Mike will happily tell you where to spend them.",
          image: "/photos/baldy-skier.jpg",
        },
      ],
      cta: { label: "Talk with Mike About the Valley", href: "/connect" },
    },
    {
      slug: "about",
      title: "Meet Mike Meucci",
      preTitle: "A Good Person to Call",
      heroImage: "/photos/mike-community.jpg",
      intro: [
        "Mike Meucci is a real estate advisor with Engel & Völkers Sun Valley. He is the kind of agent people describe as genuine: easy to talk to, straight with you, and glad to be of help whether or not there is a deal in it.",
      ],
      sections: [
        {
          heading: "Local knowledge, a personal approach",
          text: "Mike lives the valley lifestyle he sells, and it shows in the details he notices: which streets get the afternoon sun, how a neighborhood feels in mud season, who to call when the furnace quits. Clients get his cell, and he picks up.",
          image: "/photos/mike-vespa.jpg",
        },
        {
          heading: "Backed by Engel & Völkers",
          text: "Mike works out of the Engel & Völkers Sun Valley shop, part of an international brand with a reputation for presentation and service. His clients get a neighbor's advice with a global network behind it.",
          image: "/photos/office-lounge-team.jpg",
        },
        {
          heading: "Here for the long run",
          text: "Most of Mike's business comes from people he has already helped and the friends they send his way. That only works one way: by doing right by people, every time.",
          image: "/photos/ev-shop-sunvalley.jpg",
        },
      ],
      cta: { label: "Let's Connect", href: "/connect" },
    },
    {
      slug: "connect",
      type: "connect",
      title: "Let's Connect",
      preTitle: "Start with a Conversation",
      heroImage: "/photos/office-front.jpg",
      intro: [
        "Buying, selling, or just curious what your place is worth? Call or text Mike directly, or leave your details and he will get back to you the same day.",
      ],
    },
  ],
  listingGate: {
    enabled: false,
    freeViews: 0,
    dismissible: true,
    heading: "See the full property details",
    subheading:
      "Tell Mike where to send the details and he will follow up with photos, disclosures, and anything the MLS does not show.",
  },
  landing: {
    accent: "#303030",
    accentLight: "#6F6B67",
    accentPale: "#E3E1DF",
    tagline: "Life's Good Here. Let's Find Your Place.",
    designations: ["Real Estate Advisor"],
    designationsLong: "Real Estate Advisor · Engel & Völkers Sun Valley",
    communities: [
      { label: "Sun Valley", href: "/the-valley" },
      { label: "Ketchum", href: "/the-valley" },
      { label: "Hailey", href: "/the-valley" },
      { label: "Bellevue", href: "/the-valley" },
    ],
    serviceArea: "Sun Valley, Idaho",
    buyersTitle: "Find your place in the Wood River Valley",
    homeValueTitle: "What is your Sun Valley home worth today?",
    buyersImage: "/photos/season-summer.jpg",
    homeValueImage: "/photos/ketchum-evening.jpg",
    portrait: "/photos/mike-portrait.jpg",
    brandImage: "/photos/office-dusk.jpg",
    brokeragePoints: [
      {
        title: "An international network",
        body: "Engel & Völkers connects your search or your sale to advisors and buyers across the country and around the world.",
      },
      {
        title: "A local shop in Ketchum",
        body: "Mike works from the Engel & Völkers Sun Valley office, with colleagues who know every corner of the valley.",
      },
      {
        title: "One person, start to finish",
        body: "You work with Mike directly, from the first call through closing. No hand-offs, no runaround.",
      },
    ],
    priceBands: ["$500K to $750K", "$750K to $1M", "$1M to $2M", "$2M to $4M", "$4M+"],
    qualifiedBands: ["$750K to $1M", "$1M to $2M", "$2M to $4M", "$4M+"],
  },
  // Fallback only: with IDX connected the homepage shows live MLS counts instead.
  stats: [
    { value: "4", label: "Towns, one valley: Sun Valley, Ketchum, Hailey, Bellevue" },
    { value: "1977", label: "Engel & Völkers founded in Hamburg" },
    { value: "35+", label: "Countries in the Engel & Völkers network" },
  ],
  services: [
    {
      preTitle: "For Buyers",
      title: "Find Your Place",
      cta: "Buying in the Valley",
      href: "/buy",
      image: "/photos/baldy-skier.jpg",
    },
    {
      preTitle: "For Sellers",
      title: "An Honest Number",
      cta: "Selling Your Home",
      href: "/sell",
      image: "/photos/historic-home.jpg",
    },
    {
      preTitle: "The Market",
      title: "Featured Listings",
      cta: "See What's Available",
      href: "/listings",
      image: "/photos/ketchum-evening.jpg",
    },
  ],
  intro: {
    title: "Real Estate. Without the Runaround.",
    paragraphs: [
      "Mike Meucci sells homes across the Wood River Valley with Engel & Völkers Sun Valley. He is not a high-pressure agent and he does not pretend to be. He is the person you call when you want a straight answer about a neighborhood, a price, or whether now is the right time.",
      "Most of his clients are buying a first home in Sun Valley from somewhere else, or they already own here and are thinking about what comes next. Either way, you get Mike's cell, his honest read on the market, and the kind of local knowledge that only comes from living it.",
      "If you are weighing a move, a second home, or a sale, start with a conversation. No obligation, no pitch. Just good information from someone who knows the valley.",
    ],
    ctaLabel: "Meet Mike",
    ctaHref: "/about",
  },
  areas: [
    {
      title: "Sun Valley",
      description: "The resort, the Village, Elkhorn, and quiet streets a short walk from the lifts and the trails.",
      href: "/the-valley",
      image: "/photos/baldy-torchlight.jpg",
    },
    {
      title: "Ketchum",
      description: "The walkable town at the base of Baldy: restaurants, galleries, and homes from downtown to the hillsides.",
      href: "/the-valley",
      image: "/photos/ketchum-evening.jpg",
    },
    {
      title: "Hailey",
      description: "Where the valley lives year-round. Schools, the airport, Main Street, and family neighborhoods.",
      href: "/the-valley",
      image: "/photos/hailey-aerial.jpg",
    },
    {
      title: "Bellevue",
      description: "Open country, big skies, and Silver Creek. A slower pace with the mountains still close.",
      href: "/the-valley",
      image: "/photos/season-spring.jpg",
    },
  ],
  about: {
    title: "Real Estate. Without the Runaround.",
    subtitle: "Meet Mike Meucci · Engel & Völkers Sun Valley",
    image: "/photos/mike-portrait.jpg",
    blocks: [
      {
        text: "Mike Meucci sells homes across the Wood River Valley with Engel & Völkers Sun Valley. He is not a high-pressure agent and he does not pretend to be. He is the person you call when you want a straight answer about a neighborhood, a price, or whether now is the right time.",
      },
      {
        heading: "Local Knowledge. A Personal Approach.",
        text: "Mike knows the valley the way you only can by living in it, and he shares that knowledge freely. Which neighborhoods hold their value, where the sun hits in January, which streets are quiet in August. He would rather you make the right decision than a fast one.",
      },
      {
        heading: "Straightforward, Start to Finish",
        text: "You will work with Mike directly, not a team of assistants. He returns calls the same day, tells you what he actually thinks, and handles the details so the process feels simple, even from a thousand miles away.",
      },
      {
        text: "If you are weighing a move, a second home, or a sale, start with a conversation. No obligation, no pitch. Just good information from someone who knows the valley. Call or text any time at " + PHONE + ".",
      },
    ],
    ctas: [
      { label: "Let's Connect", href: "/connect" },
      { label: "More About Mike", href: "/about" },
    ],
  },
  cta: {
    title: "A Good Place to Call Home. A Good Person to Call.",
    description:
      "Whether you are a few months out or just starting to dream about the valley, a short conversation with Mike is the right place to begin. No pressure, no pitch.",
    buttonLabel: "Let's Connect",
    buttonHref: "/connect",
    image: "/photos/baldy-torchlight.jpg",
  },
  footer: {
    agentName: "Mike Meucci",
    brokerage: BROKERAGE,
    links: [
      { label: "Home", href: "/" },
      { label: "Meet Mike", href: "/about" },
      { label: "Featured Listings", href: "/listings" },
      { label: "Buy a Home", href: "/buy" },
      { label: "Sell Your Home", href: "/sell" },
      { label: "The Valley", href: "/the-valley" },
      { label: "Let's Connect", href: "/connect" },
    ],
    socials: [
      { platform: "instagram", href: "https://www.instagram.com/meucci_group_sun_valley/" },
    ],
    // TODO: confirm the shop street address with Mike before launch
    addressLines: ["Engel & Völkers Sun Valley", "Ketchum, Idaho 83340", PHONE],
    newsletter: {
      heading: "Stay in the Loop",
      tagline: "New listings, market notes, and valley news. No spam, ever.",
      consent:
        "I agree to be contacted by Mike Meucci, Engel & Völkers Sun Valley via call, email, and text for real estate services. To opt out, reply 'stop' at any time or reply 'help' for assistance. You can also click the unsubscribe link in the emails. Message and data rates may apply. Message frequency may vary.",
    },
    copyright: `Copyright ${new Date().getFullYear()} Mike Meucci · ${BROKERAGE}`,
    compliance: {
      image: "/equal-housing.png",
      text: "Mike Meucci, Idaho License SP41471 · Engel & Völkers Sun Valley. Each brokerage independently owned and operated.",
    },
  },
};
