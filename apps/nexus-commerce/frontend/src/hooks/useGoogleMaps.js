import { useJsApiLoader } from "@react-google-maps/api";
import {
  getGoogleMapsApiKey,
  hasGoogleMapsKey,
} from "../lib/maps/googleMapsLoader";

const LIBRARIES = ["places", "geometry"];

export function useGoogleMaps() {
  const apiKey = getGoogleMapsApiKey();
  const isConfigured = hasGoogleMapsKey();

  const { isLoaded, loadError } = useJsApiLoader({
    id: "nexus-commerce-google-maps",
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  return {
    isLoaded: isConfigured && isLoaded,
    isConfigured,
    loadError,
  };
}
