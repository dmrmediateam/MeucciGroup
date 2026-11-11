import 'server-only';
import { unstable_cache } from 'next/cache';
import { idxRequest } from './request';
import { primaryIdxId } from './locations';
import { PROPERTY_TYPES, isResidentialType } from './propertyTypes';

/* ==========================================================================
   The feed's own property types, from /mls/propertytypes/{idxId}.

   Type names differ per MLS (Naples: "Single-Family"; San Diego:
   "Residential"), so the filter dropdown and the residential search default
   both read the live list rather than a shipped one. Small, stable data:
   cached a day, with the generic fallback when the feed is unreachable.
   ========================================================================== */

const TYPES_REVALIDATE_SECONDS = 60 * 60 * 24; // 24h

interface RawPropertyType {
  mlsPropertyType?: string;
  mlsPtName?: string;
  name?: string;
}

async function fetchPropertyTypes(idxId: string): Promise<string[]> {
  if (!idxId) return [];
  const raw = await idxRequest<unknown>(`/mls/propertytypes/${idxId}`, {
    revalidateSeconds: TYPES_REVALIDATE_SECONDS,
    retries: 1,
  }).catch(() => []);
  const items: RawPropertyType[] = Array.isArray(raw)
    ? raw
    : Object.values((raw ?? {}) as Record<string, RawPropertyType>);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const name = String(item?.mlsPropertyType ?? item?.mlsPtName ?? item?.name ?? '').trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    out.push(name);
  }
  return out;
}

const cachedPropertyTypes = unstable_cache(
  async () => fetchPropertyTypes(await primaryIdxId()),
  ['idx-property-types-v1'],
  { revalidate: TYPES_REVALIDATE_SECONDS, tags: ['idx-locations'] },
);

/** Every property type the MLS offers (falls back to a generic list). */
export async function getPropertyTypes(): Promise<string[]> {
  const live = await cachedPropertyTypes().catch(() => [] as string[]);
  return live.length > 0 ? live : [...PROPERTY_TYPES];
}

/**
 * The subset that means "a home for sale" — the default search constraint.
 * If the heuristic recognizes nothing (an unusual MLS vocabulary), searches
 * run unconstrained rather than empty.
 */
export async function getResidentialTypes(): Promise<string[] | undefined> {
  const all = await getPropertyTypes();
  const residential = all.filter(isResidentialType);
  return residential.length > 0 ? residential : undefined;
}
