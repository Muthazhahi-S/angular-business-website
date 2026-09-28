# Reusable Business Website Template

Use this checklist to prepare a client version. Business content and the active template are managed in `src/app/site-profile.ts`.

## Create a client version

- [ ] **Choose the business type.** Set `ACTIVE_BUSINESS_TYPE` near the bottom of `src/app/site-profile.ts` to one of:
  - `salonBeauty` — Salon / Beauty
  - `restaurantCafe` — Restaurant / Cafe
  - `clinicHealthcare` — Clinic / Healthcare
  - `localRetail` — Local Shop / Retail
  - `professionalServices` — Professional Services
  - `portfolioPersonalBrand` — Portfolio / Personal Brand
- [ ] **Edit that type's entry** in `BUSINESS_PROFILES` in the same file. Update the fields there:
  - Business name, brand mark/wordmark, tagline, email, phone, and location (`address`).
  - Phone display and dial value together: `phone` and `phoneLink`.
  - Hero copy and image details in `hero`.
  - Service section copy and service items in `services`.
  - About content and values in `about`.
  - Reasons to choose the business in `why`.
  - Three project/customer steps in `process`.
  - Contact headings, form labels, prompts, and button copy in `contact`.
  - Browser/page title and search description in `pageTitle` and `pageDescription`.
- [ ] **Set WhatsApp details.** Edit `WHATSAPP_CONFIG` near the top of `site-profile.ts`. The settings are shared by all six profiles. Use the international number with digits only (no `+`, spaces, or punctuation), then set the pre-filled `whatsappMessage`. Set `enableWhatsapp` to `true` to show the contact and floating CTAs, or `false` to hide them.
- [ ] **Review website packages.** Edit `WEBSITE_PACKAGES` in `site-profile.ts`; it is intentionally shared by all profiles. Set each `price` to a display string when ready, or keep it `null` to show no price.
- [ ] **Replace demo images.** In the selected profile's `hero.imageUrl` and `about.imageUrl`, replace the current URLs with client-approved image URLs. For local assets, place files under `public/` and use paths such as `/images/client-hero.jpg`. Update the matching `imageAlt` text to describe each image.
- [ ] **Check demo settings and details.** Replace sample contact values before publishing. `DEMO_SETTINGS.showReminders` controls whether internal reminders are shown; it is `false` by default. The WhatsApp demo number is in `WHATSAPP_CONFIG`.
- [ ] **Review the result** at desktop and mobile widths, including every link, the contact form, and WhatsApp.

Keep the existing object structure and required fields in each profile. Run the tests after editing to catch missing content or configuration errors.

## Run locally and validate

From the project directory:

```bash
npm install
npm start
```

Open `http://localhost:4200/`. Stop the local server with `Ctrl+C`.

Run all tests:

```bash
npm run test -- --watch=false
```

Create a production build:

```bash
npm run build
```

The production output is written to `dist/`.

## Optional: keep each client on a separate Git branch

Start from the project repository, with the desired base branch checked out and up to date:

```bash
git switch -c client/client-name
```

After making and validating the client changes, stage and commit them:

```bash
git add .
git commit -m "Prepare client-name website"
```

To publish the branch to the configured remote:

```bash
git push -u origin client/client-name
```
