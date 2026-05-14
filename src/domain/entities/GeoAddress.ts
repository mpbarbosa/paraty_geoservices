/**
 * Canonical domain representation of a resolved address.
 *
 * @module domain/entities/GeoAddress
 * @since 1.2.4
 * @author Marcelo Pereira Barbosa
 */

/**
 * A standardized, provider-agnostic address returned by any reverse geocoder.
 *
 * All fields use English names so that application and domain code remain
 * independent of any particular provider or locale.
 */
export interface GeoAddress {
  /** Street name, or `null` if unavailable. */
  street: string | null;
  /** Street number, or `null` if unavailable. */
  streetNumber: string | null;
  /** Apartment, floor, or other complement, or `null` if unavailable. */
  complement: string | null;
  /** Neighborhood or district, or `null` if unavailable. */
  neighborhood: string | null;
  /** City or municipality, or `null` if unavailable. */
  city: string | null;
  /** Metropolitan region, or `null` if unavailable. */
  metropolitanRegion: string | null;
  /** Full state/province name, or `null` if unavailable. */
  state: string | null;
  /** State/province abbreviation code, or `null` if unavailable. */
  stateCode: string | null;
  /** Postal / ZIP code, or `null` if unavailable. */
  postalCode: string | null;
  /** Country name. */
  country: string;
}
