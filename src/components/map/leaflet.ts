"use client";

/**
 * SSR-safe Leaflet helpers. Leaflet touches `window`/`document`, so the real
 * library is only loaded at runtime inside `useEffect` (client only) — never
 * during prerendering. Markers use `L.divIcon` (pure HTML/CSS pins), so we
 * avoid Leaflet's default-marker-image asset problem entirely.
 */

import "leaflet/dist/leaflet.css";
import type { DivIcon } from "leaflet";
import type { Map as LeafletMap } from "leaflet";

export type LeafletModule = typeof import("leaflet");

let leafletPromise: Promise<LeafletModule> | null = null;

/** Lazy-once loader. Never awaited during SSR — call it inside useEffect. */
export function loadLeaflet(): Promise<LeafletModule> {
  leafletPromise ??= import("leaflet");
  return leafletPromise;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export const DEFAULT_CENTER: LatLng = { lat: 29.8017, lng: 76.3997 }; // Kaithal
export const DEFAULT_ZOOM = 12;

/**
 * Create a map inside `div` (which must already be mounted). Returns both the
 * map and the current Leaflet module so callers can build markers. Callers are
 * responsible for calling `map.remove()` on cleanup.
 */
export async function renderMap(
  div: HTMLDivElement,
  center: LatLng,
  zoom: number
): Promise<{ map: LeafletMap; L: LeafletModule } | null> {
  try {
    const L = await loadLeaflet();
    const map = L.map(div, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
    }).setView([center.lat, center.lng], zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.control.attribution({ position: "bottomleft", prefix: false }).addTo(map);
    return { map, L };
  } catch {
    return null;
  }
}

/** CSS-only teal location pin (avoids Leaflet's image-based default icon). */
export function tealPin(L: LeafletModule, label?: string): DivIcon {
  const active = Boolean(label);
  return L.divIcon({
    className: "mg-pin-wrap",
    html: `<div class="mg-pin${active ? " mg-pin--active" : ""}">
      ${label ? `<span>${label}</span>` : ""}</div>`,
    iconSize: active ? undefined : [26, 34],
    iconAnchor: active ? undefined : [13, 33],
    popupAnchor: active ? undefined : [0, -31],
    tooltipAnchor: [12, -12],
  });
}

/** Residential property marker pin (teal drop) bound to a tooltip + popup. */
export function propertyPin(L: LeafletModule): DivIcon {
  return L.divIcon({
    className: "mg-pin-wrap",
    html: `<div class="mg-property-pin"></div>`,
    iconSize: [22, 30],
    iconAnchor: [11, 29],
    popupAnchor: [0, -28],
  });
}

export interface ReverseGeocodeResult {
  latitude: number;
  longitude: number;
  city?: string;
  locality?: string;
  areaLabel: string;
}

/**
 * Reverse geocode a point into a best-effort city + locality using OpenStreetMap
 * Nominatim (free, no API key). Returns null when it fails or is blocked.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1&accept-language=hi`,
      { signal: ctrl.signal }
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const a = data?.address ?? {};
    const city =
      a.city || a.county || a.town || a.village || a.municipality || (a.state_district ?? "");
    const locality =
      a.suburb || a.neighbourhood || a.village_section || a.residential || a.road || a.hamlet || "";
    const areaLabel =
      [a.suburb, a.neighbourhood, a.village_section, a.residential, a.road, a.hamlet, a.village, a.town, a.city, a.county]
        .find(Boolean) ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    return { latitude: lat, longitude: lng, city, locality, areaLabel };
  } catch {
    return null;
  }
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name?: string;
  address?: {
    city?: string;
    county?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state_district?: string;
    suburb?: string;
    neighbourhood?: string;
    village_section?: string;
    residential?: string;
  };
}

/**
 * Forward geocode a locality query against a tight bounding box around the
 * default city so results stay in the right region. Returns candidates.
 */
export async function geocodeArea(
  query: string,
  bbox: string = "75.5,29.2,77.5,30.6"
): Promise<ReverseGeocodeResult[]> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const q = encodeURIComponent(query);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${q}&limit=6&viewbox=${bbox}&bounded=1&addressdetails=1&accept-language=hi`,
      { signal: ctrl.signal }
    );
    clearTimeout(timer);
    if (!res.ok) return [];
    const list = await res.json();
    if (!Array.isArray(list)) return [];
    return list
      .map((r: NominatimResult) => {
        const a = r?.address ?? {};
        return {
          latitude: Number(r.lat),
          longitude: Number(r.lon),
          city:
            a.city || a.county || a.town || a.village || a.municipality || a.state_district || "",
          locality: a.suburb || a.neighbourhood || a.village_section || a.residential || "",
          areaLabel: r?.display_name ?? "",
        };
      })
      .filter((c) => Number.isFinite(c.latitude) && Number.isFinite(c.longitude));
  } catch {
    return [];
  }
}

/** Browser geolocation promise with a timeout. */
export function getBrowserLocation(timeoutMs = 9000): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60000 }
    );
  });
}
