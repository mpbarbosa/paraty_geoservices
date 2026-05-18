/**
 * @jest-environment node
 */

import { describe, test, expect } from '@jest/globals';
import {
	buildNominatimReverseUrl,
	toGeoAddressFromNominatim,
} from '../../../src/infrastructure/providers/NominatimAddressMapper';

describe('NominatimAddressMapper', () => {
	test('buildNominatimReverseUrl includes coordinates', () => {
		const url = buildNominatimReverseUrl(
			-23.55,
			-46.63,
			'https://nominatim.openstreetmap.org/reverse?format=json',
		);
		expect(url).toContain('lat=-23.55');
		expect(url).toContain('lon=-46.63');
	});

	test('buildNominatimReverseUrl wraps CORS proxy when provided', () => {
		const url = buildNominatimReverseUrl(
			1,
			2,
			'https://example.com/reverse?format=json',
			'https://proxy.example/?url=',
		);
		expect(url).toContain('https%3A%2F%2Fexample.com');
	});

	test('toGeoAddressFromNominatim maps OSM fields to GeoAddress', () => {
		const address = toGeoAddressFromNominatim({
			address: {
				road: 'Avenida Paulista',
				house_number: '1000',
				suburb: 'Bela Vista',
				city: 'São Paulo',
				state: 'São Paulo',
				postcode: '01310-100',
				country: 'Brazil',
				country_code: 'br',
			},
		});

		expect(address.street).toBe('Avenida Paulista');
		expect(address.streetNumber).toBe('1000');
		expect(address.neighborhood).toBe('Bela Vista');
		expect(address.city).toBe('São Paulo');
		expect(address.country).toBe('Brasil');
	});

	test('toGeoAddressFromNominatim falls back to town and neighbourhood fields', () => {
		const address = toGeoAddressFromNominatim({
			address: {
				neighbourhood: 'Centro',
				town: 'Rosario',
				region: 'Santa Fe',
				country: 'Argentina',
				country_code: 'ar',
			},
		});

		expect(address.neighborhood).toBe('Centro');
		expect(address.city).toBe('Rosario');
		expect(address.metropolitanRegion).toBe('Santa Fe');
		expect(address.country).toBe('Argentina');
	});

	test('toGeoAddressFromNominatim falls back to village when town and city are absent', () => {
		const address = toGeoAddressFromNominatim({
			address: {
				village: 'Trindade',
				country: 'Brazil',
				country_code: 'br',
			},
		});

		expect(address.city).toBe('Trindade');
		expect(address.country).toBe('Brasil');
	});

	test('toGeoAddressFromNominatim falls back to municipality and default country', () => {
		const address = toGeoAddressFromNominatim({
			address: {
				municipality: 'Paraty',
			},
		});

		expect(address.city).toBe('Paraty');
		expect(address.country).toBe('Brasil');
	});
});
