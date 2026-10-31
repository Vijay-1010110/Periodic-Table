# Periodica 3D: Molecular Dynamics & Chemical Reaction Engine Specification
**Branch**: `feature/molecular-simulation-overhaul`  
**Date**: October 31, 2026  
**Author**: Antigravity Pair Programmer & Vijay-1010110

---

## 1. Executive Summary & Root Cause Analysis

### 1.1 The Core Problem: Why H₂O Never Breaks at Any Temperature
In the current implementation of `src/js/24_molecule_physics_sim.js`:
1. **Infinitely Rigid Harmonic Springs**: The engine models chemical bonds exclusively with Hooke's Law:
   $$F = -k (r - r_0)$$
   In classical Hookean mechanics, as bond distance $r$ increases, the restoring force increases linearly without bound. There is no concept of a potential well, dissociation threshold, or finite binding energy.
2. **Missing Dissociation Code**: While bond objects contain a `broken: false` boolean flag, **there is zero logic in the entire codebase that ever sets `broken = true`**.
3. **Truncated Temperature Range**: The UI temperature slider in `25_simulation_controls.js` was capped at 1000 K. In physical chemistry, water ($H_2O$) begins significant thermal pyrolysis into $H_2$ and $O_2$ (via $H^\bullet$ and $OH^\bullet$ radicals) only at temperatures exceeding 2200 K – 3500 K.
4. **Permanent Central Restoring Force**: A strong artificial center gravity ($k = 18.0$) pulls all atoms toward the center of the canvas, preventing liberated radicals from separating even if displaced.

### 1.2 Target Vision
Transform the molecular physics simulation from a basic single-molecule spring toy into a **comprehensive Molecular Dynamics, Thermal Dissociation, Reaction Synthesis, and Intermolecular Structure Construction Laboratory**.

Users will be able to:
- Dynamically break bonds via high thermal agitation ($T > 2500$ K), violent kinetic collisions (JOLT / high-velocity collisions), or manual stretching (dragging an atom past its mechanical yield strain).
- Watch water break down into hydroxyl ($OH^\bullet$), hydrogen ($H^\bullet$), and oxygen ($O^{\bullet\bullet}$) radicals, or recombine into $H_2$, $O_2$, and $H_2O$.
- Experiment with an extensive library of 30+ molecules spanning atmospheric gases, hydrocarbons, strong acids, strong bases, ionic crystal lattices, and biochemical structures.
- Control both **Temperature (50 K to 5000 K)** and **Pressure (0.01 atm to 50 atm)** to observe phase changes, collision frequencies, and Le Chatelier reaction shifts.
- Observe **Intermolecular Forces (IMF)**: Hydrogen bonding networks in water forming liquid clusters or solid ice lattices, ionic lattice self-assembly ($Na^+ + Cl^-$), and dipole-dipole attractions.

---

## 2. Physics & Chemistry Engine Architecture

### 2.1 Anharmonic Morse Potential & Bond Rupture Mechanics
Instead of a simple Hookean spring, chemical bonds are modeled using the **Morse Potential**:
$$V(r) = D_e \left(1 - e^{-a(r - r_e)}\right)^2$$
The restoring force is the negative derivative:
$$F(r) = -\frac{dV}{dr} = -2 a D_e \left(1 - e^{-a(r - r_e)}\right) e^{-a(r - r_e)}$$
Where:
- $D_e$ is the **Bond Dissociation Energy** (e.g., $460\text{ kJ/mol}$ for O-H, $410\text{ kJ/mol}$ for C-H, $498\text{ kJ/mol}$ for O=O, $945\text{ kJ/mol}$ for N≡N).
- $r_e$ is the equilibrium bond length.
- $a = \sqrt{k_e / (2 D_e)}$ governs the width of the potential well.

**Rupture Conditions**:
A bond snaps (`broken = true`) when:
1. **Critical Strain**: $r > r_{\text{rupture}} \approx 1.85 \times r_e$ (due to manual drag or kinetic collision).
2. **Thermal Energy Overcome**: Local vibrational kinetic energy $E_{\text{vib}} \ge D_e$.
3. **Collision Impulse**: Kinetic collision energy with an incoming atom exceeds $D_e$.

Upon rupture:
- An audible snap and visual particle spark effect occur.
- The atoms become reactive free radicals with open valence spots.

### 2.2 Recombination & Dynamic Chemical Reactions
When free atoms or radicals collide in the chamber:
- **Valence Compatibility Check**: An atom with open valence spots (e.g., $H$ needs 1 bond, $O$ needs 2 bonds, $N$ needs 3 bonds, $C$ needs 4 bonds, $Cl$ needs 1 bond) checks proximity ($r < r_{\text{reaction}}$) with colliding partners.
- **Activation Energy ($E_a$)**: If the relative collision kinetic energy is sufficient to overcome the activation barrier (or if radicals have zero barrier), a new covalent or ionic bond forms dynamically!
- **Reaction HUD Notification**: Logs reactions in real time (e.g., $2H^\bullet + O \rightarrow H_2O$, $CH_4 + 2O_2 \rightarrow CO_2 + 2H_2O$, $HCl + NaOH \rightarrow NaCl + H_2O$).

### 2.3 Temperature & Pressure Chamber Dynamics
- **Temperature Range ($50\text{ K} - 5000\text{ K}$)**:
  - $T < 273\text{ K}$ (Cryogenic / Solid): Thermal velocities drop; intermolecular hydrogen bonds and ionic attractions lock into rigid crystalline lattices.
  - $273\text{ K} - 373\text{ K}$ (Liquid): Fluid molecular clusters with dynamic breaking and reforming of hydrogen bonds.
  - $373\text{ K} - 2000\text{ K}$ (Gas): Freely flying molecules colliding elastically.
  - $2000\text{ K} - 5000\text{ K}$ (Pyrolysis / Thermal Dissociation / Plasma): Thermal vibrations rip covalent bonds apart into glowing ions and radicals.
- **Pressure Control ($0.01\text{ atm} - 50\text{ atm}$)**:
  - Pressure controls chamber volume boundaries (movable piston walls) and density.
  - Mean free path $\lambda \propto \frac{T}{P}$. At high pressure, molecules collide much more frequently, driving synthesis reactions and phase condensation. At near-vacuum ($0.01\text{ atm}$), dissociated radicals drift without recombining.

### 2.4 Intermolecular Forces (IMF) & Structure Construction
- **Hydrogen Bonding**:
  - Identified by Pauling electronegativity differences ($\Delta \chi > 0.8$ for H bonded to O, N, F).
  - Electrostatic attraction between $\delta^-$ (O, N, F) and $\delta^+$ (H) rendered as animated dotted glowing cyan lines.
  - Self-assembles water molecules into tetrahedral networks and hexagonal rings (ice-like structures).
- **Ionic Lattice Assembly**:
  - Cations ($Na^+$, $Ca^{2+}$, $Mg^{2+}$) and anions ($Cl^-$, $O^{2-}$) attract via Coulomb's Law:
    $$F = \frac{k_e q_1 q_2}{r^2}$$
  - Alternating opposite charges naturally arrange into alternating cubic grids ($NaCl$ rock-salt geometry).
- **Van der Waals / Dipole-Dipole**:
  - Lennard-Jones 12-6 potential provides long-range attraction and short-range repulsion for all non-bonded molecules.

---

## 3. Massive Molecular & Reaction Library

The engine includes 30+ meticulously parameterized presets:
1. **Atmospheric & Simple Gases**:
   - $H_2$ (Hydrogen Gas), $O_2$ (Oxygen Gas), $N_2$ (Nitrogen Gas), $O_3$ (Ozone), $CO_2$ (Carbon Dioxide), $CO$ (Carbon Monoxide), $H_2O$ (Water), $H_2O_2$ (Hydrogen Peroxide).
2. **Hydrocarbons & Organics**:
   - $CH_4$ (Methane), $C_2H_6$ (Ethane), $C_2H_4$ (Ethylene), $C_2H_2$ (Acetylene), $C_3H_8$ (Propane), $C_4H_{10}$ (Butane), $C_6H_6$ (Benzene), $CH_3OH$ (Methanol), $C_2H_5OH$ (Ethanol), $CH_3COOH$ (Acetic Acid), $HCHO$ (Formaldehyde), $C_6H_{12}O_6$ (Glucose fragment).
3. **Acids, Bases & Salts**:
   - $HCl$ (Hydrochloric Acid), $HNO_3$ (Nitric Acid), $H_2SO_4$ (Sulfuric Acid), $NH_3$ (Ammonia), $NaOH$ (Sodium Hydroxide), $NaCl$ (Sodium Chloride lattice).
4. **Multi-Molecule State Chambers**:
   - **Water Cluster ($8\times H_2O$)**: Demonstrates liquid flow and ice lattice formation via hydrogen bonding.
   - **Combustion Chamber ($CH_4 + 2O_2$)**: Reactive mix that ignites when heated or sparked.
   - **Water Synthesis Mix ($2H_2 + O_2$)**: Demonstrates explosive combination into water at high temperature.
   - **Ionic Crystal Grid ($NaCl$ 8-ion cluster)**: Demonstrates ionic lattice bonding.

---

## 4. UI/UX Controls & Telemetry

- **Sim Deck Controls**:
  - Category selector chips: `Atmospheric`, `Organics`, `Acids & Bases`, `Salts & Lattices`, `Multi-Mix`.
  - Molecule quick-picker pills with chemical formula subscripts and representative emoji.
  - **Temperature Slider**: $50\text{ K}$ to $5000\text{ K}$ with live readout and state annotations (`Cryo Ice`, `Liquid`, `Vapor`, `Thermal Pyrolysis`, `Plasma`).
  - **Pressure Slider**: $0.01\text{ atm}$ to $50\text{ atm}$ with chamber wall contraction indicator.
  - **Action Tools**:
    - 💥 **JOLT / Spark**: Injects sudden kinetic/electrical energy to induce reaction or cleavage.
    - ➕ **Inject Radical / Atom**: Add extra $H$, $O$, or $C$ atoms into the live simulation.
    - 🔄 **Reset**: Restores equilibrium geometry.
- **Visual Canvas Rendering**:
  - Dynamic ambient chamber glow reflecting temperature (frost crystal blue $\rightarrow$ deep void $\rightarrow$ infrared orange $\rightarrow$ white-hot plasma).
  - Covalent bonds rendered with 3D gradient lighting and color-coded strain warnings.
  - Hydrogen bonds rendered with dotted animated cyan pulses.
  - Live HUD displaying formula, molecular mass, active bond count, temperature, pressure, and recent reaction events.

---

## 5. Execution Plan

1. **Step 1**: Commit this specification on the new branch `feature/molecular-simulation-overhaul` across both workspaces.
2. **Step 2**: Overhaul `src/js/24_molecule_physics_sim.js`:
   - Implement Morse potential, bond strain, and dynamic bond rupture.
   - Implement collision-based radical recombination and chemical reactions.
   - Build the 30+ molecular presets database with bond energies, equilibrium lengths, and partial charges.
   - Add hydrogen bonding and Coulombic ionic lattice forces.
   - Add pressure-controlled chamber boundary constraints.
3. **Step 3**: Update `src/js/25_simulation_controls.js`:
   - Add Temperature slider ($50\text{ K} - 5000\text{ K}$) and Pressure slider ($0.01\text{ atm} - 50\text{ atm}$).
   - Add category tabs and expanded molecule selectors.
   - Add JOLT / Spark and Radical Injection controls.
4. **Step 4**: Update `src/js/06_compounds_data.js` and `07_compounds.js` to ensure Water ($H_2O$) and related compounds are fully integrated.
5. **Step 5**: Build, verify via headless Chrome CDP / automated test scripts, capture screenshots of thermal H2O dissociation, multi-molecule hydrogen bonding, and reaction synthesis.
6. **Step 6**: Commit and synchronize across `Periodic table` and `Periodica-App`.
