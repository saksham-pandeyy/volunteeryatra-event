"use client";

import { useEffect, useRef, useState } from "react";
import { useGeocode } from "../hooks/use-geocode";
import { MapPin, Navigation, Loader2 } from "lucide-react";

interface EventMapProps {
  location: string;
  className?: string;
}

export function EventMap({ location, className = "" }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { coords, loading, error } = useGeocode(location);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!coords || !mapRef.current) return;
    const { lat, lon } = coords;
    let mapInstance: any = null;

    async function initMap() {
      const L = await import("leaflet");

      // Create custom SVG marker
      const markerIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #16a34a, #15803d);
          border: 3px solid #ffffff;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4), 0 0 0 4px rgba(22, 163, 74, 0.15);
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      if (!mapRef.current) return;

      mapInstance = L.map(mapRef.current, {
        center: [lat, lon],
        zoom: 16,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: true,
      });

      // Realistic OpenStreetMap tiles showing localities
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "",
      }).addTo(mapInstance);

      L.marker([lat, lon], { icon: markerIcon }).addTo(mapInstance);

      setMapReady(true);
    }

    initMap();
    return () => {
      if (mapInstance) mapInstance.remove();
      setMapReady(false);
    };
  }, [coords]);

  if (!location) return null;

  if (loading) {
    return (
      <div className={`h-48 sm:h-56 rounded-xl bg-gradient-to-br from-base-50 to-base-100 flex flex-col items-center justify-center gap-3 ${className}`}>
        <Loader2 size={22} className="text-primary animate-spin" />
        <p className="text-xs text-muted font-medium">Loading map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`h-48 sm:h-56 rounded-xl bg-gradient-to-br from-base-50 to-base-100 border border-surface-border flex flex-col items-center justify-center gap-2 ${className}`}>
        <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
          <MapPin size={18} className="text-amber-500" />
        </div>
        <p className="text-xs text-muted font-medium">{location}</p>
        <p className="text-[10px] text-muted/60">Map preview unavailable</p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border border-surface-border group ${className}`}>
      <div ref={mapRef} style={{ height: "240px", width: "100%" }} />
      
      {/* Location label overlay */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm border border-surface-border/50 z-[1000]">
        <MapPin size={14} className="text-primary shrink-0" />
        <span className="text-xs font-medium text-foreground truncate">{location}</span>
        <a
          href={`https://www.google.com/maps?q=${encodeURIComponent(location)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-[10px] font-semibold"
        >
          <Navigation size={11} />
          Open
        </a>
      </div>

      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      <style>{`
        .custom-marker {
          background: none !important;
          border: none !important;
        }
        .leaflet-control-zoom { display: none !important; }
        .leaflet-control-attribution { display: none !important; }
      `}</style>
    </div>
  );
}
