<div align="center">
  <h1>⚛️ PeriodicaX</h1>
  <p><strong>The Definitive Interactive 3D Periodic Table & Isotope Emulator</strong></p>
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-periodica--x--app.web.app-00C7B7?style=for-the-badge&logo=firebase)](https://periodica-x-app.web.app)
  [![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)](#)
  [![License](https://img.shields.io/badge/license-Custom-blue?style=for-the-badge)](#)
</div>

<br>

**🔗 Live Demo:** [https://periodica-x-app.web.app](https://periodica-x-app.web.app)

PeriodicaX is a highly interactive, visually stunning educational web application built to bring chemistry and nuclear physics to life. It moves beyond static data by providing interactive 3D electron orbital visualizations and a real-time nuclear decay emulator.

## 📸 Showcase

<div align="center">
  <img src="assets/showcase/main_interface.png" alt="Main Periodic Table Interface" width="100%" style="margin-bottom: 10px;">
  <br>
  <img src="assets/showcase/compounds.png" alt="Interactive 3D Molecular Models" width="49%" style="margin-right: 1%;">
  <img src="assets/showcase/crystals.png" alt="Interactive 3D Crystal Structures" width="49%">
  <br>
  <img src="assets/showcase/orbitals.png" alt="3D Electron Orbitals View" width="49%" style="margin-right: 1%; margin-top: 10px;">
  <img src="assets/showcase/isotopes.png" alt="Dynamic Isotope Decay Emulator" width="49%" style="margin-top: 10px;">
</div>

## ✨ Features

- **Interactive Periodic Table:** Browse all 118 elements with beautiful, color-coded categorizations (glassmorphism UI, dynamic gradients).
- **3D Electron Orbitals:** Drag, rotate, and zoom into fully rendered 3D electron clouds (s, p, d, f blocks) built with Three.js.
- **Isotope Decay Emulator:** Select from hundreds of isotopes to view precise nuclear data. Watch a dynamically generated 3D nuclear cluster undergo Alpha, Beta, and Positron decay in real-time.
- **Responsive Aufbau Diagram:** An elegantly responsive electron configuration chart that scales flawlessly to any screen size.
- **Wikipedia Integration:** Learn more about any element or isotope instantly via an embedded modal bypass.
- **Auto-Updating SEO Engine:** A custom build script dynamically parses the element database to generate hundreds of targeted keywords, a sitemap, and JSON-LD structured data upon every build.

## 🛠️ Technology Stack

PeriodicaX is built entirely from scratch with zero heavy frameworks, prioritizing raw performance and vanilla mastery:
- **HTML5 & Vanilla CSS3** (No Tailwind, No Bootstrap)
- **Vanilla JavaScript (ES6)** (No React, No Vue)
- **Three.js** (For 3D rendering)
- **Python** (Custom static site generator and SEO compiler)
- **Firebase Hosting** (For global CDN delivery)

## 🚀 Quick Start (Local Development)

Since PeriodicaX uses a custom build pipeline, you need to compile the source files into the final `public/index.html` file.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vijay-1010110/Periodic-Table.git
   cd Periodic-Table
   ```

2. **Run the build script:**
   The `build.py` script concatenates all CSS and JS, injects them into the HTML, generates the SEO tags, and outputs everything to the `public/` folder.
   ```bash
   python build.py
   ```

3. **Serve locally:**
   You can use any local web server to view the `public/` directory.
   ```bash
   cd public
   python -m http.server 8000
   ```
   Open `http://localhost:8000` in your browser.

## 🤝 Contributing

Contributions are always welcome! Whether it's adding new physical properties to the database, improving the 3D renderer, or fixing UI bugs:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Run `python build.py` to ensure everything compiles.
4. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the Branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## 📄 License

Distributed under the **PeriodicaX Personal Use & Attribution License**. 
See `LICENSE` for more information.

In short:
* ✅ You can use this for personal and educational projects.
* ✅ You can modify the code.
* ❌ You may NOT publish this website publicly as your own product/website.
* ❌ You may NOT use this for commercial purposes.
* ⚠️ You must provide proper credit if you use parts of this code elsewhere.
