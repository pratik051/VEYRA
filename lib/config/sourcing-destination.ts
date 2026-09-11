/**
 * SERVER-SIDE ONLY: Private LINKOVA Sourcing & Cross-Border Delivery Destination.
 *
 * CRITICAL SECURITY & PRIVACY POLICY:
 * This configuration is strictly internal to LINKOVA backend operations.
 * It must NEVER be exposed in:
 * - Client-side UI components
 * - Public API response JSON payloads
 * - Frontend state / localStorage / sessionStorage
 * - Search parameters or query strings
 * - Public documentation or README
 */

export const SOURCING_DESTINATION = {
  postOffice: process.env.LINKOVA_TRANSIT_POST_OFFICE || "CHIKANIGHAT",
  district: process.env.LINKOVA_TRANSIT_DISTRICT || "ARARIA",
  state: process.env.LINKOVA_TRANSIT_STATE || "BIHAR",
  pin: process.env.LINKOVA_TRANSIT_PIN || "854331",
  deliveryStatus: process.env.LINKOVA_TRANSIT_STATUS || "DELIVERY"
} as const;

export const DEFAULT_TRANSIT_PIN = SOURCING_DESTINATION.pin;
