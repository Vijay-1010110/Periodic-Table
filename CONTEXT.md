# Periodic Table Web Application - Project Context

## Overview
This is a highly interactive, visually stunning Periodic Table web application built with a focus on modern, premium aesthetics (dark mode, glassmorphism, dynamic glowing gradients, micro-animations). It features an interactive periodic table, 3D electron orbital visualizations, and a highly detailed interactive Isotopes and Nuclear Decay Emulator.

## Architecture & Conventions
* **Tech Stack**: Vanilla HTML, CSS, and JavaScript. No external frameworks (like React or Vue) and no utility-class libraries (like Tailwind).
* **Build System**: A custom Python build script (`build.py`) takes files from `src/` (CSS, JS, and HTML templates) and concatenates them into a single, deployable `index.html` file in the root directory. **Always run `python build.py` after modifying source files.**
* **Styling**: Pure vanilla CSS. Dynamic styling (such as coloring elements based on their category or decay mode) is handled via JavaScript injecting inline styles. The app heavily uses glossy, metallic radial gradients and box-shadows to create a tactile 3D feel.
* **Data**: Massive hardcoded JSON arrays are used for elements and isotopes, separated into distinct files (`01_data.js`, `04_isotopes_data.js`).

## File Structure (`src/`)
* `index.html`: The base HTML structure containing UI containers and modal skeletons.
* `css/01_base.css`: The core design system, fonts (`Inter`, `Fira Code`), variables, and static classes.
* `js/01_data.js`: Periodic table element data (atomic number, mass, category, etc.).
* `js/02_main.js`: Main application logic, periodic grid rendering, color mapping, and core interactions.
* `js/03_orbitals.js`: Logic for the 3D electron orbital visualization interface.
* `js/04_isotopes_data.js`: Deep dataset containing physical properties and decay modes for hundreds of specific isotopes.
* `js/05_isotopes.js`: Logic for the Isotopes Modal, including the layout, the CSS `order`-based dynamic filtering system for decay legends, and the UI population of element/isotope cards.
* `js/06_emulator.js`: Logic for the interactive Nuclear Emulator visualization inside the isotope modal.

## Current State & Recent Decisions
* **Isotope Modal Redesign**: We recently overhauled the Isotopes Modal. 
    * We transformed basic text headers into beautiful, periodic-table-style wide "banner" cards for both the parent Element (top-left) and the selected Isotope (top-right). These wide banners dynamically display the element symbol colored by state of matter, and include precise physical properties (Protons, Neutrons, Atomic Mass).
    * We designed highly dense, rectangular isotope cards showing Atomic Number (Z) top-left, Neutrons (N) top-right, custom names (e.g., Protium), and exact atomic mass. We forced `aspect-ratio: 0.8` and `min-height` to prevent browser flex/grid engines from squishing the cards.
* **Filter Sorting Engine**: Instead of destroying and recreating DOM elements when filtering isotopes by decay mode, we implemented a lightning-fast approach using the CSS `order` property. Hovering or clicking a decay mode legend dynamically changes the `order` of matching isotopes to `1` (pushing them to the top), and fades non-matching isotopes to `order: 3`, with dynamically visible section dividers injected at `order: 0` and `order: 2`.

## What We Built Recently
- Fixed isotope modal headers using wide banner cards.
- Embedded Wikipedia iframe modal successfully bypassing `X-Frame-Options`.
- Created a beautiful, fully customized SVG-based Decay Infographic that visualizes the parent nucleus, decay event, daughter nucleus, and emitted particles.
- **Improved Decay Infographic:** Fixed 2D "sausage" visual artifacts by implementing a true 3D randomized spherical volume with Z-depth sorting for protons and neutrons.
- Added explicit full names to the graphical products (e.g., Parent Nucleus (Nickel-49), Emitted Positron, Daughter Nucleus (Cobalt-49)).

## What's Working
- Main periodic table rendering and element modal UI.
- Isotope modal is working flawlessly with the new visual decay diagram generator.
- Clicking "Read Wikipedia ↗" successfully loads the isotope's Wikipedia page inside a popup modal.
- The decay infographic generates perfect 3D nuclear clusters dynamically.

## What's In Progress
- Refinement Phase (new branch `refinement`).
- Continuous UI refinements based on user feedback.

## Next Steps
- Implement UI refinements as requested in the new refinement branch.

## AI Agent Instructions
* **Tool Usage**: Strictly avoid general bash commands for file reading/writing (no `cat`, `grep`, or `sed` in bash). Prioritize specialized native tools (`view_file`, `replace_file_content`, `grep_search`).
* **Context Maintenance**: **CRITICAL RULE:** Whenever the user asks to "secure" or "commit" the code via git, the AI agent MUST update this `CONTEXT.md` file to reflect the latest changes and progress before proceeding with the next tasks.
