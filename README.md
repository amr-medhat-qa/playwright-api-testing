# API Test Automation — Playwright + TypeScript + Zod

[![API Tests](https://github.com/amr-medhat-qa/playwright-api-testing/actions/workflows/api-tests.yml/badge.svg)](https://github.com/amr-medhat-qa/playwright-api-testing/actions/workflows/api-tests.yml)
[![Test Report](https://img.shields.io/badge/report-live-2ea44f?logo=playwright)](https://amr-medhat-qa.github.io/playwright-api-testing/)
[![Allure Report](https://img.shields.io/badge/Allure-report-ff6a00)](https://amr-medhat-qa.github.io/playwright-api-testing/allure/)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Zod](https://img.shields.io/badge/schema-Zod-3E67B1?logo=zod&logoColor=white)

REST API test suite for **[DummyJSON](https://dummyjson.com)** (auth, products, carts, users) built with Playwright's API testing, **TypeScript** and **Zod** for **contract (schema) validation**.

📊 **Live reports:** [Playwright HTML report](https://amr-medhat-qa.github.io/playwright-api-testing/) · [Allure report](https://amr-medhat-qa.github.io/playwright-api-testing/allure/)

## What's covered

| Area              | Scenarios                                                                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**          | JWT login, token payload & expiry checks, `/auth/me` with bearer token, refresh-token flow, invalid credentials, missing / malformed / tampered tokens                        |
| **Products**      | Contract of single item & list, pagination (`limit`/`skip`), field selection, sorting asc/desc, data-driven search, categories, 404s, simulated create / PUT / PATCH / DELETE |
| **Carts**         | Contract, **business rules** (line total = price × qty, grand total, total quantity, discount ≤ total), carts by user, add & merge-update                                     |
| **Users**         | Contract, search, data-driven filters on nested fields (`hair.color`, `gender`, `role`), 404                                                                                  |
| **Response time** | Lightweight guard on key endpoints (threshold configurable)                                                                                                                   |

## Why schema validation?

Status-code checks alone miss **contract drift** — a renamed field, a number that becomes a string, a missing nested object.
Every response here is validated against a **Zod schema** (`src/schemas`). A violation fails the test with a field-by-field explanation:

```
Response does not match schema:
✖ Invalid input: expected number, received string
  → at products[3].price
```

Schemas also give **typed responses** for free (`z.infer`), so tests get autocomplete and compile-time safety.

## Found a bug 🐞

`GET /auth/me` with a **well-formed JWT whose signature is invalid** returns **`500 "invalid signature"`** instead of `401` (a malformed token correctly returns `401`).
The test is kept and marked with `test.fail()` + a `bug` annotation: the suite stays green while the bug exists and **turns red when it's fixed**, prompting removal of the marker.

## Design

```
src/
├── clients/      # BaseClient (auth header, params, JSON) + one client per resource
├── schemas/      # Zod contracts + shared paginated() / error schemas
├── fixtures/     # clients injected per test, access token created once per worker
├── data/         # test data & generators
└── utils/        # expectSchema() — readable contract assertions
tests/            # auth, products, carts, users, performance
```

- **Client layer** keeps HTTP details out of tests; tests read like specifications
- **Worker-scoped auth fixture** logs in once per worker instead of once per test
- **Data-driven tests** for search terms, filters, invalid logins and 404 ids
- **Tags**: `@smoke` (fast critical path) and `@contract` (schema checks)
- **Quality gate in CI**: type check → ESLint (`eslint-plugin-playwright`) → Prettier → tests
- **Scheduled daily run** to catch API changes even without code changes

## Run locally

```bash
npm ci
npm test                 # all tests
npm run test:smoke       # @smoke only
npm run test:contract    # @contract only
npm run allure:serve     # Allure report (needs Java)
npm run check            # typecheck + lint + format
```

| Variable                        | Default                                  |
| ------------------------------- | ---------------------------------------- |
| `BASE_URL`                      | `https://dummyjson.com`                  |
| `API_USERNAME` / `API_PASSWORD` | public demo user from the DummyJSON docs |
| `MAX_RESPONSE_MS`               | `3000`                                   |

> DummyJSON **simulates** writes: create/update/delete responses reflect the change, but nothing is persisted. Write tests therefore assert on the write response itself.

## Author

**Amr Medhat** — Senior QA Engineer · [GitHub](https://github.com/amr-medhat-qa) · [LinkedIn](https://www.linkedin.com/in/amr-medhat-wafeek)
