"use client";

import dynamic from "next/dynamic";
import type { LeafletMapProps } from "./LeafletMap";

/* Leaflet touches `window` at import time, so the map is client-only; the
   placeholder keeps the layout from jumping while it loads. */
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="area-map__canvas area-map__canvas--loading" aria-hidden="true" />,
});

export default function AreaMap(props: LeafletMapProps) {
  return (
    <div className="area-map">
      <LeafletMap {...props} />
    </div>
  );
}
