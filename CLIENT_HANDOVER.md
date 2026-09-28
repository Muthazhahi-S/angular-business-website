# Client Website Handover Checklist

Use this checklist when preparing a local-business website for review and delivery. It can be reused for salon, restaurant, clinic, shop, and professional-service clients.

## 1. Before client review

- [ ] Run the test suite: `npm run test -- --watch=false`
- [ ] Run a production build: `npm run build`
- [ ] Check the desktop layout and section spacing.
- [ ] Check the mobile layout and responsive navigation.
- [ ] Test all navigation links and calls to action.
- [ ] Submit the contact form and confirm its expected email-app behavior.
- [ ] Test the WhatsApp button and confirm the correct number and pre-filled message.
- [ ] Check that all images load and have accurate, useful alt text.

## 2. Client information

Confirm the client's approved details and content:

- [ ] Business name and preferred text-based or supplied logo.
- [ ] Public phone number.
- [ ] WhatsApp number and preferred pre-filled message.
- [ ] Public email address.
- [ ] Business address and location.
- [ ] Google Maps link, if required.
- [ ] Business hours, if required.
- [ ] Services and approved descriptions.
- [ ] Prices, if the client wants them displayed.
- [ ] Social media profile links, if required.
- [ ] Business description and About content.

Record any Google Maps, hours, logo, or social link needs that require additional implementation; do not imply they are displayed until verified in the site.

## 3. Before publishing

- [ ] Replace all demo phone, WhatsApp, and email details with client-approved contact information.
- [ ] Replace every placeholder image with client-approved images and update its alt text.
- [ ] Verify every internal, email, phone, WhatsApp, map, and social link.
- [ ] Verify the SEO page title and meta description.
- [ ] Verify the displayed business name and copyright information.
- [ ] Remove or disable demo-only reminders and any other demo content.
- [ ] Obtain client approval for the final content and appearance before publishing.

## 4. Final delivery

- [ ] Record the client's approval and the approved version/date.
- [ ] Create a final project backup in the agreed location.
- [ ] Commit the reviewed changes to Git.
- [ ] Create a GitHub backup if included in the project handover.
- [ ] Deploy only after the client has approved the final website and deployment destination.

## 5. Future maintenance

- [ ] Update services and descriptions in the selected business profile.
- [ ] Update phone, WhatsApp, email, and address together with their related links/configuration.
- [ ] Replace images and revise alt text whenever imagery changes.
- [ ] Update website packages and prices in the shared package configuration.
- [ ] Update the business name, tagline, About/section copy, SEO title, and description when needed.
- [ ] After changes, rerun tests and the production build and recheck the affected screens and links.
