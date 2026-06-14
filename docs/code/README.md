# Каркас кода и архитектура (стартовый набросок)

Подробную продуктовую спеки см. в [docs/spec/](../spec/).

## Структура `src/`

| Каталог     | Роль                                                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `blocks/`   | Компоненты по **БЭМ** и в **React-договорённости имён**: папка **PascalCase** = файл **Block.tsx** и CSS **Block.css**. |
| `services/` | Клиентские обращения к API, адаптеры данных без разметки.                                                               |

## Структура `tests/`

| Каталог                 | Роль                                                                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `e2e/`                  | Gherkin-файлы `*.feature` (сценарии), по фичам в подпапках.                                                                                           |
| `_harness/config/`      | [cucumber.yml](../../tests/_harness/config/cucumber.yml), [env.ts](../../tests/_harness/config/env.ts) — конфиг раннера и базовый URL/режим браузера. |
| `_harness/` (корень)    | [world.ts](../../tests/_harness/world.ts), [hooks.ts](../../tests/_harness/hooks.ts) — `CustomWorld`, запуск и закрытие Chromium.                     |
| `_harness/classes/`     | Базовые [Block](../../tests/_harness/classes/Block.ts) и [Page](../../tests/_harness/classes/Page.ts) (объекты страниц и блоков UI на Playwright).    |
| `_harness/pages/`       | Page object на экран/маршрут; в каждой подпапке `*.page.ts` и при необходимости `*.steps.ts`.                                                         |
| `_harness/blocks/`      | Объекты виджетов (как на фронте); `*.block.ts` + при необходимости `*.steps.ts`.                                                                      |
| `_harness/commonSteps/` | Общие step definitions, не привязанные к конкретной странице или блоку (`*.steps.ts`).                                                                |
| `_harness/commands/`    | Зарезервировано под вспомогательные команды (данные, API и т.п.).                                                                                     |

Подключение шагов в Cucumber: сначала явно `world.ts` и `hooks.ts`, далее glob’ы `commonSteps/**/*.steps.ts`, `pages/**/*.steps.ts`, `blocks/**/*.steps.ts` (см. конфиг).

## TypeScript

- Общая строгость задаётся [tsconfig.base.json](../../tsconfig.base.json): от него наследуются [tsconfig.json](../../tsconfig.json) (клиент + корневой `vite.config.ts`) и сборка прод-сервера [`tsconfig.server.json`](../../tsconfig.server.json). Для IDE при работе только в `src/server/` используется [src/server/tsconfig.json](../../src/server/tsconfig.json).

- Корневой `tsconfig` задаёт режим **`strict`** и проверку SPA (фронт без серверных файлов в `include`; папка `src/server/` в `exclude`).
- Выход прод-сервера: **`dist/server/index.js`** (`npm run build` → `vite build && tsc -p tsconfig.server.json`).

- Тесты: отдельно [tests/tsconfig.json](../../tests/tsconfig.json) и команды **`typecheck:e2e`** / общий **`typecheck`** (см. подраздел E2E ниже).

## БЭМ и `@bem-react/classname`

- Имя **блока** в коде совпадает с именем компонента (`LoginForm`, `Profile` и т.д.).
- Строки `className` собираются только через **`cn`** из **`@bem-react/classname`**; селекторы в `.css` соответствуют тому же неймингу (`LoginForm`, `LoginForm-Main`, … для React-схемы пакета).

## Запуск и порты

- **`npm run dev`** — один процесс Express + Vite (HMR фронта, перезапуск процесса при правках через `tsx watch`). Порт по умолчанию **5173**, переопределение переменной **`PORT`**.
- **`npm run build`** — статика клиента в `dist/client`, прод-сборка сервера в `dist/server` (из `src/server/` без файла разработческого входа dev).
- **`npm start`** — прод: API + статика с `dist/client`; порт по умолчанию **3000** (или **`PORT`**).

### E2E

- **`npm run test:e2e`** — [Cucumber-js](https://github.com/cucumber/cucumber-js) + [Playwright](https://playwright.dev/) (Chromium). Сценарии: `tests/e2e/**/*.feature`. TypeScript для support-кода и шагов подгружается через **`NODE_OPTIONS='--import tsx/esm'`** (см. скрипт в [`package.json`](../../package.json)).
- Перед первым запуском на машине: **`npm run playwright:install`** — скачивание Chromium для Playwright.
- Приложение должно быть **доступно по HTTP** (обычно отдельный терминал **`npm run dev`** на `http://127.0.0.1:5173`). Адрес задаётся переменной **`E2E_BASE_URL`** (по умолчанию `http://127.0.0.1:5173`). Для отладки с окном браузера: **`E2E_HEADLESS=false`**.
- Проверка типов harness и шагов: **`npm run typecheck:e2e`**; полная проверка проекта, включая клиент и сервер: **`npm run typecheck`**.

Язык сценариев в фичах: русский (`# language: ru` в `*.feature`). Утверждения на стороне Playwright — **`expect`** из **`@playwright/test`** (web-first).

**Пример.** Сценарий [auth.feature](../../tests/e2e/auth/auth.feature): главная страница ([Main.page.ts](../../tests/_harness/pages/Main/Main.page.ts), шаги [Main.steps.ts](../../tests/_harness/pages/Main/Main.steps.ts)), блоки формы входа и профиля ([LoginForm.block.ts](../../tests/_harness/blocks/LoginForm/LoginForm.block.ts), [Profile.block.ts](../../tests/_harness/blocks/Profile/Profile.block.ts) и соответствующие `*.steps.ts`).

Зависимости в **`package.json`** задаются **точными** версиями без `^`/`~`; в репозитории хранится **`package-lock.json`**.

## Общая спека продукта

См. [05-tech-and-data](../spec/05-tech-and-data.md): React + TypeScript, далее MobX; Node + монолит + SQLite во время развития продукта. **MobX** в этом каркасе пока не подключён — после появления состояния вынести провайдер/корень стора отдельным шагом.
