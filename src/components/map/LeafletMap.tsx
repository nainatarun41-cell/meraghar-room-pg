"use client";

/**
 * Thin, SSR-safe Leaflet helpers. Leaflet touches `window`/`document`, so
 * the real library is only loaded lazily inside `useEffect` (client runtime),
 * never during prerendering. Markers use `L.divIcon` (pure HTML/CSS pins), so
 * we avoid the classic Leaflet default-marker-image asset problem entirely.
 */

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMapInstance, LatLngExpression, LayerGroup } from "leaflet";

type LeafletModule = typeof import("leaflet");
let leafletPromise: Promise<LeafletModule> | null = null;
function getLeaflet(): Promise<LeafletModule> {
  leafletPromise ??= import("leaflet") as unknown as Promise<LeafletModule>;
  return leafletPromise;
}

export interface MapPoint {
  latitude: number;
  longitude: number;
}

export interface PickResult {
  latitude: number;
  longitude: number;
  city?: string;
  locality?: string;
}

const DEFAULT_CENTER: [number, number] = [29.8017, 76.3997]; // Kaithal
const DEFAULT_ZOOM = 12;

/** Build a CSS-only teal pin used for every marker. */
export async function makePin(
  L: LeafletModule,
  label?: string
): Promise<L.DivIcon> {
  const active = Boolean(label);
  const html = `<div class="mg-pin${active ? " mg-pin--active" : ""}${label ? " mg-pin--with-label" : ""}">${
    label ? `<span>₹${label}</span>` : ""
  }</div>`;
  return L.divIcon({
    className: "mg-pin-wrap",
    html,
    iconSize: label ? undefined : [26, 32],
    iconAnchor: label ? undefined : [13, 30],
    popupAnchor: [0, -26],
  });
}

/**
 * A bare Leaflet map mounted into a target div. Returns the map instance.
 * Callers add markers/layers themselves. Cleaned up on unmount.
 */
export function useLeafletMap(center: LatLngExpression = DEFAULT_CENTER, zoom = DEFAULT_ZOOM) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMapInstance | null>(null);

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMapInstance | null = null;
    getLeaflet().then((L) => {
      if (cancelled || !divRef.current) return;
      map = L.map(divRef.current, { zoomControl: false, attributionControl: false });
      map.setView(center, zoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control.attribution({ position: "bottomleft", prefix: false }).addTo(map);
      mapRef.current = map;
    });
    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, [center, zoom]);

  return { divRef, getMap: () => mapRef.current };
}

/** Returns a fresh layer group added to the map, or null before the map is ready. */
export function createLayerGroup(map: LeafletMapInstance | null, L?: LeafletModule): LayerGroup | null {
  if (!map || !L) return null;
  const group = L.layerGroup();
  group.addTo(map);
  return group;
}

/** Reverse geocode a point with Nominatim (free, no key needed for light use). */
export async function reverseGeocode(lat: number, lng: number): Promise<PickResult | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { signal: ctrl.signal }
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const a = data?.address ?? {};
    const city = a.city || a.town || a.village || a.municipality || a.state_district || "";
    const locality = a.suburb || a.neighbourhood || a.village_section || a.road || "";
    return { latitude: lat, longitude: lng, city, locality };
  } catch {
    return null;
  }
}

export type { LeafletMapInstance, LatLngExpression, LayerGroup };
