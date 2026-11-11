/*
 * Property types differ by MLS: Naples returns "Single-Family" where San
 * Diego returns "Residential". Never ship a per-market list — the live
 * options come from the feed's own property-type endpoint (see
 * ./propertyTypeIndex.ts). What lives here is MLS-agnostic: a heuristic
 * for "is this a home?" and a fallback list for when the feed is
 * unreachable or IDX is not connected yet.
 */

/**
 * True when a feed property-type name describes a home for sale. Used to
 * default searches to residential (the MLS mixes seasonal rentals into the
 * same feed, which puts $4,000 "listings" beside $4M homes) and to keep
 * land/commercial out of sections meant to show houses.
 */
export function isResidentialType(name: string): boolean {
  const n = name.toLowerCase();
  if (/lease|rent|land|lot|acreage|comm|industrial|business|farm|timeshare|dock|slip|storage/.test(n)) {
    return false;
  }
  return /resid|single|condo|town|villa|multi|duplex|two-family|co-?op|attached|detached|mobile|manufactured/.test(n);
}

/** Fallback filter options shown before the feed's own list is available. */
export const PROPERTY_TYPES = [
  'Single-Family',
  'Condominium',
  'Townhouse',
  'Multi-Family',
  'Land',
] as const;

export const RESIDENTIAL_PROPERTY_TYPES = PROPERTY_TYPES.filter((t) => isResidentialType(t));
