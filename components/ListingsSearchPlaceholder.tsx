"use client";

import { useMemo, useState } from "react";
import ListingsGrid from "@/components/ListingsGrid";
import FilterSelect from "@/components/idx/FilterSelect";
import { site, type Listing } from "@/content/site";

/* ==========================================================================
   Pre-IDX search (placeholder). Same fields and layout as the native MLS
   search Carole's site runs, but it filters the agent's own portfolio in
   memory until IDX Broker is connected. Filters live in the URL
   (?city=&minPrice=...) so shareable links keep working after the swap.
   `compact` renders the short form used on /buy, which hands off to
   /listings instead of filtering in place.
   ========================================================================== */

const PRICES: Array<[string, string]> = [
  ["1000000", "$1M"],
  ["1500000", "$1.5M"],
  ["2000000", "$2M"],
  ["2500000", "$2.5M"],
  ["3000000", "$3M"],
  ["5000000", "$5M"],
  ["7500000", "$7.5M"],
  ["10000000", "$10M"],
];

/* Values are the IDX property-type names (lib/idx/propertyTypes), so the same
   URL filters live MLS results; matching below normalises for the config's
   lowercase placeholder values. */
const TYPES: Array<[string, string]> = [
  ["Residential", "Residential"],
  ["Residential Income", "Multi-Family / Income"],
  ["Land", "Land"],
];

const SQFT: Array<[string, string]> = [
  ["1500", "1,500+"],
  ["2000", "2,000+"],
  ["2500", "2,500+"],
  ["3000", "3,000+"],
  ["4000", "4,000+"],
  ["5000", "5,000+"],
];

const PAGE_SIZE = 12;

/* Field names match lib/idx/filterParams so a search built here keeps working
   verbatim once IDX Broker is connected and /listings switches to live data. */
export type PlaceholderFilters = {
  city: string;
  minPrice: string;
  maxPrice: string;
  propertyTypes: string;
  minBeds: string;
  minBaths: string;
  minSqFt: string;
  status: string;
};

const EMPTY: PlaceholderFilters = {
  city: "", minPrice: "", maxPrice: "", propertyTypes: "", minBeds: "", minBaths: "", minSqFt: "", status: "",
};

const num = (v?: string) => (v ? parseFloat(v.replace(/[^0-9.]/g, "")) || 0 : 0);

function matches(l: Listing, f: PlaceholderFilters): boolean {
  if (f.city && !l.address.toLowerCase().includes(f.city.trim().toLowerCase())) return false;
  const price = num(l.price);
  if (f.minPrice && price < num(f.minPrice)) return false;
  if (f.maxPrice && price > num(f.maxPrice)) return false;
  const normType = (v?: string) => (v ?? "").toLowerCase().replace(/[^a-z]/g, "");
  if (f.propertyTypes && normType(l.propertyType) !== normType(f.propertyTypes)) return false;
  if (f.minBeds && num(l.beds) < num(f.minBeds)) return false;
  if (f.minBaths && num(l.baths) < num(f.minBaths)) return false;
  if (f.minSqFt && num(l.sqft) < num(f.minSqFt)) return false;
  const sold = /sold|closed/i.test(l.status ?? "");
  if (f.status === "active" && sold) return false;
  if (f.status === "sold" && !sold) return false;
  return true;
}

export default function ListingsSearchPlaceholder({
  listings,
  initial,
  compact = false,
}: {
  listings: Listing[];
  initial?: Partial<PlaceholderFilters>;
  compact?: boolean;
}) {
  const [draft, setDraft] = useState<PlaceholderFilters>({ ...EMPTY, ...initial });
  const [applied, setApplied] = useState<PlaceholderFilters>({ ...EMPTY, ...initial });
  const [page, setPage] = useState(1);

  const set = (key: keyof PlaceholderFilters) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  const towns = useMemo(
    () => Array.from(new Set(listings.map((l) => l.address.split(",").pop()?.trim()).filter(Boolean))) as string[],
    [listings],
  );

  const results = useMemo(() => listings.filter((l) => matches(l, applied)), [listings, applied]);
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const shown = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(draft).forEach(([k, v]) => v && params.set(k, v));
    if (compact) {
      window.location.href = `/listings${params.size ? `?${params}` : ""}`;
      return;
    }
    setApplied(draft);
    setPage(1);
    window.history.replaceState(null, "", `/listings${params.size ? `?${params}` : ""}`);
  }

  function reset() {
    setDraft(EMPTY);
    setApplied(EMPTY);
    setPage(1);
    window.history.replaceState(null, "", "/listings");
  }

  const field = (id: keyof PlaceholderFilters, label: string, options: Array<[string, string]>, any: string) => (
    <div className={compact ? "adv-search__field" : "sf__field"}>
      <span className={compact ? "adv-search__label" : "sf__label"} id={`adv-${id}-label`}>{label}</span>
      <FilterSelect
        label={label}
        placeholder={any}
        value={draft[id]}
        options={options.map(([value, text]) => ({ value, label: text }))}
        onChange={(value) => setDraft((d) => ({ ...d, [id]: value }))}
      />
    </div>
  );

  const counts: Array<[string, string]> = ["1", "2", "3", "4", "5"].map((n) => [n, `${n}+`]);
  const [more, setMore] = useState(Boolean(draft.minSqFt || draft.status));

  const active: Array<[keyof PlaceholderFilters, string]> = [];
  if (applied.city) active.push(["city", applied.city]);
  if (applied.minPrice) active.push(["minPrice", `From ${PRICES.find(([v]) => v === applied.minPrice)?.[1] ?? applied.minPrice}`]);
  if (applied.maxPrice) active.push(["maxPrice", `Up to ${PRICES.find(([v]) => v === applied.maxPrice)?.[1] ?? applied.maxPrice}`]);
  if (applied.propertyTypes) active.push(["propertyTypes", TYPES.find(([v]) => v === applied.propertyTypes)?.[1] ?? applied.propertyTypes]);
  if (applied.minBeds) active.push(["minBeds", `${applied.minBeds}+ Beds`]);
  if (applied.minBaths) active.push(["minBaths", `${applied.minBaths}+ Baths`]);
  if (applied.minSqFt) active.push(["minSqFt", `${SQFT.find(([v]) => v === applied.minSqFt)?.[1] ?? applied.minSqFt} Sq. Ft.`]);
  if (applied.status) active.push(["status", applied.status === "sold" ? "Sold" : "Active"]);
  const remove = (key: keyof PlaceholderFilters) => {
    const next = { ...applied, [key]: "" };
    setDraft(next);
    setApplied(next);
    setPage(1);
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => v && params.set(k, v));
    window.history.replaceState(null, "", `/listings${params.size ? `?${params}` : ""}`);
  };

  if (compact) {
    return (
      <form className="adv-search adv-search--compact" onSubmit={submit} role="search">
        <div className="adv-search__grid">
          <div className="adv-search__field adv-search__field--wide">
            <label htmlFor="adv-city">Location</label>
            <input id="adv-city" type="text" list="adv-towns" placeholder="City, neighborhood, or address" value={draft.city} onChange={set("city")} />
            <datalist id="adv-towns">{towns.map((t) => <option key={t} value={t} />)}</datalist>
          </div>
          {field("minPrice", "Min Price", PRICES, "No Min")}
          {field("maxPrice", "Max Price", PRICES, "No Max")}
          {field("propertyTypes", "Property Type", TYPES, "Any Type")}
          {field("minBeds", "Bedrooms", counts, "Any")}
          {field("minBaths", "Bathrooms", counts, "Any")}
        </div>
        <div className="adv-search__foot">
          <button type="submit" className="adv-search__submit">Search Listings</button>
        </div>
      </form>
    );
  }

  return (
    <>
      <form className="sf" onSubmit={submit} role="search">
        <div className="sf__row">
          <div className="sf__field sf__field--loc">
            <label className="sf__label" htmlFor="adv-city">Location</label>
            <div className="sf__loc">
              <svg className="sf__loc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" /></svg>
              <input
                id="adv-city"
                className="loc__input"
                type="text"
                list="adv-towns"
                placeholder="City, neighborhood, or address"
                value={draft.city}
                onChange={set("city")}
              />
              <datalist id="adv-towns">{towns.map((t) => <option key={t} value={t} />)}</datalist>
            </div>
          </div>
          {field("minPrice", "Min Price", PRICES, "No Min")}
          {field("maxPrice", "Max Price", PRICES, "No Max")}
          {field("minBeds", "Beds", counts, "Any")}
          {field("minBaths", "Baths", counts, "Any")}
          {field("propertyTypes", "Type", TYPES, "Any")}
          <button type="submit" className="sf__go">
            <span>Search</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          </button>
        </div>
        <div className="sf__foot">
          <button type="button" className={`sf__more${more ? " is-open" : ""}`} aria-expanded={more} onClick={() => setMore((m) => !m)}>
            {more ? "Fewer filters" : "More filters"}
            <span className="sf__more-chevron" aria-hidden="true" />
          </button>
          {more && (
            <div className="sf__refine">
              {field("minSqFt", "Min Sq. Ft.", SQFT, "Any")}
              {field("status", "Status", [["active", "Active"], ["sold", "Sold"]], "Active & Sold")}
            </div>
          )}
        </div>
      </form>

      <div className="adv-results">
        <div className="lr-head">
          <div>
            <span className="lr-head__eyebrow">
              {applied.city ? `Homes in ${applied.city}` : `${site.footer.agentName.split(" ")[0]}'s Featured Homes`}
            </span>
            <p className="lr-head__count">
              {results.length} {results.length === 1 ? "home" : "homes"}
              {results.length > 0 && (
                <span className="lr-head__range"> · showing {(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + shown.length}</span>
              )}
            </p>
          </div>
          <span className="lr-head__soon">Full MLS search arriving soon</span>
        </div>

        {active.length > 0 && (
          <div className="lr-chips" role="list" aria-label="Active filters">
            {active.map(([key, label]) => (
              <button type="button" role="listitem" key={key} className="lr-chip" onClick={() => remove(key)}>
                <span>{label}</span>
                <span className="lr-chip__x" aria-hidden="true">×</span>
                <span className="visually-hidden">Remove</span>
              </button>
            ))}
            <button type="button" className="lr-chips__clear" onClick={reset}>Clear all</button>
          </div>
        )}

        {shown.length > 0 ? (
          <ListingsGrid listings={shown} />
        ) : (
          <div className="lr-empty">
            <p>No homes in this portfolio match those filters yet.</p>
            <p className="lr-empty__sub">
              Loosen a filter, or <a href="/connect">tell {site.footer.agentName.split(" ")[0]} what you want</a> and he
              will watch the market for you.
            </p>
            <button type="button" className="lr-chips__clear" onClick={reset}>Clear all filters</button>
          </div>
        )}
        {pages > 1 && (
          <nav className="idx-pagination" aria-label="Results pages">
            <button type="button" className="idx-pagination__arrow" disabled={page === 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">&larr;</button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button type="button" key={p} className={p === page ? "is-current" : undefined} aria-current={p === page ? "page" : undefined} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button type="button" className="idx-pagination__arrow" disabled={page === pages} onClick={() => setPage((p) => p + 1)} aria-label="Next page">&rarr;</button>
          </nav>
        )}
      </div>
    </>
  );
}
