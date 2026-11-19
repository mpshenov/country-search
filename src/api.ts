import { HttpError } from './errors.js';
import type { Country } from './types.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function firstNativeName(value: unknown): string {
  if (!isRecord(value)) return '';
  const first = Object.values(value)[0];
  return isRecord(first) ? asString(first.common) : '';
}

function languagesFrom(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((l) => (isRecord(l) ? asString(l.name) : asString(l)))
    .filter((l): l is string => l.length > 0);
}

function currenciesFrom(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((c) => (isRecord(c) ? asString(c.name) : ''))
    .filter((c): c is string => c.length > 0);
}

export function mapCountryResponse(raw: unknown): Country {
  if (!isRecord(raw)) {
    return {
      code: '',
      name: 'Неизвестная страна',
      nativeName: '',
      capital: 'Нет столицы',
      flag: '',
      region: 'Не указан',
      subregion: 'Не указан',
      population: 0,
      area: 0,
      languages: [],
      currencies: [],
      borders: [],
    };
  }

  const nameField = raw.name;
  const name =
    typeof nameField === 'string'
      ? nameField
      : isRecord(nameField)
        ? asString(nameField.common)
        : '';

  const capitalField = raw.capital;
  const capital = Array.isArray(capitalField)
    ? capitalField.filter((c): c is string => typeof c === 'string').join(', ')
    : asString(capitalField) || 'Нет столицы';

  const flags = isRecord(raw.flags) ? raw.flags : {};

  return {
    code: asString(raw.cca3) || asString(raw.cca2),
    name: name || 'Неизвестная страна',
    nativeName: isRecord(nameField) ? firstNativeName(nameField.nativeName) : '',
    capital,
    flag: asString(flags.svg) || asString(flags.png),
    region: asString(raw.region) || 'Не указан',
    subregion: asString(raw.subregion) || 'Не указан',
    population: asNumber(raw.population),
    area: asNumber(raw.area),
    languages: languagesFrom(raw.languages),
    currencies: currenciesFrom(raw.currencies),
    borders: asStringArray(raw.borders),
  };
}

export async function searchCountries(query: string, signal: AbortSignal): Promise<Country[]> {
  const response = await fetch(`https://countries.dev/name/${encodeURIComponent(query)}`, {
    signal,
  });

  if (response.status === 404) return [];
  if (!response.ok) throw new HttpError(response.status, 'Http error');

  const data: unknown = await response.json();
  const items = Array.isArray(data) ? data : [data];
  return items.map(mapCountryResponse);
}
