/**
 * Pure address-mapping helpers for the AWS reverse geocoding provider.
 *
 * All functions in this module are stateless and side-effect-free, making
 * them independently testable and reusable without instantiating AwsGeocoder.
 *
 * @module infrastructure/providers/AwsAddressMapper
 * @since 1.2.4
 * @author Marcelo Pereira Barbosa
 */

import type { GeoAddress } from '../../domain/entities/GeoAddress';
import type { AwsAddress, AwsReverseGeocodeResponse } from './AwsGeocoder';

const BRAZIL_CODES = new Set(['BRA', 'BR', 'Brasil', 'Brazil']);

const BRAZIL_STATE_SIGLAS = new Map([
  ['Acre', 'AC'],
  ['Alagoas', 'AL'],
  ['Amapá', 'AP'],
  ['Amazonas', 'AM'],
  ['Bahia', 'BA'],
  ['Ceará', 'CE'],
  ['Distrito Federal', 'DF'],
  ['Espírito Santo', 'ES'],
  ['Goiás', 'GO'],
  ['Maranhão', 'MA'],
  ['Mato Grosso', 'MT'],
  ['Mato Grosso do Sul', 'MS'],
  ['Minas Gerais', 'MG'],
  ['Pará', 'PA'],
  ['Paraíba', 'PB'],
  ['Paraná', 'PR'],
  ['Pernambuco', 'PE'],
  ['Piauí', 'PI'],
  ['Rio de Janeiro', 'RJ'],
  ['Rio Grande do Norte', 'RN'],
  ['Rio Grande do Sul', 'RS'],
  ['Rondônia', 'RO'],
  ['Roraima', 'RR'],
  ['Santa Catarina', 'SC'],
  ['São Paulo', 'SP'],
  ['Sergipe', 'SE'],
  ['Tocantins', 'TO'],
]);

/**
 * Parses a label string from the AWS address response into a street name and
 * optional neighborhood.
 *
 * The label format is typically: `"Street [Number], Neighborhood, Municipality, PostalCode, Country"`.
 * This function strips the street number from the street name when present and
 * identifies the neighborhood candidate in the second label segment, skipping
 * segments that look like postal codes or are equal to the municipality name.
 *
 * @param label         - Raw label string from the AWS address response.
 * @param addressNumber - Street number to strip from the label, if any.
 * @param municipality  - Municipality name used to detect and skip that segment.
 * @returns Parsed `street` and `neighborhood` values (both may be `null`).
 */
export function parseLabel(
  label: unknown,
  addressNumber: unknown,
  municipality: unknown,
): { street: string | null; neighborhood: string | null } {
  if (typeof label !== 'string' || label.length === 0) {
    return { street: null, neighborhood: null };
  }

  const parts = label.split(', ');
  let street: string | null = parts[0] ?? null;

  if (street && typeof addressNumber === 'string' && addressNumber) {
    const suffix = ` ${addressNumber}`;
    if (street.endsWith(suffix)) {
      street = street.slice(0, -suffix.length).trim() || null;
    }
  }

  let neighborhood: string | null = null;
  if (parts.length >= 2) {
    const candidate = parts[1];
    const isPostalCode = /^\d{5}-?\d{3}$/.test(candidate);
    const isMunicipality =
      typeof municipality === 'string' && candidate === municipality;

    if (!isPostalCode && !isMunicipality) {
      neighborhood = candidate;
    }
  }

  return { street, neighborhood };
}

/**
 * Resolves a Brazilian state full name to its two-letter abbreviation (sigla).
 *
 * Returns `null` when the region is absent, not a string, or not found in
 * the known state map.
 *
 * @param region - State full name (e.g., `"São Paulo"`).
 * @returns Two-letter code (e.g., `"SP"`), or `null`.
 */
export function resolveStateCode(region: unknown): string | null {
  if (typeof region !== 'string' || region.length === 0) {
    return null;
  }

  return BRAZIL_STATE_SIGLAS.get(region) ?? null;
}

/**
 * Normalizes a country string to the canonical Portuguese name `"Brasil"`.
 *
 * Any of `"BRA"`, `"BR"`, `"Brasil"`, or `"Brazil"` are recognized as Brazil
 * and normalized. All other non-empty strings are returned unchanged. An empty
 * or absent value defaults to `"Brasil"`.
 *
 * @param country - Raw country value from the provider response.
 * @returns Normalized country name.
 */
export function normalizeCountry(country: unknown): string {
  if (typeof country !== 'string' || country.length === 0) {
    return 'Brasil';
  }

  return BRAZIL_CODES.has(country) ? 'Brasil' : country;
}

/**
 * Maps a raw AWS reverse geocode response to a {@link GeoAddress}.
 *
 * @param rawData - Raw response object from the AWS Location Service endpoint.
 * @returns A provider-agnostic {@link GeoAddress}.
 */
export function toGeoAddress(rawData: AwsReverseGeocodeResponse): GeoAddress {
  const address: AwsAddress = rawData.address ?? {};
  const { street, neighborhood: labelNeighborhood } = parseLabel(
    address.label,
    address.addressNumber,
    address.municipality,
  );

  return {
    street,
    streetNumber: address.addressNumber ?? null,
    complement: null,
    neighborhood:
      typeof address.neighborhood === 'string'
        ? address.neighborhood
        : labelNeighborhood,
    city:
      typeof address.municipality === 'string' ? address.municipality : null,
    metropolitanRegion: null,
    state: typeof address.region === 'string' ? address.region : null,
    stateCode: resolveStateCode(address.region),
    postalCode:
      typeof address.postalCode === 'string' ? address.postalCode : null,
    country: normalizeCountry(address.country),
  };
}
