# PeriodicaX - Project Handover Document

Welcome to the PeriodicaX project! This document provides a high-level summary of the repository state, architecture, and pending tasks to get you quickly oriented.

## 1. Project Overview
PeriodicaX is an interactive, highly visual Periodic Table and Chemistry simulation web app.
- **Core Features:** 118 interactive elements, 3D electron orbitals (Three.js), Isotope Decay Emulator, Chemical Reactions balancer, 3D Crystal Lattices.
- **Tech Stack:** Vanilla JavaScript, HTML5, CSS3, Three.js (No React/Vue).
- **Architecture:** Monorepo. The web version and native mobile version (via Capacitor) share the exact same codebase (`src/`).

## 2. Essential Reading (Documentation Map)
Before touching the codebase, please review the following Markdown files located in the root directory:
1. **`CONTEXT.md`**: Deep dive into how the CSS and JavaScript rendering engines work, recent major changes, and the strict rules AI agents must follow.
2. **`DEVELOPER_DOCS.md`**: Contains all the admin emails, API keys, Google Analytics Tags, Firebase Project IDs, and SEO verification strings.
3. **`MOBILE_ARCHITECTURE.md`**: Explains how Capacitor connects the Web App to the Native Android/iOS shell, and how to use the `PlatformManager` feature flags.

## 3. How to Run & Build the Project
We use a custom Python build pipeline. **Never edit files in the `public/` directory or the root `index.html`.** Only edit files in `src/`.

### Local Development:
1. Run a local python server in the root directory:
   ```bash
   python -m http.server 8080
   ```
2. Open `http://localhost:8080/src/index.html` in your browser.

### Building for Production / Mobile:
When you are ready to compile the code for production (or sync it to the mobile apps), run:
```bash
python build.py
```
This script will:
- Combine all CSS and JS files in `src/` into a single, optimized `index.html`.
- Generate `sitemap.xml` and `robots.txt` for SEO.
- Copy everything into the `public/` folder.
- Execute `npx cap copy` to synchronize the changes to the Android/iOS native app shells.

## 4. Where We Left Off (Pending Tasks)
* **SEO & Monetization:** We recently added AdSense, Microsoft Clarity, and Bing Webmaster tags. However, the exact IDs are still set to `[PENDING YOUR SETUP]` in `DEVELOPER_DOCS.md` and `src/index.html`. These must be updated once the admin creates the accounts.
* **Mobile App Generation:** The Capacitor architecture is complete (`npm init`, `cap init`, feature flags), but we have not yet run `npx cap add android` or `npx cap add ios` to generate the physical Android Studio and Xcode projects.
* **Custom Domain:** The site is hosted on GitHub Pages (`vijay-1010110.github.io`). A custom domain needs to be purchased and linked to get AdSense approval.

*Good luck, and build something beautiful!*
