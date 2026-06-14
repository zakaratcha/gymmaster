---
name: e2e-mcp
description: >-
  Отладка e2e gymmaster через Playwright MCP: пройти в браузере шаги .feature,
  harness, артефакты. Запуск Cucumber — npm run test:e2e. Подключать только по
  явному запросу пользователя (например e2e-mcp, @e2e-mcp, «по навыку e2e-mcp»).
---

# Отладка e2e через браузер (gymmaster)

Этот навык про **интерактив в браузере** (Playwright MCP): агент повторяет действия из сценария и видит DOM/скрины. **Запуск тестов** (`npm run test:e2e`, точечный сценарий) — в терминале, см. раздел «Запуск Cucumber» ниже.

## Стек и расположение

- **Раннер:** Cucumber-js + Playwright (Chromium), спеки: `tests/e2e/**/*.feature`.
- **Harness:** шаги, страницы, блоки — `tests/_harness/` (в т.ч. `commonSteps`, `blocks`, `pages`, `commands`).
- **Конфиг:** `tests/_harness/config/cucumber.yml`, `tests/_harness/config/env.ts`.
- **Документация:** `docs/code/README.md` (раздел E2E).

## Предусловия

- Приложение доступно по HTTP: обычно **`npm run dev`** в отдельном терминале (`http://127.0.0.1:5173`).
- Адрес задаётся **`E2E_BASE_URL`** (по умолчанию `http://127.0.0.1:5173`).
- Перед первым запуском e2e на машине: **`npm run playwright:install`**.

## Запуск Cucumber

```bash
npm run test:e2e
```

**Один файл или сценарий** — путь к `.feature` и при необходимости теги/имя сценария через опции Cucumber (см. `cucumber-js --help`). Пример только одного файла:

```bash
npm run test:e2e -- tests/e2e/helloWorld/helloWorld.feature
```

Для отладки с окном браузера в прогоне: **`E2E_HEADLESS=false npm run test:e2e`**.

## Порядок отладки

1. **Playwright MCP** (если сервер подключён в чате): открыть падающий `.feature` → `http://127.0.0.1:5173` (или `E2E_BASE_URL`) → пройти в UI шаги (роль из Given, затем When/And) до места ошибки → `browser_snapshot` или скрин → при необходимости правки `steps`/blocks.
2. Воспроизвести прогон Cucumber (`npm run test:e2e`); зафиксировать **последний зелёный шаг** перед падением.
3. По тексту шага искать реализацию в `tests/_harness/**/*.steps.ts` и блоки в `tests/_harness/blocks/`, страницы в `tests/_harness/pages/`.

**Идентификатор сервера MCP:** в `gymmaster/.cursor/mcp.json` ключ `playwright`, но в вызове инструментов может требоваться **другой** `serverIdentifier` — смотри `SERVER_METADATA.json` в `~/.cursor/projects/<workspace>/mcps/…` (пример: `project-0-gymmaster-playwright`).

## Не смешивать

- **Playwright MCP** в Cursor — для интерактива агента в браузере.
- **E2e-прогон** — только через **Cucumber-js + Playwright harness** (`npm run test:e2e`), не через отдельный `npx playwright test` suite (его в проекте нет).
