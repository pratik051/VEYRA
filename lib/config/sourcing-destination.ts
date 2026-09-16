/**
 * SERVER-SIDE ONLY: Private SAJILOMARTS Sourcing & Cross-Border Delivery Destination.
 *
 * CRITICAL SECURITY & PRIVACY POLICY:
 * This configuration is strictly internal to SAJILOMARTS backend operations.
 * It must NEVER be exposed in:
 * - Client-side UI components
 * - Public API response JSON payloads
 * - Frontend state / localStorage / sessionStorage
 * - Search parameters or query strings
 * - Public documentation or README
 */

export const SOURCING_DESTINATION = {
  postOffice: process.env.SAJILOMARTS_TRANSIT_POST_OFFICE || "CHIKANIGHAT",
  district: process.env.SAJILOMARTS_TRANSIT_DISTRICT || "ARARIA",
  state: process.env.SAJILOMARTS_TRANSIT_STATE || "BIHAR",
  pin: process.env.SAJILOMARTS_TRANSIT_PIN || "854331",
  deliveryStatus: process.env.SAJILOMARTS_TRANSIT_STATUS || "DELIVERY"
} as const;

export const DEFAULT_TRANSIT_PIN = SOURCING_DESTINATION.pin;
