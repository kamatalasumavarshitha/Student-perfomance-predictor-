# Routes

TanStack Start uses **file-based routing**. Every `.tsx` file in this directory
is a route. Do **not** create `src/pages/`, `src/routes/_app/index.tsx`, or
`app/layout.tsx` — those are Next.js / Remix conventions. The only root layout
is `src/routes/__root.tsx`.

## Conventions

| File | URL |
| --- | --- |
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/index.tsx` | `/users` |
| `users/$id.tsx` | `/users/:id` (dynamic — bare `$`, no curly braces) |
| `posts/{-$category}.tsx` | `/posts/:category?` (optional segment) |
| `files/$.tsx` | `/files/*` (splat — read via `_splat` param, never `*`) |
| `_layout.tsx` | layout route (renders children via `<Outlet />`) |
| `__root.tsx` | app shell — wraps every page; preserve `<Outlet />` |

`routeTree.gen.ts` is auto-generated. Don't edit it by hand.
## Live Demo
[Open Student Performance Predictor](https://preview--insight-spark-622.lovable.app)
# Student Performance Predictor

## Objective
The Student Performance Predictor is a machine learning-based web application designed to predict student academic performance based on various input factors such as study hours, attendance, previous scores, and other academic indicators.

The main objective of this project is to help students and educators analyze performance trends and identify factors affecting academic outcomes.

---

## Features
- Predicts student academic performance
- User-friendly web interface
- Input-based prediction system
- Real-time result generation
- Data-driven analysis
- Interactive and responsive design

---

## Tech Stack
### Frontend
- HTML
- CSS
- JavaScript
- React.js

### Backend
- Python

### Machine Learning
- Scikit-learn
- Pandas
- NumPy

### Deployment
- Lovable
