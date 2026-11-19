# DESIGN

## Отмена запросов

При каждом изменении ввода вызываю `activeController.abort()` **сразу**, до debounce. Если отменять только в момент нового запроса, старый ответ успеет прилететь за 400 мс ожидания и перезапишет результаты.

Каждый запрос — свой `AbortController`. Отмена пользователем и таймаут объединяю через `AbortSignal.any([signal, AbortSignal.timeout(8000)])`, чтобы `searchCountries` принимал один сигнал. В `catch` различаю:

- `AbortError` — сам отменил (новый ввод/очистка), молчу;
- `TimeoutError` — таймаут, показываю ошибку с «Повторить»;
- `HttpError` и прочее — настоящая ошибка, тоже с «Повторить».

Флаг «актуальный ответ» не использую: он не отменяет fetch, запрос висит до конца. `AbortController` реально прерывает.

## Debounce — 400 мс

Меньше — запрос на каждую букву, нагрузка на API. Больше — ощущение лага. 400 мс сглаживает быстрый набор, но не тормозит.

## Big O

`mapCountryResponse` — O(n + m), где n — языки, m — валюты: один проход `map`/`filter`, остальные поля O(1).

## Чистый код

- `classifyError` (`errors.ts`) — чистая, без `console.log`, тестируется в одну строку.
- `mapCountryResponse` (`api.ts`) — без сети, принимает `unknown`, тестируется на фикстурах.
- `ui.ts` — единственный файл с DOM. `debounce`, `api`, `errors`, `searchController` тестируются в `node` без jsdom.
- `SearchState` (`types.ts`) — discriminated union по `kind`. `switch` сужает тип, 404 (`not-found`) и ошибка (`error`) не перепутаются.
- `replaceChildren()` + `createElement`, без `innerHTML`.
- 404 → `[]` из `searchCountries`, а не `HttpError`: «ничего не найдено» ≠ «сервер упал».

## `any`

Запрещён. `mapCountryResponse` принимает `unknown`, сужаю через `isRecord`/`asString`/`asNumber`. В тестах моки `Response` — через `as unknown as Response`, это не `any`.
