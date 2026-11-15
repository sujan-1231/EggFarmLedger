# Project memory

## Product intent & audience

- App: "Egg Farm Ledger" — local-first multi-user web app for an egg farm to track daily transactions with dealers/shops.
- Audience: The user's uncle and other operators who need a simple, offline, reliable ledger on phone or desktop.
- Core promise: 100% offline, no external backend, browser-only storage via Dexie.js (IndexedDB).

## Brand personality & voice

- Warm, approachable, farm-friendly tone. Clean and trustworthy rather than corporate.
- Helper-style UX for non-technical users (uncle-friendly).

## Visual design & UX direction

- Fresh green farm aesthetic (green/emerald gradients) — changed from original amber/orange.
- Currency: Indian Rupee (INR) with Indian number formatting throughout.
- Layout: sticky header; desktop tab bar; mobile bottom navigation for the four tabs.
- Backup/Restore actions surfaced in header on desktop and in bottom nav on mobile.
- Responsive across mobile and desktop.
- Tables and summary cards are primary UI patterns (recent entries, pending totals, customer lists, history).
- Form auto-calculation is a key interaction: Bill Amount, Net Pending Trays, Net Amount Pending update live as the user types.
- Icons from lucide-react; Tailwind classes for styling; `@/` path alias for imports.

## Decisions, constraints & rationale

- Stack: Vite + React + Tailwind + Dexie.js. No UI theme/icon packages beyond lucide-react.
- Storage: Dexie (IndexedDB) only; JSON export/import for backup portability.
- Auth: Local sign-up/login with SHA-256 password hashing stored in-browser. No server auth.
- Data isolation: Every customer profile and transaction record is tagged with `userId`; accounts are completely separate per logged-in user.
- Transaction fields: customer, date, trays given, eggs per tray, current rate, trays returned, amount paid today, optional note; derived fields auto-calculated.
- Pending view aggregates per-customer: trays given/returned/pending and amount pending, plus totals.
- Customers model: Name, Type (dealer/shop), Phone.
- History: full audit log with search and month filter; delete capability included.
- Currency confirmed: Indian Rupee (₹) with Indian number formatting.
- Theme confirmed: Green/emerald farm aesthetic across all screens and components.
- Build/typecheck verified clean at end of turn.

## Open questions & assumptions

- Assumed a single shared device with multiple local user accounts (no sync between devices).
- Assumed rate is per egg; bill amount = trays given × eggs per tray × rate, reduced by amount paid today for net pending — exact formulas not confirmed by user.
- No role/permission model assumed beyond per-user data isolation.