# Lambton Youth Sports Directory — TODO

## Database & Schema

- [x] Define schema: sports_programs, program_changes, ad_slots tables
- [x] Run migration and apply SQL

## Server / API

- [x] tRPC router: programs (list, get, create, update, delete) — admin protected
- [x] tRPC router: programs.public (list with filters: sport, age group, status)
- [x] tRPC router: programChanges (list pending, approve, dismiss) — admin protected
- [x] tRPC router: adSlots (list, create, update, delete, upload image) — admin protected
- [x] tRPC router: adSlots.public (list active ads by position)

## Cron Job

- [x] Monthly cron job: fetch each program URL, compare stored dates, flag changes
- [x] Owner notification triggered on detected changes
- [x] Read periodic-updates.md before implementing cron

## Public Directory Page

- [x] Elegant hero section with site title and tagline
- [x] Search bar (text search on program/org name)
- [x] Filter panel: sport type, age group, registration status
- [x] Program listing cards with all fields + registration link
- [x] Banner ad slot (top of directory)
- [x] Card ad slots (sidebar or inline)
- [x] Empty state and loading skeletons
- [x] Mobile-responsive layout

## Admin Panel (owner-only)

- [x] Admin route guard (owner role only)
- [x] Programs management: add, edit, delete listings
- [x] Pending changes review: approve or dismiss cron-detected changes
- [x] Ad slots management: upload image, set link, set position, toggle active
- [x] Admin navigation tabs

## Polish & Tests

- [x] Global typography and color theme (elegant, refined)
- [x] Animations and micro-interactions
- [x] Vitest unit tests for key routers (17 tests passing)
- [x] Final checkpoint and delivery

## Filter Enhancements (May 2026)

- [x] Add townArea and ageMin/ageMax columns to sports_programs schema and migrate
- [x] Backfill townArea and age values for all 61 existing programs
- [x] Update tRPC publicPrograms query to accept townArea and age filters
- [x] Add Town/Area filter dropdown to Directory page
- [x] Add Age filter (age range dropdown) to Directory page
- [x] Display townArea badge on each program card
