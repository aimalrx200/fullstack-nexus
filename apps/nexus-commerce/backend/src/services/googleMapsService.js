import { Client } from "@googlemaps/google-maps-services-js";
import env from "#config/env.js";
import { logger } from "#config/logger.js";

const mapsClient = new Client({});

/**
 * Calculates delivery distance and rates using Google Maps Distance Matrix API.
 */
export const calculateShippingQuote = async ({
  originAddress = "Gulberg III, Lahore, Pakistan",
  destinationAddress,
  destinationCity,
  destinationCoordinates,
}) => {
  const cleanCity = (destinationCity || "Lahore").trim().toLowerCase();
  const isLocalMetro = [
    "lahore",
    "karachi",
    "islamabad",
    "rawalpindi",
    "faisalabad",
  ].includes(cleanCity);

  let distanceKm = isLocalMetro ? 15 : 350;
  let estimatedDays = isLocalMetro ? "1-2 Business Days" : "3-5 Business Days";

  if (env.GOOGLE_MAPS_API_KEY && destinationAddress) {
    try {
      const response = await mapsClient.distancematrix({
        params: {
          origins: [originAddress],
          destinations: [destinationAddress],
          key: env.GOOGLE_MAPS_API_KEY,
        },
        timeout: 4000,
      });

      const element = response.data.rows[0]?.elements[0];
      if (element && element.status === "OK") {
        distanceKm = Math.round(element.distance.value / 1000);
        estimatedDays = element.duration.text;
      }
    } catch (err) {
      logger.warn({
        msg: "Google Maps Distance Matrix call fell back to domestic tiering",
        error: err.message,
      });
    }
  }

  // Dynamic logistics calculation
  const shippingFeePKR = isLocalMetro ? 200 : 350;
  const shippingFeeUSD = isLocalMetro ? 1.5 : 2.5;

  return {
    originAddress,
    destinationAddress: destinationAddress || destinationCity,
    destinationCity: destinationCity || "Domestic",
    distanceKm,
    estimatedDays,
    shippingFeePKR,
    shippingFeeUSD,
    destinationCoordinates: destinationCoordinates || {
      lat: 31.5204,
      lng: 74.3587,
    },
  };
};

/**
 * Geocodes an address string to precise coordinates.
 */
export const geocodeAddress = async (addressString) => {
  if (env.GOOGLE_MAPS_API_KEY && addressString) {
    try {
      const response = await mapsClient.geocode({
        params: {
          address: addressString,
          key: env.GOOGLE_MAPS_API_KEY,
        },
        timeout: 4000,
      });

      const result = response.data.results[0];
      if (result) {
        return {
          formattedAddress: result.formatted_address,
          coordinates: result.geometry.location,
        };
      }
    } catch (err) {
      logger.error({
        msg: "Google Geocoding SDK request exception",
        error: err.message,
      });
    }
  }

  return {
    formattedAddress: addressString,
    coordinates: { lat: 31.5204, lng: 74.3587 },
  };
};
