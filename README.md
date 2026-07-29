# Lely's Bread Website

A premium, mobile-first bakery website designed for Vercel. It displays public menu products from Lely's Bread's Hotplate storefront and replaces e-commerce checkout with a direct SMS order request.

## Phone placeholder

The site currently uses the fictional placeholder number `+1 (561) 555-0147`. Replace `orderPhone` in `site-config.js` with the bakery's real mobile number before launch.

## Hotplate menu sync

`/api/menu.js` reads the public Hotplate storefront API for the `lelysbread` slug. It requests the current live drop, prior public drops, and event details, then normalizes and deduplicates product names, descriptions, prices, images, and availability.

If Hotplate changes or temporarily blocks its public API, the website remains usable and displays a text-to-request fallback.

## Deploy to Vercel

1. In Vercel, choose **Add New → Project**.
2. Import this GitHub repository.
3. Leave the framework preset as **Other** and deploy.

No build command or output directory is needed.
