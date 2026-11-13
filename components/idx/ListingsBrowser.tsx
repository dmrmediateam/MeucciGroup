"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import IdxListingCard from "@/components/idx/IdxListingCard";
import LocationAutocomplete, { freeTextSelection } from "@/components/idx/LocationAutocomplete";
import FilterSelect from "@/components/idx/FilterSelect";
import ActiveFilterChips, { type Chip } from "@/components/idx/ActiveFilterChips";
import { PROPERTY_TYPES } from "@/lib/idx/propertyTypes";
import { filtersFromParams, paramsFromFilters } from "@/lib/idx/filterParams";
import { trackSearch } from "@/lib/tracking/useTracking";
import type { SearchFilters, SearchResponse } from "@/lib/idx/types";

/* ==========================================================================
   Search results browser. The page SSRs the first response for SEO; this
   component takes over for filter changes, syncing filters to the URL with
   pushState so every search is shareable and the back button works.
   ========================================================================== */

export default function ListingsBrowser({
  initialFilters,
  initialResponse,
  propertyTypeOptions,
}: {
  initialFilters: SearchFilters;
  initialResponse: SearchResponse | null;
  /** The MLS's own property-type names (server-fetched); falls back to a generic list */
  propertyTypeOptions?: string[];
}) {
  const pathname = usePathname();
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [response, setResponse] = useState<SearchResponse | null>(initialResponse);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skipInitialFetchRef = useRef(initialResponse !== null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchResults = useCallback(async (next: SearchFilters) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/listings?${paramsFromFilters(next).toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const data: SearchResponse = await res.json();
      setResponse(data);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
          setError(
          (err as Error).message?.includes("429")
            ? "Live MLS data is busy right now."
            : "We could not load listings just now.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;
      return;
    }
    fetchResults(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = useCallback(
    (next: Partial<SearchFilters>, resetPage = true) => {
      const merged: SearchFilters = { ...filters, ...next, page: resetPage ? 1 : next.page ?? 1 };
      setFilters(merged);
      window.history.pushState(null, "", `${pathname}?${paramsFromFilters(merged).toString()}`);
      fetchResults(merged);
    },
    [filters, pathname, fetchResults],
  );

  /*
   * Saved searches: what this visitor is actually shopping for, which is the
   * signal behind "a new home matched your search" follow-up.
   *
   * Watches the filter set rather than hooking applyFilters, because that also
   * runs for page turns and a page turn is not a new search. Page and sort are
   * excluded for the same reason, an unfiltered browse is not a search either,
   * and the debounce collapses someone dragging a price slider into one entry
   * instead of thirty.
   */
  const lastTrackedSearch = useRef<string>("");
  useEffect(() => {
    const { page: _page, sort: _sort, pageSize: _pageSize, ...criteria } = filters;
    const hasCriteria = Object.values(criteria).some(
      (v) => v !== undefined && v !== null && v !== "",
    );
    if (!hasCriteria) return;
    const key = JSON.stringify(criteria);
    if (key === lastTrackedSearch.current) return;
    const timer = setTimeout(() => {
      lastTrackedSearch.current = key;
      trackSearch(criteria as Record<string, unknown>);
    }, 1200);
    return () => clearTimeout(timer);
  }, [filters]);

  // back/forward restores the URL's filters
  useEffect(() => {
    const onPop = () => {
      const restored = filtersFromParams(new URLSearchParams(window.location.search));
      setFilters(restored);
      fetchResults(restored);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [fetchResults]);

  const totalCount = response?.totalCount ?? 0;
  const page = response?.page ?? 1;
  const pageSize = response?.pageSize ?? 21;
  const first = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalCount);

  const chips: Chip[] = [];
  const place = filters.subdivision ?? filters.address ?? filters.city;
  if (place)
    chips.push({ key: "place", label: place, onRemove: () => applyFilters({ address: undefined, city: undefined, cityId: undefined, subdivision: undefined }) });
  if (filters.minPrice) chips.push({ key: "min", label: `From ${priceLabel(filters.minPrice)}`, onRemove: () => applyFilters({ minPrice: undefined }) });
  if (filters.maxPrice) chips.push({ key: "max", label: `Up to ${priceLabel(filters.maxPrice)}`, onRemove: () => applyFilters({ maxPrice: undefined }) });
  if (filters.minBeds) chips.push({ key: "beds", label: `${filters.minBeds}+ Beds`, onRemove: () => applyFilters({ minBeds: undefined }) });
  if (filters.minBaths) chips.push({ key: "baths", label: `${filters.minBaths}+ Baths`, onRemove: () => applyFilters({ minBaths: undefined }) });
  if (filters.propertyTypes?.[0]) chips.push({ key: "type", label: filters.propertyTypes[0], onRemove: () => applyFilters({ propertyTypes: undefined }) });
  if (filters.minSqFt) chips.push({ key: "sqft", label: `${filters.minSqFt.toLocaleString()}+ Sq. Ft.`, onRemove: () => applyFilters({ minSqFt: undefined }) });
  if (filters.status && filters.status !== "active")
    chips.push({ key: "status", label: filters.status === "sold" ? "Sold" : "Pending", onRemove: () => applyFilters({ status: "active" }) });
  const clearAll = () => applyFilters({
    address: undefined, city: undefined, cityId: undefined, subdivision: undefined,
    minPrice: undefined, maxPrice: undefined, minBeds: undefined, minBaths: undefined,
    propertyTypes: undefined, minSqFt: undefined, status: "active",
  });

  const headline = loading
    ? "Searching the MLS"
    : totalCount > 0
      ? `${totalCount.toLocaleString()} ${totalCount === 1 ? "home" : "homes"}`
      : "No homes match yet";

  return (
    <div className="idx-browser">
      <SearchFiltersBar filters={filters} onApply={applyFilters} propertyTypeOptions={propertyTypeOptions} />

      {response?.rateLimited && (
        <p className="idx-browser__notice">
          Live listing data is briefly unavailable. Showing the most recent results; please refresh in a minute.
        </p>
      )}
      {error && (
        <p className="idx-browser__notice idx-browser__notice--error" role="status">
          {error}{" "}
          <button type="button" className="idx-browser__retry" onClick={() => fetchResults(filters)}>
            Try again
          </button>{" "}
          or <a href="/connect">ask us to search for you</a>.
        </p>
      )}

      <div className="lr-head">
        <div>
          <span className="lr-head__eyebrow">
            {place ? `Homes in ${place}` : "Across the Valley"}
          </span>
          <p className={`lr-head__count${loading ? " is-loading" : ""}`} aria-live="polite">
            {headline}
            {!loading && totalCount > 0 && (
              <span className="lr-head__range"> · showing {first}–{last}</span>
            )}
          </p>
        </div>
        <div className="lr-head__sort">
          <span className="lr-head__sort-label">Sort</span>
          <FilterSelect
            label="Sort order"
            placeholder="Newest First"
            value={filters.sort && filters.sort !== "newest" ? filters.sort : ""}
            options={[
              { value: "priceDesc", label: "Price: High to Low" },
              { value: "priceAsc", label: "Price: Low to High" },
              { value: "sqftDesc", label: "Largest First" },
            ]}
            onChange={(v) => applyFilters({ sort: (v || undefined) as SearchFilters["sort"] })}
          />
        </div>
      </div>

      <ActiveFilterChips chips={chips} onClear={clearAll} />

      {!loading && totalCount === 0 && !error && (
        <div className="lr-empty">
          <p>Nothing in the MLS matches those filters right now.</p>
          <p className="lr-empty__sub">
            Loosen a filter, or <a href="/connect">tell us what you want</a> and we will watch the market and the
            off-market for you.
          </p>
          <button type="button" className="lr-chips__clear" onClick={clearAll}>Clear all filters</button>
        </div>
      )}

      <div className={`listings-grid listings-grid--search${loading ? " listings-grid--loading" : ""}`}>
        {response?.listings.map((listing) => (
          <IdxListingCard listing={listing} key={`${listing.idxId}-${listing.listingId}`} />
        ))}
      </div>

      {response && response.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={response.totalPages}
          onPage={(p) => {
            applyFilters({ page: p }, false);
            document.querySelector(".lr-head")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      )}

      <p className="idx-browser__disclaimer">
        Listing information is deemed reliable but not guaranteed and should be independently verified. IDX
        information is provided exclusively for consumers&apos; personal, non-commercial use and may not be used for
        any purpose other than to identify prospective properties consumers may be interested in purchasing.
      </p>
    </div>
  );
}

function SearchFiltersBar({
  filters,
  onApply,
  propertyTypeOptions,
}: {
  filters: SearchFilters;
  onApply: (next: Partial<SearchFilters>) => void;
  propertyTypeOptions?: string[];
}) {
  const [location, setLocation] = useState(
    filters.subdivision ?? filters.city ?? filters.address ?? "",
  );

  useEffect(() => {
    setLocation(filters.subdivision ?? filters.city ?? filters.address ?? "");
  }, [filters.subdivision, filters.city, filters.address]);

  /** Replace the whole location group so a new pick never stacks on the old */
  const applyLocation = (next: Partial<SearchFilters>) =>
    onApply({ address: undefined, city: undefined, cityId: undefined, subdivision: undefined, ...next });

  const [more, setMore] = useState(Boolean(filters.minSqFt || (filters.status && filters.status !== "active")));
  const submitLocation = () => {
    const sel = freeTextSelection(location);
    applyLocation({ city: sel.city, address: sel.address });
  };
  const field = (label: string, node: React.ReactNode, extra = "") => (
    <div className={`sf__field${extra ? ` ${extra}` : ""}`}>
      <span className="sf__label">{label}</span>
      {node}
    </div>
  );

  return (
    <div className="sf">
      <div className="sf__row">
        {field(
          "Location",
          <div className="sf__loc">
            <svg className="sf__loc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" /></svg>
            <LocationAutocomplete
              value={location}
              onChange={setLocation}
              onSelect={(sel) =>
                applyLocation({ cityId: sel.cityId, city: sel.city, subdivision: sel.subdivision, address: sel.address })
              }
              onSubmit={(raw) => {
                const sel = freeTextSelection(raw);
                applyLocation({ city: sel.city, address: sel.address });
              }}
            />
          </div>,
          "sf__field--loc",
        )}
        {field("Min Price", (
          <FilterSelect
            label="Minimum price"
            placeholder="No Min"
            value={filters.minPrice ? String(filters.minPrice) : ""}
            options={[500000, 750000, 1000000, 1500000, 2000000, 3000000, 5000000, 10000000].map((v) => ({ value: String(v), label: priceLabel(v) }))}
            onChange={(v) => onApply({ minPrice: v ? Number(v) : undefined })}
          />
        ))}
        {field("Max Price", (
          <FilterSelect
            label="Maximum price"
            placeholder="No Max"
            value={filters.maxPrice ? String(filters.maxPrice) : ""}
            options={[750000, 1000000, 1500000, 2000000, 3000000, 5000000, 10000000, 20000000].map((v) => ({ value: String(v), label: priceLabel(v) }))}
            onChange={(v) => onApply({ maxPrice: v ? Number(v) : undefined })}
          />
        ))}
        {field("Beds", (
          <FilterSelect
            label="Minimum bedrooms"
            placeholder="Any"
            value={filters.minBeds ? String(filters.minBeds) : ""}
            options={[1, 2, 3, 4, 5, 6].map((v) => ({ value: String(v), label: `${v}+` }))}
            onChange={(v) => onApply({ minBeds: v ? Number(v) : undefined })}
          />
        ))}
        {field("Baths", (
          <FilterSelect
            label="Minimum bathrooms"
            placeholder="Any"
            value={filters.minBaths ? String(filters.minBaths) : ""}
            options={[1, 2, 3, 4, 5].map((v) => ({ value: String(v), label: `${v}+` }))}
            onChange={(v) => onApply({ minBaths: v ? Number(v) : undefined })}
          />
        ))}
        {field("Type", (
          <FilterSelect
            label="Property type"
            placeholder="Any"
            value={filters.propertyTypes?.[0] ?? ""}
            options={(propertyTypeOptions ?? [...PROPERTY_TYPES]).map((t) => ({ value: t, label: t }))}
            onChange={(v) => onApply({ propertyTypes: v ? [v] : undefined })}
          />
        ))}
        <button type="button" className="sf__go" onClick={submitLocation}>
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
            {field("Min Sq. Ft.", (
              <FilterSelect
                label="Minimum square feet"
                placeholder="Any"
                value={filters.minSqFt ? String(filters.minSqFt) : ""}
                options={[1500, 2000, 2500, 3000, 4000, 5000].map((v) => ({ value: String(v), label: `${v.toLocaleString()}+` }))}
                onChange={(v) => onApply({ minSqFt: v ? Number(v) : undefined })}
              />
            ))}
            {field("Status", (
              <FilterSelect
                label="Listing status"
                placeholder="For Sale"
                value={filters.status && filters.status !== "active" ? filters.status : ""}
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "sold", label: "Sold" },
                ]}
                onChange={(v) => onApply({ status: (v || "active") as SearchFilters["status"] })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** $2.5M, $750K */
function priceLabel(value: number): string {
  return value >= 1000000 ? `$${value / 1000000}M` : `$${value / 1000}K`;
}

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  const pages: (number | "...")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }
  return (
    <nav className="idx-pagination" aria-label="Search results pages">
      <button type="button" className="idx-pagination__arrow" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">&larr;</button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`gap-${i}`} className="idx-pagination__gap">&hellip;</span>
        ) : (
          <button
            type="button"
            key={p}
            className={p === page ? "is-current" : undefined}
            aria-current={p === page ? "page" : undefined}
            onClick={() => onPage(p)}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" className="idx-pagination__arrow" disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next page">&rarr;</button>
    </nav>
  );
}
