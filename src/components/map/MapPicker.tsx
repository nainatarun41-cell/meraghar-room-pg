"use client";

import { useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin, Navigation, Search } from "lucide-react";
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  geocodeArea,
  getBrowserLocation,
  renderMap,
  reverseGeocode,
  type LatLng,
  type LeafletModule,
} from "./leaflet";
import type { Map as LeafletMap, Marker } from "leaflet";

interface MapPickerProps {
  latitude: string;
  longitude: string;
  onChange: (
    lat: number | null,
    lng: number | null,
    extra?: { city?: string; locality?: string }
  ) => void;
}

interface GeoCandidate {
  latitude: number;
  longitude: number;
  areaLabel: string;
  city?: string;
  locality?: string;
}

function validCoord(value: string): number | null {
  if (!value || Number.isNaN(Number(value))) return null;
  return Number(value);
}

function coordsFromInput(latitude: string, longitude: string): LatLng | null {
  const lat = validCoord(latitude);
  const lng = validCoord(longitude);
  return lat !== null && lng !== null ? { lat, lng } : null;
}

const SEARCH_BBOX = "75.5,29.2,77.5,30.6";

export function MapPicker({ latitude, longitude, onChange }: MapPickerProps) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const LRef = useRef<LeafletModule | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const [current, setCurrent] = useState<LatLng | null>(() =>
    coordsFromInput(latitude, longitude)
  );
  const [areaLabel, setAreaLabel] = useState<string>("");
  const [results, setResults] = useState<GeoCandidate[]>([]);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);

  function placePin(lat: number, lng: number) {
    const map = mapRef.current;
    if (!map) return;
    const point: LatLng = { lat, lng };
    setCurrent(point);
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else if (LRef.current) {
      const pin = LRef.current.divIcon({
        className: "mg-pin-wrap",
        html: `<div class="mg-pin mg-pin--active"></div>`,
      });
      markerRef.current = LRef.current.marker([lat, lng], { icon: pin }).addTo(map);
    }
    setAreaLabel("");
  }

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;

    (async () => {
      if (!divRef.current) return;
      const initialPosition = coordsFromInput(latitude, longitude);
      const init = await renderMap(
        divRef.current,
        initialPosition ?? DEFAULT_CENTER,
        initialPosition ? 15 : DEFAULT_ZOOM
      );
      if (!init || cancelled) {
        init?.map.remove();
        return;
      }
      map = init.map;
      mapRef.current = map;
      LRef.current = init.L;

      if (initialPosition && LRef.current) {
        const pin = LRef.current.divIcon({
          className: "mg-pin-wrap",
          html: `<div class="mg-pin mg-pin--active"></div>`,
        });
        markerRef.current = LRef.current
          .marker([initialPosition.lat, initialPosition.lng], { icon: pin })
          .addTo(map);
      }

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng;
        placePin(lat, lng);
        reverseGeocode(lat, lng)
          .then((geo) => {
            if (geo) {
              setAreaLabel(geo.areaLabel);
              onChangeRef.current(lat, lng, {
                city: geo.city || undefined,
                locality: geo.locality || undefined,
              });
            } else {
              setAreaLabel("");
              onChangeRef.current(lat, lng);
            }
          })
          .catch(() => onChangeRef.current(lat, lng));
      });
    })();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      LRef.current = null;
    };
  }, [latitude, longitude]);

  async function handleLocate() {
    setLocating(true);
    try {
      const pos = await getBrowserLocation(12000);
      const map = mapRef.current;
      map?.setView([pos.lat, pos.lng], 15);
      placePin(pos.lat, pos.lng);
      const geo = await reverseGeocode(pos.lat, pos.lng).catch(() => null);
      if (geo) {
        setAreaLabel(geo.areaLabel);
        onChangeRef.current(pos.lat, pos.lng, {
          city: geo.city || undefined,
          locality: geo.locality || undefined,
        });
      } else {
        onChangeRef.current(pos.lat, pos.lng);
      }
    } catch {
      setAreaLabel("Location access denied or unavailable.");
    } finally {
      setLocating(false);
    }
  }

  async function handleSearch() {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setResults([]);
    const list = await geocodeArea(q, SEARCH_BBOX).catch(() => []);
    setResults(list);
    setSearching(false);
  }

  function selectResult(r: GeoCandidate) {
    const map = mapRef.current;
    if (map) map.setView([r.latitude, r.longitude], 15);
    placePin(r.latitude, r.longitude);
    setAreaLabel(r.areaLabel);
    setResults([]);
    setQuery("");
    onChangeRef.current(r.latitude, r.longitude, { city: r.city, locality: r.locality });
  }

  function clearPin() {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    setCurrent(null);
    setAreaLabel("");
    onChangeRef.current(null, null);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3">
        <div className="relative min-w-0 flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search area, e.g. City Centre, Pehowa Road"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-teal-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
        >
          {searching ? "Searching..." : "Search"}
        </button>
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
        >
          <LocateFixed className="h-4 w-4 text-teal-600" />
          {locating ? "Locating..." : "My location"}
        </button>
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <div className="border-t border-slate-200 bg-white">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectResult(r)}
              className="flex w-full items-center gap-2 border-b border-slate-100 px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-teal-50"
            >
              <MapPin className="h-4 w-4 shrink-0 text-teal-600" />
              <span className="truncate">{r.areaLabel}</span>
            </button>
          ))}
        </div>
      )}

      {/* Map */}
      <div ref={divRef} className="h-72 w-full bg-slate-100" />

      {/* Footer / status */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
        <span className="flex min-w-0 items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-teal-600" />
          {current ? (
            <span className="truncate">
              {areaLabel || `${current.lat.toFixed(5)}, ${current.lng.toFixed(5)}`}
            </span>
          ) : (
            <span>Click on the map to set the exact location</span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {current && (
            <button
              type="button"
              onClick={clearPin}
              className="font-semibold text-red-500 transition-colors hover:text-red-700"
            >
              Remove
            </button>
          )}
          {current ? (
            <span className="rounded-md bg-teal-50 px-2 py-0.5 font-semibold text-teal-700">
              Location set
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-400">
              <Navigation className="h-3.5 w-3.5" /> Optional
            </span>
          )}
        </span>
      </div>
    </div>
  );
}