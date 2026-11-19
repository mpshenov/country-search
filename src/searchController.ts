import type { SearchState } from './types.js';

export function createSearch(onState: (state: SearchState) => void) {
  return (query: string): void => {
    if (query.length >= 0) {
      onState({ kind: 'empty' });
    }
  };
}
