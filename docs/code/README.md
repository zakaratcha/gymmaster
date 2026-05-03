# Каркас кода и архитектура (стартовый набросок)

Подробную продуктовую спеки см. в [docs/spec/](../spec/).

## Структура `src/`

| Каталог      | Роль                                                                |
|-------------|----------------------------------------------------------------------|
| `blocks/`    | Компоненты по **БЭМ** и в **React-договорённости имён**: папка **PascalCase** = файл **Block.tsx** и CSS **Block.css**. |
| `services/` | Клиентские обращения к API, адаптеры данных без разметки.              |
## TypeScript

- Общая строгость задаётся [tsconfig.base.json](../../tsconfig.base.json): от него наследуются [tsconfig.json](../../tsconfig.json) (клиент + корневой `vite.config.ts`) и сборка прод-сервера [`tsconfig.server.json`](../../tsconfig.server.json). Для IDE при работе только в `src/server/` используется [src/server/tsconfig.json](../../src/server/tsconfig.json).

- Корневой `tsconfig` задаёт режим **`strict`** и проверку SPA (фронт без серверных файлов в `include`; папка `src/server/` в `exclude`).
- Выход прод-сервера: **`dist/server/index.js`** (`npm run build` → `vite build && tsc -p tsconfig.server.json`).
## БЭМ и `@bem-react/classname`

- Имя **блока** в коде совпадает с именем компонента (`HelloWorld` и т.д.).
- Строки `className` собираются только через **`cn`** из **`@bem-react/classname`**; селекторы в `.css` соответствуют тому же неймингу (`HelloWorld`, `HelloWorld-Title`, … для React-схемы пакета).

## Запуск и порты

- **`npm run dev`** — один процесс Express + Vite (HMR фронта, перезапуск процесса при правках через `tsx watch`). Порт по умолчанию **5173**, переопределение переменной **`PORT`**.
- **`npm run build`** — статика клиента в `dist/client`, прод-сборка сервера в `dist/server` (из `src/server/` без файла разработческого входа dev).
- **`npm start`** — прод: API + статика с `dist/client`; порт по умолчанию **3000** (или **`PORT`**).

Зависимости в **`package.json`** задаются **точными** версиями без `^`/`~`; в репозитории хранится **`package-lock.json`**.

## Общая спека продукта

См. [05-tech-and-data](../spec/05-tech-and-data.md): React + TypeScript, далее MobX; Node + монолит + SQLite во время развития продукта. **MobX** в этом каркасе пока не подключён — после появления состояния вынести провайдер/корень стора отдельным шагом.
