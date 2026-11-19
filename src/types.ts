export interface Country {
  code: string;
  name: string;
  nativeName?: string;
  capital: string;
  flag: string;
  region: string;
  subregion?: string;
  population: number;
  area: number;
  languages: string[];
  currencies: string[];
  borders: string[];
}

export type SearchState =
  | { kind: 'empty' }
  | { kind: 'loading' }
  | { kind: 'results'; countries: Country[] }
  | { kind: 'not-found' }
  | { kind: 'error'; retry: () => void };
