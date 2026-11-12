import type { ListingDetail, ListingSummary } from "@/lib/idx/types";

/* ==========================================================================
   DEMO LISTINGS
   Placeholder properties shown on the homepage "Featured Properties" band and
   rendered at /listing/<slug> through the same detail template real IDX
   listings use. They are clearly labelled as demonstrations on the page and
   are kept out of search engines. Delete this file and the `featured`
   placeholders in content/site.ts once IDX Broker is connected.
   ========================================================================== */

const U = (id: string, w = 1800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const DEMO_NOTE =
  "Demonstration listing. Photos, pricing and details are illustrative placeholders shown while live MLS data is being connected. They do not represent a property currently offered for sale.";

type Seed = Omit<ListingDetail, "slug" | "detailUrl" | "primaryPhoto" | "propertyType" | "waterfront" | "featured" | "idxId" | "listingId" | "attribution" | "disclosures"> & {
  slug: string;
};

const seeds: Seed[] = [
  {
    slug: "warm-springs-road-ketchum-demo-0001",
    mlsNumber: "DEMO-0001",
    status: "active",
    price: 2450000,
    beds: 4,
    baths: 3.5,
    sqFt: 3210,
    daysOnMarket: 12,
    listOfficeName: "Engel & Völkers Sun Valley",
    address: {
      full: "Warm Springs Road, Ketchum, ID 83340",
      street: "Warm Springs Road",
      city: "Ketchum",
      state: "ID",
      postalCode: "83340",
      county: "Blaine",
      subdivision: "Warm Springs",
      slug: "warm-springs-road-ketchum",
    },
    photos: [
      { url: U("photo-1518780664697-55e3ad937233"), caption: "Timber and stone exterior with Baldy views" },
      { url: U("photo-1600607687939-ce8a6c25118c"), caption: "Great room with vaulted ceilings" },
      { url: U("photo-1600566753190-17f0baa2a6c3"), caption: "Chef's kitchen" },
      { url: U("photo-1600210492486-724fe5c67fb0"), caption: "Primary suite" },
      { url: U("photo-1600573472592-401b489a3cdc"), caption: "Primary bath" },
      { url: U("photo-1600585152220-90363fe7e115"), caption: "Rear patio and fire pit" },
    ],
    description:
      "Tucked along Warm Springs Road, minutes from the lifts, this mountain contemporary blends timber, stone and glass with the kind of views that make you stop mid-sentence. A vaulted great room opens to a chef's kitchen and a covered patio built for long summer evenings. Four bedrooms include a main-level primary suite with a spa bath and private deck. Radiant heat, a heated two-car garage and a mudroom sized for a family's worth of ski gear round out a home that works as well on a powder morning as it does on a July afternoon.",
    features: {
      waterfront: false,
      yearBuilt: 2017,
      lotSizeAcres: 0.42,
      garageSpaces: 2,
      propertyType: "Single Family",
      groups: [
        {
          title: "Interior",
          items: [
            { label: "Bedrooms", value: "4" },
            { label: "Bathrooms", value: "3 full, 1 half" },
            { label: "Living Area", value: "3,210 sq. ft." },
            { label: "Fireplaces", value: "2, wood-burning and gas" },
            { label: "Flooring", value: "Wide-plank white oak, slate" },
            { label: "Heating", value: "Radiant in-floor, forced air" },
          ],
        },
        {
          title: "Exterior & Lot",
          items: [
            { label: "Lot Size", value: "0.42 acres" },
            { label: "Views", value: "Bald Mountain, Warm Springs" },
            { label: "Outdoor", value: "Covered patio, fire pit, hot tub" },
            { label: "Garage", value: "2-car, heated" },
          ],
        },
        {
          title: "Location",
          items: [
            { label: "Neighborhood", value: "Warm Springs" },
            { label: "To Warm Springs Lifts", value: "4 minutes" },
            { label: "To Downtown Ketchum", value: "6 minutes" },
            { label: "School District", value: "Blaine County" },
          ],
        },
      ],
    },
  },
  {
    slug: "elkhorn-village-sun-valley-demo-0002",
    mlsNumber: "DEMO-0002",
    status: "active",
    price: 1195000,
    beds: 3,
    baths: 3,
    sqFt: 1860,
    daysOnMarket: 27,
    listOfficeName: "Engel & Völkers Sun Valley",
    address: {
      full: "Elkhorn Village, Sun Valley, ID 83354",
      street: "Elkhorn Village",
      city: "Sun Valley",
      state: "ID",
      postalCode: "83354",
      county: "Blaine",
      subdivision: "Elkhorn",
      slug: "elkhorn-village-sun-valley",
    },
    photos: [
      { url: U("photo-1449844908441-8829872d2607"), caption: "Elkhorn Village exterior" },
      { url: U("photo-1502672260266-1c1ef2d93688"), caption: "Open living and dining" },
      { url: U("photo-1556912172-45b7abe8b7e1"), caption: "Renovated kitchen" },
      { url: U("photo-1505691938895-1758d7feb511"), caption: "Primary bedroom" },
      { url: U("photo-1522708323590-d24dbb6b0267"), caption: "Guest suite" },
      { url: U("photo-1470770841072-f978cf4d019e"), caption: "Dollar Mountain views from the deck" },
    ],
    description:
      "A fully renovated three-bedroom in Elkhorn Village with Dollar Mountain out the window and the Sun Valley Lodge a bike ride away. The remodel kept what matters, a sunlit open plan and a wraparound deck, and upgraded everything else: quartz counters, new appliances, tiled baths and a mudroom with ski lockers. Two of the three bedrooms are en suite, so it works equally well as a full-time home or a lock-and-leave base for the mountain. HOA covers the pool, tennis courts, snow removal and the Elkhorn trail network at your door.",
    features: {
      waterfront: false,
      yearBuilt: 1982,
      garageSpaces: 1,
      propertyType: "Condominium",
      groups: [
        {
          title: "Interior",
          items: [
            { label: "Bedrooms", value: "3" },
            { label: "Bathrooms", value: "3 full" },
            { label: "Living Area", value: "1,860 sq. ft." },
            { label: "Renovated", value: "2023" },
            { label: "Fireplace", value: "Gas, living room" },
            { label: "Laundry", value: "In unit" },
          ],
        },
        {
          title: "Community",
          items: [
            { label: "HOA", value: "Pool, tennis, snow removal, exterior maintenance" },
            { label: "Parking", value: "1-car garage plus assigned space" },
            { label: "Trails", value: "Elkhorn trail network, direct access" },
            { label: "Rentals", value: "Short-term rentals permitted" },
          ],
        },
        {
          title: "Location",
          items: [
            { label: "Neighborhood", value: "Elkhorn" },
            { label: "To Dollar Mountain", value: "5 minutes" },
            { label: "To Sun Valley Lodge", value: "7 minutes" },
            { label: "To Downtown Ketchum", value: "10 minutes" },
          ],
        },
      ],
    },
  },
  {
    slug: "woodside-hailey-demo-0003",
    mlsNumber: "DEMO-0003",
    status: "pending",
    price: 875000,
    beds: 3,
    baths: 2,
    sqFt: 1940,
    daysOnMarket: 9,
    listOfficeName: "Engel & Völkers Sun Valley",
    address: {
      full: "Woodside, Hailey, ID 83333",
      street: "Woodside",
      city: "Hailey",
      state: "ID",
      postalCode: "83333",
      county: "Blaine",
      subdivision: "Woodside",
      slug: "woodside-hailey",
    },
    photos: [
      { url: U("photo-1600585154526-990dced4db0d"), caption: "Street view" },
      { url: U("photo-1600047509807-ba8f99d2cdde"), caption: "Living room" },
      { url: U("photo-1484154218962-a197022b5858"), caption: "Kitchen and dining" },
      { url: U("photo-1598928506311-c55ded91a20c"), caption: "Family room" },
      { url: U("photo-1564013799919-ab600027ffc6"), caption: "Fenced backyard" },
    ],
    description:
      "Single-level living on a quiet Woodside street, with a fenced yard, mature trees and a south-facing patio that soaks up the Hailey sun. The open floor plan centers on a kitchen island built for crowds, and the split-bedroom layout keeps the primary suite private. A finished two-car garage, RV parking and a storage shed handle bikes, boats and everything else the Valley collects. Walk to Woodside Park, the bike path and Hailey's schools. Under contract and accepting backup offers.",
    features: {
      waterfront: false,
      yearBuilt: 2004,
      lotSizeAcres: 0.23,
      garageSpaces: 2,
      propertyType: "Single Family",
      groups: [
        {
          title: "Interior",
          items: [
            { label: "Bedrooms", value: "3" },
            { label: "Bathrooms", value: "2 full" },
            { label: "Living Area", value: "1,940 sq. ft." },
            { label: "Layout", value: "Single level, split bedrooms" },
            { label: "Heating", value: "Natural gas forced air" },
            { label: "Cooling", value: "Central air" },
          ],
        },
        {
          title: "Exterior & Lot",
          items: [
            { label: "Lot Size", value: "0.23 acres" },
            { label: "Yard", value: "Fully fenced, sprinklers, mature trees" },
            { label: "Parking", value: "2-car garage, RV pad" },
            { label: "Storage", value: "Detached shed" },
          ],
        },
        {
          title: "Location",
          items: [
            { label: "Neighborhood", value: "Woodside" },
            { label: "To Woodside Park", value: "3 minute walk" },
            { label: "To Downtown Hailey", value: "5 minutes" },
            { label: "To Bald Mountain", value: "20 minutes" },
          ],
        },
      ],
    },
  },
];

export const demoListings: ListingDetail[] = seeds.map((seed) => ({
  ...seed,
  idxId: "demo",
  listingId: seed.mlsNumber,
  detailUrl: `/listing/${seed.slug}`,
  primaryPhoto: seed.photos[0] ?? null,
  propertyType: seed.features.propertyType,
  waterfront: seed.features.waterfront,
  featured: true,
  attribution: "Listing courtesy of Engel & Völkers Sun Valley.",
  disclosures: [DEMO_NOTE],
}));

export function getDemoListing(slug: string): ListingDetail | null {
  return demoListings.find((listing) => listing.slug === slug) ?? null;
}

export function isDemoListing(listing: ListingDetail): boolean {
  return listing.idxId === "demo";
}

export function demoSummaries(excludeSlug?: string): ListingSummary[] {
  return demoListings.filter((listing) => listing.slug !== excludeSlug);
}
