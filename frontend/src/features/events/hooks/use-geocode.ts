"use client";

import { useState, useEffect } from "react";

interface GeocodeResult {
  lat: number;
  lon: number;
}

interface UseGeocodeReturn {
  coords: GeocodeResult | null;
  loading: boolean;
  error: boolean;
}

export function useGeocode(location: string): UseGeocodeReturn {
  const [coords, setCoords] = useState<GeocodeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!location) {
      setCoords(null);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;

    async function geocode() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
          { headers: { "Accept-Language": "en" } }
        );
        if (!res.ok) throw new Error("Geocode failed");
        const data = await res.json();
        if (!cancelled && data?.[0]) {
          setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        } else if (!cancelled) {
          setError(true);
          setCoords(null);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setCoords(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    geocode();
    return () => { cancelled = true; };
  }, [location]);

  return { coords, loading, error };
}
