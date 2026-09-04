# PROJECT OVERVIEW: Lambton County Sports

**Primary Production Domain:** [https://lambtoncountysports.ca](https://lambtoncountysports.ca)  
**Hosting / Deployment:** Vercel (Edge network, auto-deploys from `main` branch)  
**GitHub Repository:** `jrbrimble/lambton-county-sports`  
**Registrar / DNS:** Namecheap (Apex A-Record `216.198.79.1`, `www` 301-redirects to apex)  
**Database & Storage:** Supabase PostgreSQL (via Drizzle ORM) + Supabase Storage (`ad-images` bucket)  
**Authentication:** Custom JWT-based auth (`jose` + `bcryptjs` with HTTP-only cookies)

---

## ⚠️ THE GOLDEN RULE (MANDATORY FOR ALL FUTURE SESSIONS)

> **CRITICAL DIRECTIVE FROM THE PROJECT OWNER:**  
> **DO NOT modify, alter, redesign, or remove any existing visual design, UI layouts, styling, or working features without FIRST discussing it with the user and getting explicit approval.**  
> Any new features must integrate seamlessly into the existing design aesthetic and must not break or alter existing functionality.

---

## 1. Directory Structure

All source code lives inside the `source/` directory:
```
Lambton County Sports/
├── PROJECT_OVERVIEW.md         <-- This context guide
└── source/
    ├── api/                   <-- Vercel serverless API entries
    │   └── index.ts           <-- Express & tRPC serverless entrypoint
    ├── client/                <-- Frontend React SPA (Vite + Tailwind v4)
    │   ├── public/            <-- Public assets (robots.txt, sitemap.xml, logos, heroes)
    │   ├── src/
    │   │   ├── _core/hooks/   <-- useAuth, etc.
    │   │   ├── components/    <-- Navbar, Footer, UI components
    │   │   ├── pages/         <-- Directory (/), Calendar (/calendar), Swap (/swap),
    │   │   │                      Dashboard (/dashboard), Admin (/admin), Login (/login)
    │   │   ├── App.tsx        <-- Routes & Navigation
    │   │   └── main.tsx       <-- React Root
    │   └── index.html         <-- Master SEO, Geo-tags, Schema.org JSON-LD graph
    ├── drizzle/               <-- Database schema & migrations
    │   └── schema.ts          <-- Drizzle ORM schema definitions
    ├── server/                <-- Backend API logic
    │   ├── _core/             <-- Auth, context, env, tRPC setup, notifications
    │   ├── db.ts              <-- Drizzle DB query helpers
    │   ├── routers.ts         <-- tRPC router endpoints
    │   ├── storage.ts         <-- Supabase Storage client
    │   ├── cronHandler.ts     <-- Monthly automated URL scraper
    │   └── webhookHandler.ts  <-- HighLevel webhook receiver & payload parser
    ├── package.json
    ├── vercel.json            <-- Serverless routes, rewrites, and cron schedules
    └── vite.config.ts
```

---

## 2. Core Features & Implementations

### A. Public Sports Directory (`/`)
* 60+ seeded youth sports programs across 11 Lambton County municipalities.
* Filters: Sport, Town/Municipality, Age Bracket (3-5 up to 18+), Registration Status (*Open Now*, *Upcoming*, *All*), and Search.
* Direct registration buttons linking to external league websites.
* Dynamic ad sponsor banners (Top, Sidebar, Inline, Bottom).

### B. Season Calendar (`/calendar`)
* Interactive timeline of registration windows and season playing dates.
* Color-coded sport pills, year toggle, month view, and detail modals.

### C. Community Equipment Swap Board (`/swap` & `/dashboard`)
* Free community gear marketplace for parents to buy, sell, or donate used sports equipment.
* Features 60-day auto-expiry, condition badges (*Like New*, *Good*, *Fair*, *Well Worn*), and size tags.
* **Privacy & Anti-Scraping:** Contact buttons (*Email* & *Call*) are **LOCKED** for unauthenticated visitors. They see a clean `🔒 Sign in to Contact` button linking to `/login?mode=register`. The backend API masks email/phone to `null` unless logged in.
* **Seller Dashboard (`/dashboard`):** Authenticated users manage listings and toggle status (*Active* / *Completed*). Features a dedicated **Sign Out** button.
* **Navbar:** Compact icon-only **Log Out** button with tooltip, preserving single-line brand title formatting.

### D. Admin Panel (`/admin`)
Protected by role (`role: admin`). Features 8 dedicated tabs:
1. **Programs:** Add, edit, delete programs; active/inactive toggle; amber pending submission review banner with 1-click approve.
2. **Pending Changes:** Detected date updates from the automated URL scraper with approve/dismiss buttons.
3. **Ad Slots:** Upload sponsor banners to Supabase storage, set target URLs and placements.
4. **Web Scraper:** Configure and manually trigger the automated URL date checker.
5. **Users:** View all registered accounts, promote to admin, or delete users (with cascading listing cleanup).
6. **Marketplace:** View ALL swap listings with **full seller info** (Name, Email, Phone `📞`, Town `📍`), status filter tabs (*All, Active, Completed, Archived*), search, and CSV export.
7. **Alert Subscribers:** View and export parents subscribed to registration reminders.
8. **Sponsorship Inquiries:** Lead pipeline for local businesses inquiring about sponsor slots (*New*, *Contacted*, *Closed* status workflow + CSV export).

---

## 3. HighLevel (GHL) Form & Webhook Integrations

The site integrates 3 distinct GoHighLevel forms:

| Form Name | HighLevel Form ID | Embedded Location | Webhook Endpoint | Admin Storage & Workflow |
| :--- | :--- | :--- | :--- | :--- |
| **Submit A Program** | `XqtFVx79yw2XE6Y1yROg` | Modal popup on Navbar & Directory | `/api/webhook/program-submission` | Saved in `sports_programs` with `isActive: false`. Amber badge in Admin with 1-click **Approve & Publish**. |
| **Never Miss A Signup** | `ly6veWDO6ycXFqgRSlzP` | Embedded homepage section | `/api/webhook/alert-subscription` | Saved in `alert_subscribers` table. Exportable via Admin **Alert Subscribers** tab. |
| **Enquire About Sponsorship** | `03pw73IXAfBolrbEW1rO` | Modal popup on footer & ad cards | `/api/webhook/sponsor-inquiry` | Deep recursive search extracts `full_name`, `organization`, `email`, `phone`, and `sponsorship-notes`. Saved in `sponsorship_inquiries` table with pipeline workflow. |

*Note: Webhook URLs on HighLevel can point to either `https://lambtoncountysports.ca/api/webhook/[endpoint]` or `https://lambton-county-sports.vercel.app/api/webhook/[endpoint]`.*

---

## 4. SEO & AEO (Answer Engine Optimization)

* **Primary Canonical URL:** `https://lambtoncountysports.ca/`
* **Robots Directives (`/robots.txt`):** Whitelists search engines and AI crawlers (`GPTBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`). Disallows `/admin` and `/dashboard`.
* **XML Sitemap (`/sitemap.xml`):** Lists all public pages with priority & daily/weekly changefreq.
* **Google Search Console Verification:** Dual-verified via Namecheap DNS TXT record and embedded HTML meta tag (`EifooWgzjlmJqZLXZ4QKXtt8TDVlNtGSAY7W6tdHC5M`).
* **Schema.org JSON-LD Graph (`client/index.html`):**
  * `WebSite` with Sitelinks `SearchAction`.
  * `Organization` with logo and full `areaServed` mapping (*Sarnia, Petrolia, Forest, Point Edward, Corunna, Plympton-Wyoming, Grand Bend, Lambton County*).
  * `FAQPage` structured data answering 5 direct high-intent parent queries for AI Answer Engines.
  * `ItemList` and `BreadcrumbList`.
* **Dynamic Page Titles:** React `useEffect` dynamically updates document titles on `/`, `/calendar`, and `/swap`.

---

## 5. Development & Deployment Workflow

Always run commands inside the `source/` directory:

```bash
# 1. Navigate to source
cd source

# 2. Type-checking (Zero errors policy)
pnpm check

# 3. Test production build
pnpm build

# 4. Commit and deploy to live production
git add .
git commit -m "feat: description of new feature"
git push origin main
```

*Pushing to `main` automatically triggers a production build and deployment on Vercel at [lambtoncountysports.ca](https://lambtoncountysports.ca).*
