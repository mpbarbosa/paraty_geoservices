/**
 * AWS reverse geocoding provider.
 *
 * Concrete infrastructure adapter that calls an AWS Location Service-compatible
 * reverse-geocoding endpoint and returns both the raw response and a
 * standardized Brazilian address shape.
 *
 * @module infrastructure/providers/AwsGeocoder
 * @since 1.2.2
 * @author Marcelo Pereira Barbosa
 */

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

export interface AwsAddress {
  label?: string;
  addressNumber?: string;
  street?: string;
  neighborhood?: string;
  municipality?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  interpolated?: boolean;
  [key: string]: unknown;
}

export interface AwsReverseGeocodeResponse {
  provider?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  address?: AwsAddress;
  geometry?: {
    Point?: [number, number];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface BrazilianStandardAddress {
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  municipio: string | null;
  regiaoMetropolitana: string | null;
  uf: string | null;
  siglaUF: string | null;
  cep: string | null;
  pais: string;
}

export interface AwsReverseGeocodeResult {
  rawData: AwsReverseGeocodeResponse;
  enderecoPadronizado: BrazilianStandardAddress;
}

/**
 * Reverse geocoder that calls an AWS Location Service-compatible API.
 *
 * When no `baseUrl` is provided, the constructor falls back to the
 * `AWS_LBS_BASE_URL` environment variable.
 *
 * @class AwsGeocoder
 * @since 1.2.2
 */
export class AwsGeocoder {
  readonly baseUrl: string;
  readonly endpoint: string;

  constructor(baseUrl?: string) {
    const resolvedBaseUrl =
      baseUrl ?? AwsGeocoder.resolveBaseUrlFromEnvironment();

    if (!resolvedBaseUrl) {
      throw new Error(
        'AwsGeocoder requires a baseUrl or AWS_LBS_BASE_URL environment variable',
      );
    }

    this.baseUrl = resolvedBaseUrl.replace(/\/+$/, '');
    this.endpoint = `${this.baseUrl}/api/geocode/reverse`;
  }

  /**
   * Performs reverse geocoding via the AWS Location Based Service.
   *
   * @param latitude - Coordinate latitude.
   * @param longitude - Coordinate longitude.
   * @returns Raw AWS response plus a standardized Brazilian address.
   * @throws On invalid coordinates, network failure, or non-OK HTTP status.
   */
  async reverseGeocode(
    latitude: number,
    longitude: number,
  ): Promise<AwsReverseGeocodeResult> {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error('(AwsGeocoder) Invalid coordinates');
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude }),
    });

    if (!response.ok) {
      throw new Error(
        `(AwsGeocoder) HTTP ${response.status}: ${response.statusText}`,
      );
    }

    const rawData = (await response.json()) as AwsReverseGeocodeResponse;

    return {
      rawData,
      enderecoPadronizado: AwsGeocoder.toBrazilianStandardAddress(rawData),
    };
  }

  private static resolveBaseUrlFromEnvironment(): string | undefined {
    const processLike = globalThis as typeof globalThis & {
      process?: {
        env?: Record<string, string | undefined>;
      };
    };

    return processLike.process?.env?.AWS_LBS_BASE_URL;
  }

  private static toBrazilianStandardAddress(
    rawData: AwsReverseGeocodeResponse,
  ): BrazilianStandardAddress {
    const address = rawData.address ?? {};
    const { logradouro, bairro: labelBairro } = AwsGeocoder.parseLabel(
      address.label,
      address.addressNumber,
      address.municipality,
    );

    return {
      logradouro,
      numero: address.addressNumber ?? null,
      complemento: null,
      bairro:
        typeof address.neighborhood === 'string'
          ? address.neighborhood
          : labelBairro,
      municipio:
        typeof address.municipality === 'string'
          ? address.municipality
          : null,
      regiaoMetropolitana: null,
      uf: typeof address.region === 'string' ? address.region : null,
      siglaUF: AwsGeocoder.resolveStateSigla(address.region),
      cep:
        typeof address.postalCode === 'string' ? address.postalCode : null,
      pais: AwsGeocoder.normalizeCountry(address.country),
    };
  }

  private static parseLabel(
    label: unknown,
    addressNumber: unknown,
    municipality: unknown,
  ): {
    logradouro: string | null;
    bairro: string | null;
  } {
    if (typeof label !== 'string' || label.length === 0) {
      return { logradouro: null, bairro: null };
    }

    const parts = label.split(', ');
    let logradouro: string | null = parts[0] ?? null;

    if (logradouro && typeof addressNumber === 'string' && addressNumber) {
      const suffix = ` ${addressNumber}`;
      if (logradouro.endsWith(suffix)) {
        logradouro = logradouro.slice(0, -suffix.length).trim() || null;
      }
    }

    let bairro: string | null = null;
    if (parts.length >= 2) {
      const candidate = parts[1];
      const isPostalCode = /^\d{5}-?\d{3}$/.test(candidate);
      const isMunicipality =
        typeof municipality === 'string' && candidate === municipality;

      if (!isPostalCode && !isMunicipality) {
        bairro = candidate;
      }
    }

    return { logradouro, bairro };
  }

  private static resolveStateSigla(region: unknown): string | null {
    if (typeof region !== 'string' || region.length === 0) {
      return null;
    }

    return BRAZIL_STATE_SIGLAS.get(region) ?? null;
  }

  private static normalizeCountry(country: unknown): string {
    if (typeof country !== 'string' || country.length === 0) {
      return 'Brasil';
    }

    return BRAZIL_CODES.has(country) ? 'Brasil' : country;
  }
}
