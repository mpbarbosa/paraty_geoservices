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
    constructor(baseUrl) {
        const resolvedBaseUrl = baseUrl ?? AwsGeocoder.resolveBaseUrlFromEnvironment();
        if (!resolvedBaseUrl) {
            throw new Error('AwsGeocoder requires a baseUrl or AWS_LBS_BASE_URL environment variable');
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
    async reverseGeocode(latitude, longitude) {
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            throw new Error('(AwsGeocoder) Invalid coordinates');
        }
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude }),
        });
        if (!response.ok) {
            throw new Error(`(AwsGeocoder) HTTP ${response.status}: ${response.statusText}`);
        }
        const rawData = (await response.json());
        return {
            rawData,
            enderecoPadronizado: AwsGeocoder.toBrazilianStandardAddress(rawData),
        };
    }
    static resolveBaseUrlFromEnvironment() {
        const processLike = globalThis;
        return processLike.process?.env?.AWS_LBS_BASE_URL;
    }
    static toBrazilianStandardAddress(rawData) {
        const address = rawData.address ?? {};
        const { logradouro, bairro: labelBairro } = AwsGeocoder.parseLabel(address.label, address.addressNumber, address.municipality);
        return {
            logradouro,
            numero: address.addressNumber ?? null,
            complemento: null,
            bairro: typeof address.neighborhood === 'string'
                ? address.neighborhood
                : labelBairro,
            municipio: typeof address.municipality === 'string'
                ? address.municipality
                : null,
            regiaoMetropolitana: null,
            uf: typeof address.region === 'string' ? address.region : null,
            siglaUF: AwsGeocoder.resolveStateSigla(address.region),
            cep: typeof address.postalCode === 'string' ? address.postalCode : null,
            pais: AwsGeocoder.normalizeCountry(address.country),
        };
    }
    static parseLabel(label, addressNumber, municipality) {
        if (typeof label !== 'string' || label.length === 0) {
            return { logradouro: null, bairro: null };
        }
        const parts = label.split(', ');
        let logradouro = parts[0] ?? null;
        if (logradouro && typeof addressNumber === 'string' && addressNumber) {
            const suffix = ` ${addressNumber}`;
            if (logradouro.endsWith(suffix)) {
                logradouro = logradouro.slice(0, -suffix.length).trim() || null;
            }
        }
        let bairro = null;
        if (parts.length >= 2) {
            const candidate = parts[1];
            const isPostalCode = /^\d{5}-?\d{3}$/.test(candidate);
            const isMunicipality = typeof municipality === 'string' && candidate === municipality;
            if (!isPostalCode && !isMunicipality) {
                bairro = candidate;
            }
        }
        return { logradouro, bairro };
    }
    static resolveStateSigla(region) {
        if (typeof region !== 'string' || region.length === 0) {
            return null;
        }
        return BRAZIL_STATE_SIGLAS.get(region) ?? null;
    }
    static normalizeCountry(country) {
        if (typeof country !== 'string' || country.length === 0) {
            return 'Brasil';
        }
        return BRAZIL_CODES.has(country) ? 'Brasil' : country;
    }
}
