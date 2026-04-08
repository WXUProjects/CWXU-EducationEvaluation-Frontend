# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **student-facing frontend** for a teaching evaluation system (评教系统) built for Wuxi University / Novosibirsk Institute. It is a **uni-app** project using **Vue 3** Composition API with Vite as the build tool, targeting H5 (web), native apps, and WeChat Mini Programs.

Sibling projects in the EduEvaluation monorepo: `CWXU-EducationEvaluationManagement-Frontend` (admin) and `edu-evaluation-backed` (backend).

## Development Commands

This project is primarily developed through **HBuilderX** IDE (standard for uni-app). There is no `package.json` with scripts — dependencies live in `uni_modules/`, not `node_modules/`.

For H5 development with Vite:
```bash
# The dev server runs on 0.0.0.0:5173 via HBuilderX
# API proxy: /api -> https://cwxu-dev-eva.iepose.cn
```

No test framework, linter, or formatter is configured.

## Architecture

### Pages and Navigation

Routes are defined in `pages.json`. Four pages, in navigation order:

1. **`pages/login/login`** (launch page) — Student login with task selection
2. **`pages/home/home`** — Course list with teacher evaluation status
3. **`pages/evaluate/evaluate`** — 12-question evaluation form (3 sections × 4 questions)
4. **`pages/my/my`** — User profile and logout

Navigation uses `uni.navigateTo()` (push). Logout uses `uni.reLaunch()` (clears stack). Page params are passed via URL query strings (e.g., `?teacherName=...&courseId=...`).

`pages/index/index` is an unregistered debug page for development use (storage injection, cache clearing).

### State Management

No Vuex/Pinia. All state is stored in `uni.getStorageSync` / `uni.setStorageSync`:
- `token` — JWT auth token
- `stuNo` — Student number
- `taskId` — Current evaluation task ID
- `userInfo` — Object with name, studentNo, sex, etc.

Note: `taskId` has an inconsistency where it's also stored via `localStorage.setItem` in some places.

### API Layer

No centralized API service. Calls are made inline in page components using `uni.request()`. A global request interceptor in `main.js` automatically attaches the `Authorization: Bearer <token>` header.

Key endpoints:
| Method | Endpoint | Used In |
|--------|----------|---------|
| POST | `/api/v1/auth/student/login` | login.vue |
| GET | `/api/v1/auth/student/info` | login.vue |
| GET | `/api/v1/task/list?status=1` | login.vue |
| GET | `/api/v1/task/student_task_detail` | home.vue |
| POST | `/api/v1/task/submit_evaluation` | evaluate.vue |

Full API documentation: `docs/api.md`

### Evaluation Scoring

Each of the 12 questions uses a 5-level satisfaction scale mapped to /10 scores:
- 非常满意 → 9-10, 满意 → 7-8, 一般 → 4-6, 不满意 → 2-3, 非常不满意 → 0-1

A minimum 20-character comment is required. Details are sent as a JSON string array.

### Styling

- Primary color: `$uni-color-primary: #6f2b75` (purple), defined in `uni.scss`
- Uses `rpx` units (responsive pixels for uni-app)
- Pages follow a consistent pattern: purple header with white rounded card body (`border-radius: 48rpx`)
- uni-ui components (`uni-icons`, `uni-load-more`) are auto-imported via easycom

### Vue Conventions

- All pages use `<script setup>` (Composition API)
- `my.vue` uses `<script setup lang="ts">`; other pages use plain JS
- Conditional compilation directives (`#ifdef VUE3`, `#ifdef H5`) are used for multi-platform support
- `main.js` contains dual Vue 2/Vue 3 initialization with conditional compilation
