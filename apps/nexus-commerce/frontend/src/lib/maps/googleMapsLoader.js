export const getGoogleMapsApiKey = () => {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
};

export const hasGoogleMapsKey = () => {
  return Boolean(getGoogleMapsApiKey());
};
