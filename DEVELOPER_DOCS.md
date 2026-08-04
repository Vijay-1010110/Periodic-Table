# 🛠️ PeriodicaX — Developer & Infrastructure Guide

This document tracks all developer accounts, hosting environments, analytics property IDs, build commands, and service integrations for **PeriodicaX**.

---

## 🔑 1. Accounts & Services Overview

| Service / Platform | Account / Identifier | Details & Dashboard Links |
| :--- | :--- | :--- |
| **Primary Admin Email** | `vijayvishwakarma2532002@gmail.com` | Central account for Google Analytics, GSC, Firebase |
| **GitHub User** | `Vijay-1010110` | [github.com/Vijay-1010110](https://github.com/Vijay-1010110) |
| **GitHub Repository** | `Periodic-Table` | [github.com/Vijay-1010110/Periodic-Table](https://github.com/Vijay-1010110/Periodic-Table) |
| **Hosting (GitHub Pages)** | Active (`main` branch) | [vijay-1010110.github.io/Periodic-Table](https://vijay-1010110.github.io/Periodic-Table/) |
| **Hosting (Firebase)** | Project ID: `periodica-x-app` | [periodica-x-app.web.app](https://periodica-x-app.web.app) |
| **Google Analytics 4** | Tag ID: `G-4EN5NFDF90` | Account: `vijayvishwakarma2532002@gmail.com`<br>[analytics.google.com](https://analytics.google.com/) |
| **Google Search Console** | Site: `https://vijay-1010110.github.io/Periodic-Table/` | Tag: `ZbZNjpiUNBseMfcBvLLECTlBmqwCRTB-NCTmpHa0e70`<br>[search.google.com/search-console](https://search.google.com/search-console) |

---

## 🏗️ 2. Codebase Architecture & Build Pipeline

The project uses a modular `src/` directory structure with a Python build bundler (`build.py`).

```text
Periodic-Table/
├── src/
│   ├── index.html               # Source HTML template & SEO meta
│   ├── css/
│   │   └── 01_base.css          # Design system & responsive styles
│   └── js/
│       ├── 01_data.js           # 118 Elements data structure
│       ├── 02_main.js           # Main UI, search, tab switcher & hash routing
│       ├── 03_orbitals.js       # Three.js 3D Orbital renderer
│       ├── 04_isotopes_data.js  # Nuclear isotopes database
│       ├── 05_isotopes.js       # Isotope modal & decay simulator
│       ├── 06_compounds_data.js # Chemical compounds database
│       ├── 07_compounds.js      # Compounds grid & search
│       ├── 08_reactions.js      # Reaction balancer
│       ├── 09_crystals_data.js  # Crystal structure data
│       ├── 10_crystals.js       # 3D Crystal lattice renderer
│       ├── 11_compare.js        # Side-by-side element matrix
│       └── 12_quiz.js           # Chemistry quiz engine
├── build.py                     # Python bundler script
├── index.html                   # Compiled root file for GitHub Pages
├── public/                      # Public deployment directory
│   ├── index.html
│   ├── sitemap.xml              # Auto-generated SEO sitemap
│   ├── robots.txt               # Search engine directives
│   └── manifest.json            # PWA Web App manifest
├── .firebaserc                  # Firebase project configuration
├── firebase.json                # Firebase Hosting configuration
└── DEVELOPER_DOCS.md            # Infrastructure reference (This file)
```

---

## 🚀 3. How to Build & Deploy

### A. Local Build & Compile
After modifying any files in `src/`, always run the Python build script:
```bash
python build.py
```
*This compiles `src/` files into `index.html` and `public/index.html`, and regenerates `sitemap.xml` & `robots.txt`.*

### B. Deploying to GitHub Pages (Live Production)
```bash
git add .
git commit -m "Your commit message"
git push origin main
```
*GitHub Pages automatically deploys the updated `index.html` at `https://vijay-1010110.github.io/Periodic-Table/`.*

### C. Deploying to Firebase Hosting (Optional Secondary Hosting)
```bash
firebase deploy
```

---

## 🔗 4. Portable Deep-Linking & Hash Routing Reference

All deep-linking features use relative URL hashes (`./#<route>`), making the application **100% portable** to any domain or hosting provider (GitHub Pages, Firebase, Vercel, Netlify, or Custom Domain) without modifying a single line of code!

| Relative Deep Link | Destination | Example Full URL Format |
| :--- | :--- | :--- |
| `./#isotopes` | Opens Isotopes & Half-Life Simulator | `{YOUR_DOMAIN}/#isotopes` |
| `./#orbitals` | Opens 3D Electron Orbitals View | `{YOUR_DOMAIN}/#orbitals` |
| `./#compounds` | Opens Chemical Compounds Matrix | `{YOUR_DOMAIN}/#compounds` |
| `./#reactions` | Opens Chemical Reaction Balancer | `{YOUR_DOMAIN}/#reactions` |
| `./#crystals` | Opens 3D Crystal Lattices View | `{YOUR_DOMAIN}/#crystals` |
| `./#compare` | Opens Element Comparison Matrix | `{YOUR_DOMAIN}/#compare` |
| `./#quiz` | Opens Interactive Chemistry Quiz | `{YOUR_DOMAIN}/#quiz` |
| `./#element-carbon` | Opens Element detail card for Carbon | `{YOUR_DOMAIN}/#element-carbon` |
| `./#isotope-carbon` | Opens Isotope decay simulator modal for Carbon | `{YOUR_DOMAIN}/#isotope-carbon` |

---

## 📈 5. SEO & Google Indexing Verification

- **Sitemap Location:** `https://vijay-1010110.github.io/Periodic-Table/sitemap.xml`
- **Robots.txt Location:** `https://vijay-1010110.github.io/Periodic-Table/robots.txt`
- **Google Search Console Verification Tag:** `ZbZNjpiUNBseMfcBvLLECTlBmqwCRTB-NCTmpHa0e70`
- **GA4 Measurement ID:** `G-4EN5NFDF90`
