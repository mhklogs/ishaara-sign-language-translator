# ishaara-sign-language-translator — Architecture Summary

> Generated from static analysis on 2026-09-28.

## Components

| Layer | Present | Evidence |
| --- | --- | --- |
| Presentation / UI | yes | 0 route module(s), 12 component file(s) |
| API / server | no | 0 handler(s), entrypoints: none |
| Domain / business logic | unclear | no dedicated layer detected |
| Persistence | no | no database client |
| Authentication | no | none detected |

## Detected frameworks and libraries

| Package | Purpose (inferred) |
| --- | --- |
| `@react-three/drei` | dependency |
| `@react-three/fiber` | React Three Fiber |
| `@tailwindcss/vite` | dependency |
| `@types/node` | dependency |
| `@types/react` | dependency |
| `@types/react-dom` | dependency |
| `@types/three` | dependency |
| `@vitejs/plugin-react` | dependency |
| `clsx` | dependency |
| `react` | React |
| `react-dom` | React |
| `tailwind-merge` | dependency |
| `tailwindcss` | Tailwind CSS |
| `three` | Three.js |
| `typescript` | dependency |
| `vite` | Vite |
| `vite-plugin-singlefile` | dependency |

## Runtime and delivery

| Concern | Finding |
| --- | --- |
| Language mix | TypeScript, HTML, JavaScript, Python, CSS, SQL |
| Package manager | npm |
| Container | none |
| Serverless / PaaS | Vercel configuration present |
| CI | none detected |
| Tests | present |
| Type safety | TypeScript |

## Environment variables referenced

- `NODE_ENV`
- `VITE_FRONTEND_ENTRY`
- `VITE_FRONTEND_OUT`
