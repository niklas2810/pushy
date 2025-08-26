
# Pushy

A proof-of-concept (POC) Next.js application for testing push notifications via the Web Push API and Service Workers.

## Features

- Set a custom time interval for notifications (1 minute to 24 hours)
- Start/stop receiving notifications with a simple UI
- Unique user identification via browser-generated UUID (stored in localStorage)
- Server stores UUID, interval, and push subscription in SQLite
- Recurring job checks and sends notifications via Web Push API

## Tech Stack

- **Next.js** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** (responsive, dark mode)
- **Tabler Icons** (icons under MIT license, https://github.com/tabler/tabler-icons)
- **SQLite** (user/interval/subscription storage)
- **Web Push API** (notifications)
- **Service Workers** (client-side push handling)

## Architecture

- Server and client components (App Router)
- Feature/domain-based route grouping
- React Server Components for server state
- Zod for runtime type validation
- Error boundaries and proper error handling
- Optimistic updates and loading/error states

## Security & Performance

- Input validation and sanitization
- CSRF protection and rate limiting
- Secure API route handling
- Image/font optimization
- Route prefetching and code splitting

## Getting Started

1. **Install dependencies:**
	```sh
	npm install
	```

2. **Run the development server:**
	```sh
	npm run dev
	```

3. **Build for production:**
	```sh
	npm run build
	```

4. **Start the server:**
	```sh
	npm start
	```

## Usage

1. Open the app in your browser.
2. Set your desired notification interval.
3. Click "Start" to begin receiving notifications.
4. Click "Stop" to unsubscribe.

## File Structure

- `src/app/` – Main app components, pages, and API routes
- `src/lib/` – Database and notification logic
- `public/sw.js` – Service Worker for push notifications
- `data.db` – SQLite database

## Development Standards

- Type safety and runtime validation
- Responsive, accessible UI
- Semantic HTML and container queries
- Proper error/loading states