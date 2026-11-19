import { debounce } from './debounce.js';
import { searchCountries } from './api.js';
import { classifyError } from './errors.js';
import type { SearchState } from './types.js';

const TIMEOUT_MS = 8000;
const DEBOUNCE_MS = 400;

export function createSearch(onState: (state: SearchState) => void) {
  let activeController: AbortController | null = null;

  const run = debounce(async (query: string) => {
    const controller = new AbortController();
    activeController = controller;

    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(TIMEOUT_MS)]);

    onState({ kind: 'loading' });

    try {
      const countries = await searchCountries(query, signal);
      onState(countries.length === 0 ? { kind: 'not-found' } : { kind: 'results', countries });
    } catch (e) {
      const kind = classifyError(e);
      if (kind === 'aborted') return; // молча
      onState({ kind: 'error', retry: () => run(query) });
    }
  }, DEBOUNCE_MS);

  return (query: string) => {
    if (!query.trim()) {
      activeController?.abort();
      onState({ kind: 'empty' });
      return;
    }
    activeController?.abort();
    run(query);
  };
}
