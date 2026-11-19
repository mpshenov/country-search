import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSearch } from '../src/searchController';

type Resolver = (value: Response) => void;

describe('race condition', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('отменяет устаревший запрос и рендерит только последний', async () => {
    const resolvers: Record<string, Resolver> = {};

    vi.mocked(fetch).mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const query = decodeURIComponent(String(input).split('/name/')[1]);
      const signal = init?.signal;

      return new Promise<Response>((resolve, reject) => {
        resolvers[query] = resolve;

        signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });

    const states: Array<{ kind: string; countries?: Array<{ name: string }> }> = [];
    const search = createSearch((s) => states.push(s));

    search('sp');
    vi.advanceTimersByTime(400);

    search('spain');
    vi.advanceTimersByTime(400);

    resolvers['spain']({
      ok: true,
      status: 200,
      json: async () => [{ name: { common: 'Spain' } }],
    } as unknown as Response);

    resolvers['sp']({
      ok: true,
      status: 200,
      json: async () => [{ name: { common: 'Old' } }],
    } as unknown as Response);

    await vi.runAllTimersAsync();

    const last = states[states.length - 1];
    expect(last.kind).toBe('results');
    expect(last.countries?.[0].name).toBe('Spain');
  });
});
