import type { Country } from './types.js';

export async function searchCountries(_query: string, _signal: AbortSignal): Promise<Country[]> {
  void _query;
  void _signal;
  return [];
}

export function mapCountryResponse(raw: unknown): Country {
  void raw;
  return {} as Country;
}
