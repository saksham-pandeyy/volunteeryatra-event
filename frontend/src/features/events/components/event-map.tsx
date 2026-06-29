"use client";

import { useEffect, useRef } from "react";
import { useGeocode } from "../hooks/use-geocode";
import { MapPin } from "lucide-react";

interface EventMapProps {
  location: string;
  className?: string;
}

export function EventMap({ location, className = "" }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { coords, loading, error } = useGeocode(location);

  // Load Leaflet map when coordinates are available
  useEffect(() => {
    if (!coords || !mapRef.current) return;
    const { lat, lon } = coords;

    let mapInstance: any = null;

    async function initMap() {
      const L = await import("leaflet");
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapRef.current) return;
      mapInstance = L.map(mapRef.current, {
        center: [lat, lon],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapInstance);

      const marker = L.marker([lat, lon]).addTo(mapInstance);
      marker.bindPopup(location);
    }

    initMap();
    return () => { if (mapInstance) mapInstance.remove(); };
  }, [coords, location]);

  if (!location) return null;

  if (loading) {
    return (
      <div className={`h-48 rounded-xl bg-surface-hover animate-pulse flex items-center justify-center ${className}`}>
        <MapPin size={20} className="text-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`h-48 rounded-xl bg-surface-hover/50 border border-surface-border flex items-center justify-center ${className}`}>
        <div className="text-center">
          <MapPin size={20} className="text-muted mx-auto mb-1" />
          <p className="text-xs text-muted">{location}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border border-surface-border ${className}`}>
      <div ref={mapRef} style={{ height: "220px", width: "100%" }} />
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
    </div>
  );
}
