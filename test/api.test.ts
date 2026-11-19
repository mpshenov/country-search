import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchCountries, mapCountryResponse } from '../src/api';
import { HttpError } from '../src/errors';

describe('searchCountries', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => vi.unstubAllGlobals());

  it('возвращает массив стран при ok', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ cca3: 'FRA', name: { common: 'France' }, population: 67_000_000 }],
    } as unknown as Response);

    const result = await searchCountries('france', new AbortController().signal);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('France');
  });

  it('возвращает [] на 404', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as unknown as Response);
    const result = await searchCountries('zzz', new AbortController().signal);
    expect(result).toEqual([]);
  });

  it('бросает HttpError на 500', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as unknown as Response);
    await expect(searchCountries('x', new AbortController().signal)).rejects.toBeInstanceOf(
      HttpError,
    );
  });
});

describe('mapCountryResponse', () => {
  it('чистая функция: преобразует фикстуру без сети', () => {
    const raw = {
      cca3: 'DEU',
      name: { common: 'Germany' },
      capital: ['Berlin'],
      population: 83_000_000,
    };
    const c = mapCountryResponse(raw);
    expect(c.code).toBe('DEU');
    expect(c.capital).toBe('Berlin');
  });
});
