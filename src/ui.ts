import type { SearchState, Country } from './types.js';
import { createSearch } from './searchController.js';

function userInput(onSearch: (query: string) => void): HTMLInputElement {
  const inputElement = document.createElement('input');
  inputElement.type = 'search';
  inputElement.placeholder = 'Type the country';
  inputElement.id = 'search';
  document.body.append(inputElement);

  inputElement.addEventListener('input', (event) => {
    onSearch((event.target as HTMLInputElement).value);
  });

  return inputElement;
}

function createContainer(): HTMLDivElement {
  const container = document.createElement('div');
  container.id = 'results';
  document.body.append(container);
  return container;
}

function renderCountryCard(country: Country): HTMLElement {
  const card = document.createElement('article');
  card.className = 'country-card';

  const flag = document.createElement('img');
  flag.src = country.flag;
  flag.alt = `Flag of ${country.name}`;
  flag.width = 48;

  const title = document.createElement('h3');
  title.textContent = country.name;

  const capital = document.createElement('p');
  capital.textContent = `Capital: ${country.capital}`;

  const region = document.createElement('p');
  region.textContent = `Region: ${country.region}`;

  const population = document.createElement('p');
  population.textContent = `Population: ${country.population.toLocaleString()}`;

  card.append(flag, title, capital, region, population);

  return card;
}

function render(container: HTMLElement, state: SearchState): void {
  container.replaceChildren();

  switch (state.kind) {
    case 'empty':
      return;

    case 'loading': {
      const spinner = document.createElement('p');
      spinner.textContent = 'Loading…';
      container.append(spinner);
      return;
    }

    case 'not-found': {
      const message = document.createElement('p');
      message.textContent = 'Nothing found';
      container.append(message);
      return;
    }

    case 'error': {
      const message = document.createElement('p');
      message.textContent = 'Something went wrong';

      const retry = document.createElement('button');
      retry.type = 'button';
      retry.textContent = 'Retry';
      retry.addEventListener('click', () => state.retry());

      container.append(message, retry);
      return;
    }

    case 'results': {
      const list = document.createElement('div');
      list.className = 'country-list';
      for (const country of state.countries) {
        list.append(renderCountryCard(country));
      }
      container.append(list);
      return;
    }
  }
}

const container = createContainer();
const search = createSearch((state) => render(container, state));
userInput(search);
