# TrustSpot: Frontend Client

The **TrustSpot Frontend** is a modern React Single-Page Application (SPA) written in TypeScript and styled with Tailwind CSS, using Zustand for global store state management.

---

## ⚙️ Development Environment

* **Port**: `5173`
* **Build System**: Vite
* **Routing**: React Router DOM (v6)
* **HTTP Client**: Axios (configured with interceptors to automatically forward JWT authorization tokens)

---

## 🏗️ State Stores (Zustand)

Global state is split across three dedicated Zustand stores:
1. **`authStore.ts`**: Manages registration, logins, logouts, JWT token storage, profile image updates, and session persistence.
2. **`placeStore.ts`**: Manages place details caching, creating places, updating place details, and deleting places.
3. **`reviewStore.ts`**: Handles fetching reviews per user/place, creating, editing, and deleting reviews, and liking reviews.

---

## 🎨 Accessibility & Styling Overrides
* **Vanishing Ash Fonts**: Any gray or muted text colors (`.text-gray-500`, `.text-slate-400`, etc.) are mapped to pure black (`#000000`) in `index.css` for optimal readability and accessibility.
* **Responsive Layouts**: Designed for seamless layouts on desktop and mobile screens.

---

## 🚀 How to Run

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Open **`http://localhost:5173`** in your browser.
