import {
  parseLabel,
  resolveStateCode,
  normalizeCountry,
  toGeoAddress,
} from '../../../src/infrastructure/providers/AwsAddressMapper';
import type { AwsReverseGeocodeResponse } from '../../../src/infrastructure/providers/AwsGeocoder';

describe('AwsAddressMapper', () => {
  describe('parseLabel', () => {
    it('should return nulls for a non-string label', () => {
      expect(parseLabel(null, null, null)).toEqual({
        street: null,
        neighborhood: null,
      });
      expect(parseLabel(undefined, undefined, undefined)).toEqual({
        street: null,
        neighborhood: null,
      });
      expect(parseLabel(42, null, null)).toEqual({
        street: null,
        neighborhood: null,
      });
    });

    it('should return nulls for an empty string label', () => {
      expect(parseLabel('', null, null)).toEqual({
        street: null,
        neighborhood: null,
      });
    });

    it('should extract the street from the first label segment', () => {
      const result = parseLabel('Rua das Flores, Jardins, São Paulo', null, null);
      expect(result.street).toBe('Rua das Flores');
    });

    it('should strip the address number suffix from the street', () => {
      const result = parseLabel('Avenida Paulista 1234, Bela Vista, São Paulo', '1234', null);
      expect(result.street).toBe('Avenida Paulista');
    });

    it('should not strip the number if the street does not end with it', () => {
      const result = parseLabel('Rua das Flores, Jardins, São Paulo', '999', null);
      expect(result.street).toBe('Rua das Flores');
    });

    it('should extract the neighborhood from the second label segment', () => {
      const result = parseLabel('Rua A, Jardins, São Paulo', null, 'São Paulo');
      expect(result.neighborhood).toBe('Jardins');
    });

    it('should return null neighborhood when second segment is a postal code', () => {
      const result = parseLabel('Rua A, 01310-100, São Paulo', null, 'São Paulo');
      expect(result.neighborhood).toBeNull();
    });

    it('should return null neighborhood when second segment matches municipality', () => {
      const result = parseLabel('Marco Zero, Recife, 50030-230, BRA', null, 'Recife');
      expect(result.neighborhood).toBeNull();
    });

    it('should return null neighborhood when label has only one segment', () => {
      const result = parseLabel('Rua Isolada', null, null);
      expect(result.neighborhood).toBeNull();
    });
  });

  describe('resolveStateCode', () => {
    it('should return null for a non-string region', () => {
      expect(resolveStateCode(null)).toBeNull();
      expect(resolveStateCode(undefined)).toBeNull();
      expect(resolveStateCode(42)).toBeNull();
    });

    it('should return null for an empty string region', () => {
      expect(resolveStateCode('')).toBeNull();
    });

    it('should return null for an unknown region', () => {
      expect(resolveStateCode('Unknown State')).toBeNull();
    });

    it('should resolve known Brazilian state full names', () => {
      expect(resolveStateCode('São Paulo')).toBe('SP');
      expect(resolveStateCode('Pernambuco')).toBe('PE');
      expect(resolveStateCode('Rio de Janeiro')).toBe('RJ');
      expect(resolveStateCode('Mato Grosso do Sul')).toBe('MS');
      expect(resolveStateCode('Distrito Federal')).toBe('DF');
    });
  });

  describe('normalizeCountry', () => {
    it('should return "Brasil" for an empty or absent country', () => {
      expect(normalizeCountry('')).toBe('Brasil');
      expect(normalizeCountry(null)).toBe('Brasil');
      expect(normalizeCountry(undefined)).toBe('Brasil');
    });

    it('should normalize known Brazil code variants to "Brasil"', () => {
      expect(normalizeCountry('BRA')).toBe('Brasil');
      expect(normalizeCountry('BR')).toBe('Brasil');
      expect(normalizeCountry('Brasil')).toBe('Brasil');
      expect(normalizeCountry('Brazil')).toBe('Brasil');
    });

    it('should pass through unknown country names unchanged', () => {
      expect(normalizeCountry('Argentina')).toBe('Argentina');
      expect(normalizeCountry('USA')).toBe('USA');
    });
  });

  describe('toGeoAddress', () => {
    it('should map a full AWS response to a GeoAddress', () => {
      const rawData: AwsReverseGeocodeResponse = {
        address: {
          label: 'Movelstore, Sé, São Paulo, 01016-000, BRA',
          neighborhood: 'Sé',
          municipality: 'São Paulo',
          region: 'São Paulo',
          country: 'BRA',
          postalCode: '01016-000',
        },
      };

      expect(toGeoAddress(rawData)).toEqual({
        street: 'Movelstore',
        streetNumber: null,
        complement: null,
        neighborhood: 'Sé',
        city: 'São Paulo',
        metropolitanRegion: null,
        state: 'São Paulo',
        stateCode: 'SP',
        postalCode: '01016-000',
        country: 'Brasil',
      });
    });

    it('should return nulls and default country when address is absent', () => {
      const rawData: AwsReverseGeocodeResponse = {};

      expect(toGeoAddress(rawData)).toEqual({
        street: null,
        streetNumber: null,
        complement: null,
        neighborhood: null,
        city: null,
        metropolitanRegion: null,
        state: null,
        stateCode: null,
        postalCode: null,
        country: 'Brasil',
      });
    });

    it('should prefer address.neighborhood over label-derived neighborhood', () => {
      const rawData: AwsReverseGeocodeResponse = {
        address: {
          label: 'Rua A, LabelBairro, São Paulo',
          neighborhood: 'NeighborhoodFromField',
          municipality: 'São Paulo',
        },
      };

      expect(toGeoAddress(rawData).neighborhood).toBe('NeighborhoodFromField');
    });

    it('should fall back to label-derived neighborhood when field is absent', () => {
      const rawData: AwsReverseGeocodeResponse = {
        address: {
          label: 'Rua A, Pinheiros, São Paulo',
          municipality: 'São Paulo',
        },
      };

      expect(toGeoAddress(rawData).neighborhood).toBe('Pinheiros');
    });
  });
});
