import { useEffect, useState, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MAP_CENTER, MAP_ZOOM } from '../config';

export const CHART_PAPER_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#141e28' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#101820' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8899aa' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#2a3a4e' }],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#1a2634' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0c1520' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4a6078' }],
  },
];

/**
 * Custom hook to load and initialize Google Maps instance.
 * @param {React.RefObject<HTMLDivElement>} containerRef
 */
export function useGoogleMap(containerRef) {
  const [map, setMap] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;

    const searchParams = new URLSearchParams(window.location.search);
    const apiKey =
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
      searchParams.get('key') ||
      searchParams.get('maps_key') ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('GOOGLE_MAPS_API_KEY')) ||
      '';
    if (!apiKey) {
      setLoadError('Google Maps API key missing. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file or add ?key=YOUR_KEY to the URL.');
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['geometry'],
    });

    loader
      .load()
      .then((google) => {
        if (!containerRef.current) return;
        initializedRef.current = true;

        const mapInstance = new google.maps.Map(containerRef.current, {
          center: MAP_CENTER,
          zoom: MAP_ZOOM,
          disableDefaultUI: true,
          zoomControl: true,
          scaleControl: true,
          styles: CHART_PAPER_STYLES,
          backgroundColor: '#0c1520',
          minZoom: 3,
          maxZoom: 10,
        });

        setMap(mapInstance);
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error('Google Maps failed to load:', err);
        setLoadError(`Unable to load Google Maps (${err.message || 'Network error'}).`);
      });
  }, [containerRef]);

  return { map, isLoaded, loadError };
}
