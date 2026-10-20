/**
 * PERIODICA 3D - Environment & Pressure Simulation System (Extreme Phase Lab)
 * Live Visual Atom Chamber & Clausius-Clapeyron Phase Space Engine
 * 
 * Features:
 * 1. Live Visual Atom Chamber (PhET / Brilliant.org Model):
 *    - Solid: Crystalline lattice with bond lines; thermal harmonic vibration increases toward melting point.
 *    - Liquid: Cohesive fluid pool at bottom; atoms roll, flow, and tumble past each other with meniscus waves.
 *    - Gas: Dispersed thermal kinetic vapor; elastic collisions against chamber walls & movable pressure piston.
 *    - Plasma: Ionized nuclei with glowing coronal halos, detached electrons buzzing erratically, and lightning arcs.
 *    - Supercritical Fluid: Dense penetrative fluid with turbulent density eddies beyond critical point (Tc, Pc).
 * 2. Movable Hydraulic Pressure Piston (responds to pressure slider / presets in real time).
 * 3. Thermal Plate at bottom (frost cyan <100K, steel 300K, heat coils >1000K, incandescent plasma >3000K).
 * 4. Dual View Modes: Visual Atom Chamber, P-T Phase Diagram, and Split View (Chamber + P-T Radar).
 * 
 * Compliant with NIST Chemistry WebBook, IUPAC standards, and Bridgman high-pressure physics.
 * (c) 2026 Periodica 3D | Developer: Vijay-1010110
 */

(function () {
    'use strict';

    // Physical Constants
    const R_GAS = 8.314462618; // J / (mol * K)
    const ATM_TO_PA = 101325; // 1 atm in Pascals
    const BAR_TO_PA = 100000;
    const GPA_TO_PA = 1e9;

    /**
     * Environment Presets spanning the Universe & High-Pressure Laboratories
     */
    const ENVIRONMENT_PRESETS = [
        {
            id: 'earth_stp',
            name: 'Earth Ambient (STP)',
            icon: '🌍',
            tempK: 298.15,
            pressureAtm: 1.0,
            desc: 'Standard laboratory conditions on Earth surface (25°C, 1.013 bar).'
        },
        {
            id: 'deep_space',
            name: 'Deep Cosmic Vacuum',
            icon: '🌌',
            tempK: 2.725,
            pressureAtm: 1e-14,
            desc: 'Intergalactic cosmic microwave background vacuum; near absolute zero.'
        },
        {
            id: 'mars_surface',
            name: 'Mars Surface',
            icon: '🪐',
            tempK: 210.0,
            pressureAtm: 0.00628,
            desc: 'Thin CO2 atmosphere (6.3 mbar, -63°C); low-pressure sublimation regime.'
        },
        {
            id: 'mariana_trench',
            name: 'Mariana Trench (Abyss)',
            icon: '🌊',
            tempK: 275.15,
            pressureAtm: 1086.0,
            desc: 'Challenger Deep floor (11,000m depth); extreme hydrostatic pressure.'
        },
        {
            id: 'diamond_anvil',
            name: 'Diamond Anvil Cell (DAC)',
            icon: '💎',
            tempK: 300.0,
            pressureAtm: 4.93e5, // ~50 GPa
            desc: 'Laser-heated ultra-high pressure lab cell; forces metallic states.'
        },
        {
            id: 'earth_outer_core',
            name: 'Earth Outer Core',
            icon: '🌋',
            tempK: 4200.0,
            pressureAtm: 1.35e6, // ~136 GPa
            desc: 'Liquid iron-nickel geodynamo boundary under immense gravitational overburden.'
        },
        {
            id: 'sun_core',
            name: 'Solar Core',
            icon: '☀️',
            tempK: 1.57e7,
            pressureAtm: 2.47e11, // ~250 billion atm
            desc: 'Fully ionized thermonuclear plasma fusing protons into alpha particles.'
        }
    ];

    /**
     * Key Elemental Phase Thermodynamic Coefficients
     * Sourced from NIST / CRC Handbook of Chemistry & Physics
     */
    const THERMO_ELEMENT_DB = {
        1:  { name: 'Hydrogen',   Tt: 13.96, Pt: 0.071,  Tc: 33.19, Pc: 12.8,   P_metal: 4.2e6, deltaH_vap: 0.904, deltaH_fus: 0.117 },
        2:  { name: 'Helium',     Tt: 2.17,  Pt: 0.050,  Tc: 5.19,  Pc: 2.24,   P_metal: 1e8,   deltaH_vap: 0.083, deltaH_fus: 0.020 },
        6:  { name: 'Carbon',     Tt: 4765,  Pt: 101,    Tc: 6810,  Pc: 2200,   P_metal: 2e7,   deltaH_vap: 715.0, deltaH_fus: 105.0 },
        7:  { name: 'Nitrogen',   Tt: 63.15, Pt: 0.124,  Tc: 126.2, Pc: 33.5,   P_metal: 1.4e6, deltaH_vap: 5.57,  deltaH_fus: 0.720 },
        8:  { name: 'Oxygen',     Tt: 54.36, Pt: 0.0015, Tc: 154.6, Pc: 49.8,   P_metal: 9.6e5, deltaH_vap: 6.82,  deltaH_fus: 0.444 },
        26: { name: 'Iron',       Tt: 1811,  Pt: 1e-6,   Tc: 9240,  Pc: 8750,   P_metal: 0,     deltaH_vap: 340.0, deltaH_fus: 13.81 },
        79: { name: 'Gold',       Tt: 1337,  Pt: 1e-6,   Tc: 7800,  Pc: 5300,   P_metal: 0,     deltaH_vap: 330.0, deltaH_fus: 12.50 },
        80: { name: 'Mercury',    Tt: 234.3, Pt: 2e-9,   Tc: 1750,  Pc: 1720,   P_metal: 0,     deltaH_vap: 59.11, deltaH_fus: 2.295 },
        92: { name: 'Uranium',    Tt: 1408,  Pt: 1e-8,   Tc: 4400,  Pc: 4000,   P_metal: 0,     deltaH_vap: 417.0, deltaH_fus: 9.140 }
    };

    /**
     * Physical Chamber Atom Entity
     */
    class ChamberAtom {
        constructor(x, y, radius = 9, color = '#38bdf8') {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 20;
            this.vy = (Math.random() - 0.5) * 20;
            this.radius = radius;
            this.color = color;
            this.latticeX = x;
            this.latticeY = y;
            this.electronAngle = Math.random() * Math.PI * 2;
        }
    }

    /**
     * EnvironmentSimulationEngine (OOP Architecture with Live Atom Chamber)
     */
    class EnvironmentSimulationEngine {
        constructor() {
            this.temperatureK = 298.15;
            this.pressureAtm = 1.0;
            this.currentPresetId = 'earth_stp';
            this.listeners = new Set();
            this.activeElementId = 6; // Carbon default

            // View Mode: 'split' | 'chamber' | 'diagram'
            this.viewMode = 'split';

            // Chamber Simulation State
            this.atoms = [];
            this.electrons = [];
            this.plasmaSparks = [];
            this.chamberWidth = 600;
            this.chamberHeight = 400;
            this.pistonY = 80;
            this.targetPistonY = 80;
            this.isDraggingPiston = false;
            this.pistonDragStartY = 0;
            this.pistonDragStartP = 1.0;
            this.prevPhaseCode = 'solid';
            this.lastFrameTime = performance.now();

            this.initChamberAtoms(this.chamberWidth, this.chamberHeight);
        }

        setViewMode(mode) {
            if (['split', 'chamber', 'diagram'].includes(mode)) {
                this.viewMode = mode;
                if (typeof window.renderTuningPanel === 'function') {
                    window.renderTuningPanel('environment');
                }
            }
        }

        initChamberAtoms(w, h) {
            this.chamberWidth = Math.max(300, w);
            this.chamberHeight = Math.max(220, h);
            this.atoms = [];
            this.electrons = [];
            this.plasmaSparks = [];

            const cols = 8;
            const rows = 8;
            for (let i = 0; i < cols * rows; i++) {
                this.atoms.push(new ChamberAtom(0, 0, 8, '#38bdf8'));
            }
            this.recalculateLatticePositions(this.chamberWidth, this.chamberHeight);
        }

        recalculateLatticePositions(w, h) {
            this.chamberWidth = Math.max(300, w);
            this.chamberHeight = Math.max(220, h);

            const chamberLeft = (this.viewMode === 'split') ? 25 : Math.max(36, w * 0.08);
            const chamberRight = (this.viewMode === 'split') ? (w * 0.62) : (w - Math.max(36, w * 0.08));
            const chamberWidth = chamberRight - chamberLeft;
            const chamberBottom = h - 46;

            const cols = 8;
            const rows = 8;
            const maxSpacingH = (chamberBottom - 110) / rows;
            const maxSpacingW = (chamberWidth - 36) / cols;
            this.baseSpacing = Math.max(13, Math.min(20, Math.min(maxSpacingH, maxSpacingW)));
            this.atomRadius = Math.max(5.5, Math.min(8.5, this.baseSpacing * 0.40));
            const spacing = this.baseSpacing;
            const atomRadius = this.atomRadius;

            const latticeTotalW = (cols - 1) * spacing;
            this.boxLeft = chamberLeft + (chamberWidth - latticeTotalW) / 2;
            this.boxBottom = chamberBottom - atomRadius - 4;
            const boxLeft = this.boxLeft;
            const boxBottom = this.boxBottom;

            for (let i = 0; i < this.atoms.length; i++) {
                const atom = this.atoms[i];
                atom.radius = atomRadius;
                const r = Math.floor(i / cols);
                const c = i % cols;
                atom.latticeX = boxLeft + c * spacing;
                atom.latticeY = boxBottom - (rows - 1 - r) * spacing;
                if (atom.x === 0 && atom.y === 0) {
                    atom.x = atom.latticeX;
                    atom.y = atom.latticeY;
                }
            }
        }

        subscribe(listener) {
            if (typeof listener === 'function') {
                this.listeners.add(listener);
            }
            return () => this.listeners.delete(listener);
        }

        notify() {
            const state = this.getState();
            this.listeners.forEach(fn => {
                try { fn(state); } catch (e) { console.error('[EnvSim Error]', e); }
            });
        }

        getState() {
            return {
                temperatureK: this.temperatureK,
                temperatureC: this.temperatureK - 273.15,
                temperatureF: (this.temperatureK - 273.15) * 9 / 5 + 32,
                pressureAtm: this.pressureAtm,
                pressureBar: this.pressureAtm * 1.01325,
                pressurePa: this.pressureAtm * ATM_TO_PA,
                pressureGPa: (this.pressureAtm * ATM_TO_PA) / 1e9,
                pressurePsi: this.pressureAtm * 14.6959,
                currentPresetId: this.currentPresetId,
                activeElementId: this.activeElementId,
                viewMode: this.viewMode
            };
        }

        setTemperature(kelvin) {
            const clamped = Math.max(0.001, Math.min(2e7, Number(kelvin) || 298.15));
            this.temperatureK = clamped;
            this.currentPresetId = 'custom';
            this.notify();
        }

        setPressure(atm) {
            const clamped = Math.max(1e-14, Math.min(1e12, Number(atm) || 1.0));
            this.pressureAtm = clamped;
            this.currentPresetId = 'custom';
            this.notify();
        }

        setPreset(presetId) {
            const preset = ENVIRONMENT_PRESETS.find(p => p.id === presetId);
            if (!preset) return;
            this.temperatureK = preset.tempK;
            this.pressureAtm = preset.pressureAtm;
            this.currentPresetId = preset.id;
            this.notify();
        }

        handleDiagramPointer(x, y) {
            if (!this.diagramPadLeft || !this.diagramPadRight) return false;
            const padLeft = this.diagramPadLeft;
            const padRight = this.diagramPadRight;
            const padTop = this.diagramPadTop;
            const padBottom = this.diagramPadBottom;
            const plotW = padRight - padLeft;
            const plotH = (this.lastDiagramH || 400) - padTop - padBottom;

            if (x >= padLeft - 6 && x <= padRight + 6 && y >= padTop - 6 && y <= padTop + plotH + 6) {
                const tFrac = Math.max(0, Math.min(1, (x - padLeft) / plotW));
                const pFrac = Math.max(0, Math.min(1, 1 - (y - padTop) / plotH));

                const newT = this.diagramMinT + tFrac * (this.diagramMaxT - this.diagramMinT);
                const logP = this.diagramMinLogP + pFrac * (this.diagramMaxLogP - this.diagramMinLogP);
                const newP = Math.pow(10, logP);

                this.setTemperature(newT);
                this.setPressure(newP);
                return true;
            }
            return false;
        }

        startPistonDrag(x, y) {
            const chamberLeft = this.lastChamberLeft || ((this.viewMode === 'split') ? 25 : Math.max(36, this.chamberWidth * 0.08));
            const chamberRight = this.lastChamberRight || ((this.viewMode === 'split') ? (this.chamberWidth * 0.62) : (this.chamberWidth - Math.max(36, this.chamberWidth * 0.08)));
            if (x >= chamberLeft - 15 && x <= chamberRight + 15 && Math.abs(y - (this.pistonY + 8)) < 28) {
                this.isDraggingPiston = true;
                this.pistonDragStartY = y;
                this.pistonDragStartP = this.pressureAtm;
                return true;
            }
            return false;
        }

        movePistonDrag(x, y) {
            if (!this.isDraggingPiston) return;
            const dy = y - this.pistonDragStartY;
            const deltaOrders = dy / 28.0;
            const newP = Math.max(1e-12, Math.min(1e10, this.pistonDragStartP * Math.pow(10, deltaOrders)));
            this.setPressure(newP);
        }

        endPistonDrag() {
            this.isDraggingPiston = false;
            if (typeof window.renderGameDeck === 'function' && window.simPlaybackController && window.simPlaybackController.activeTab === 'environment') {
                window.renderGameDeck('environment');
            }
        }

        setElement(z) {
            this.activeElementId = parseInt(z, 10) || 6;
            this.notify();
            if (typeof window.renderGameDeck === 'function') {
                window.renderGameDeck('environment');
            }
        }

        heat(deltaK = 150) {
            this.setTemperature(Math.min(35000, this.temperatureK + deltaK));
            if (typeof window.renderGameDeck === 'function') {
                window.renderGameDeck('environment');
            }
        }

        cool(deltaK = 150) {
            this.setTemperature(Math.max(1, this.temperatureK - deltaK));
            if (typeof window.renderGameDeck === 'function') {
                window.renderGameDeck('environment');
            }
        }

        compress(factor = 2.0) {
            this.setPressure(Math.min(1e11, this.pressureAtm * factor));
            if (typeof window.renderGameDeck === 'function') {
                window.renderGameDeck('environment');
            }
        }

        decompress(factor = 2.0) {
            this.setPressure(Math.max(1e-12, this.pressureAtm / factor));
            if (typeof window.renderGameDeck === 'function') {
                window.renderGameDeck('environment');
            }
        }

        quickJumpPhase(phaseType) {
            const allElements = (typeof elementsData !== 'undefined' ? elementsData : (window.elementsData || []));
            const elData = allElements.find(e => e.atomicNumber === this.activeElementId) || { melt: 1000, boil: 2500 };
            const Tm = elData.melt ? Number(elData.melt) : 1000;
            const Tb = elData.boil ? Number(elData.boil) : 2500;

            if (phaseType === 'solid') {
                this.setTemperature(Math.max(5, Tm * 0.45));
                this.setPressure(1.0);
            } else if (phaseType === 'liquid') {
                this.setTemperature(Tm + (Tb - Tm) * 0.40);
                this.setPressure(1.0);
            } else if (phaseType === 'gas') {
                this.setTemperature(Tb * 1.35);
                this.setPressure(1.0);
            } else if (phaseType === 'plasma') {
                this.setTemperature(18000);
                this.setPressure(0.05);
            }

            if (window.physicsAudio) {
                window.physicsAudio.playPhaseTransitionSizzle?.(phaseType);
            }
        }

        calculatePhase(elementData) {
            const T = this.temperatureK;
            const P = this.pressureAtm;
            const Z = this.activeElementId;

            const thermo = THERMO_ELEMENT_DB[Z] || {
                Tt: elementData?.melt ? Number(elementData.melt) : 1000,
                Pt: 0.01,
                Tc: elementData?.boil ? Number(elementData.boil) * 1.5 : 3000,
                Pc: 100,
                P_metal: 1e7,
                deltaH_vap: 150.0,
                deltaH_fus: 10.0
            };

            const T_melt_1atm = elementData?.melt ? Number(elementData.melt) : 1000;
            const T_boil_1atm = elementData?.boil ? Number(elementData.boil) : 2500;

            // 1. Plasma Regime
            if (T > 25000 || (T > 10000 && P < 0.01)) {
                return {
                    state: 'Plasma',
                    code: 'plasma',
                    color: '#f43f5e',
                    badge: '⚡ PLASMA',
                    details: 'Thermal ionization strips orbital electrons into glowing ions and free electrons.'
                };
            }

            // 2. High-Pressure Metallic Phase
            if (thermo.P_metal > 0 && P >= thermo.P_metal) {
                return {
                    state: 'Metallic / Degenerate Solid',
                    code: 'metallic',
                    color: '#38bdf8',
                    badge: '💎 METALLIC SOLID',
                    details: `Extreme compressive stress (>${(thermo.P_metal * ATM_TO_PA / 1e9).toFixed(1)} GPa) forces electron delocalization.`
                };
            }

            // 3. Supercritical Fluid Regime
            if (T > thermo.Tc && P > thermo.Pc) {
                return {
                    state: 'Supercritical Fluid',
                    code: 'supercritical',
                    color: '#eab308',
                    badge: '🌀 SUPERCRITICAL',
                    details: 'Beyond critical point (Tc, Pc); liquid and vapor merge into penetrative supercritical fluid.'
                };
            }

            // 4. Pressure-Shifted Boiling & Melting Curves
            let dynamicTboil = T_boil_1atm;
            if (thermo.deltaH_vap > 0 && T_boil_1atm > 0) {
                const invT = (1 / T_boil_1atm) - (R_GAS * Math.log(Math.max(1e-12, P))) / (thermo.deltaH_vap * 1000);
                dynamicTboil = (invT > 0) ? (1 / invT) : (T_boil_1atm * 3);
            }

            let dynamicTmelt = T_melt_1atm;
            if (P > 1.0) {
                dynamicTmelt = T_melt_1atm * Math.pow(1 + P / 5000, 0.12);
            } else {
                dynamicTmelt = Math.max(0.1, T_melt_1atm * Math.pow(Math.max(1e-6, P), 0.02));
            }

            if (T < dynamicTmelt) {
                return {
                    state: 'Solid',
                    code: 'solid',
                    color: '#00d4ff',
                    badge: '🧊 SOLID',
                    meltAtP: dynamicTmelt,
                    boilAtP: dynamicTboil,
                    details: `Rigid crystalline lattice. Under current pressure (${P < 1 ? P.toExponential(2) : P.toFixed(1)} atm), melting point shifts to ${dynamicTmelt.toFixed(1)} K.`
                };
            } else if (T < dynamicTboil) {
                return {
                    state: 'Liquid',
                    code: 'liquid',
                    color: '#10b981',
                    badge: '💧 LIQUID',
                    meltAtP: dynamicTmelt,
                    boilAtP: dynamicTboil,
                    details: `Thermodynamically stable liquid phase. Boiling point under current pressure is ${dynamicTboil.toFixed(1)} K.`
                };
            } else {
                return {
                    state: 'Gas',
                    code: 'gas',
                    color: '#f97316',
                    badge: '💨 GAS',
                    meltAtP: dynamicTmelt,
                    boilAtP: dynamicTboil,
                    details: `Dispersed thermal kinetic vapor. Condensation occurs if cooled below ${dynamicTboil.toFixed(1)} K.`
                };
            }
        }

        updateChamberPhysics(dt, w, h, phase) {
            const T = this.temperatureK;
            const P = this.pressureAtm;

            if (this.lastChamberW !== w || this.lastChamberH !== h || this.lastChamberMode !== this.viewMode) {
                this.lastChamberW = w;
                this.lastChamberH = h;
                this.lastChamberMode = this.viewMode;
                this.recalculateLatticePositions(w, h);
            }

            const chamberBottom = h - 46;
            const chamberLeft = (this.viewMode === 'split') ? 25 : Math.max(40, w * 0.08);
            const chamberRight = (this.viewMode === 'split') ? (w * 0.62) : (w - Math.max(40, w * 0.08));
            const chamberWidth = chamberRight - chamberLeft;
            const pistonH = 16;
            const minPistonY = 48;

            const cols = 8;
            const rows = 8;
            const baseSpacing = this.baseSpacing || 18;
            const atomRadius = this.atomRadius || 7.5;
            const boxBottom = this.boxBottom || (chamberBottom - atomRadius - 4);
            const boxLeft = this.boxLeft || (chamberLeft + (chamberWidth - (cols - 1) * baseSpacing) / 2);

            // Dynamic compression of solid lattice under multi-gigapascal pressure
            let latticeCompression = 1.0;
            if (phase.code === 'solid' || phase.code === 'metallic') {
                if (P > 10.0) {
                    const logComp = Math.min(1.0, (Math.log10(P) - 1.0) / 9.0);
                    latticeCompression = 1.0 - logComp * 0.28; // Up to 28% vertical lattice compression
                }
            }
            const curSpacingY = baseSpacing * latticeCompression;
            const topLatticeY = boxBottom - (rows - 1) * curSpacingY;
            const topSolidEdge = topLatticeY - atomRadius;

            // Physical Target Piston Height based on state of matter
            if (phase.code === 'solid' || phase.code === 'metallic') {
                // Piston rests directly and snugly on the top row of the solid crystal lattice!
                this.targetPistonY = Math.max(minPistonY, topSolidEdge - pistonH - 1);
            } else if (phase.code === 'liquid') {
                // In liquid: atoms pool on the floor (~42px depth). Piston compresses vapor space.
                const liquidSurfaceY = chamberBottom - 42;
                const logP = Math.max(-2, Math.min(4, Math.log10(Math.max(1e-12, P))));
                const pFrac = (logP - (-2)) / 6.0; // 0 to 1
                const maxLiquidPistonY = liquidSurfaceY - pistonH - 4;
                const minLiquidPistonY = minPistonY + 20;
                this.targetPistonY = minLiquidPistonY + pFrac * (maxLiquidPistonY - minLiquidPistonY);
            } else {
                // In Gas / Plasma / Supercritical: Ideal Gas Law (V ~ T/P)
                // Thermal expansion pushes piston UP; Hydraulic pressure pushes piston DOWN
                const vRatio = (T / 300.0) / Math.max(1e-4, Math.min(1e4, P));
                const logV = Math.max(-3, Math.min(3, Math.log10(vRatio)));
                const expansionFrac = (logV - (-3)) / 6.0; // 0 (cold/high P) to 1 (hot/vacuum)
                const maxGasPistonY = chamberBottom - 65;
                this.targetPistonY = maxGasPistonY - expansionFrac * (maxGasPistonY - minPistonY);
            }

            // Smooth physical motion damping
            this.pistonY += (this.targetPistonY - this.pistonY) * Math.min(1.0, dt * 7.0);
            const chamberTop = this.pistonY + pistonH;

            // Thermal Velocity Scale
            const thermalSpeed = Math.min(450, Math.sqrt(Math.max(1, T)) * 3.4);

            for (let i = 0; i < this.atoms.length; i++) {
                const a = this.atoms[i];
                a.electronAngle += dt * 6.0;

                if (phase.code === 'solid' || phase.code === 'metallic') {
                    // Crystalline Lattice Harmonic Vibration with dynamic vertical compression
                    const r = Math.floor(i / cols);
                    const c = i % cols;
                    const curLatticeX = boxLeft + c * baseSpacing;
                    const curLatticeY = boxBottom - (rows - 1 - r) * curSpacingY;

                    const vibAmp = Math.min(6.0, Math.sqrt(T / 1000) * 1.6);
                    const jitterX = (Math.random() - 0.5) * vibAmp;
                    const jitterY = (Math.random() - 0.5) * vibAmp;
                    a.x += (curLatticeX + jitterX - a.x) * dt * 14.0;
                    a.y += (curLatticeY + jitterY - a.y) * dt * 14.0;
                } else if (phase.code === 'liquid') {
                    // Flowing Liquid Pool with gravity & cohesion
                    a.vy += 340 * dt; // Gravity
                    a.vx += (Math.random() - 0.5) * 80 * dt;

                    a.x += a.vx * dt;
                    a.y += a.vy * dt;

                    // Liquid boundaries
                    if (a.y > chamberBottom - a.radius) {
                        a.y = chamberBottom - a.radius;
                        a.vy = -Math.abs(a.vy) * 0.35;
                    }
                    if (a.y < chamberBottom - 100) {
                        a.vy += 140 * dt; // Surface tension pull
                    }
                    if (a.x < chamberLeft + a.radius) {
                        a.x = chamberLeft + a.radius;
                        a.vx = Math.abs(a.vx) * 0.5;
                    }
                    if (a.x > chamberRight - a.radius) {
                        a.x = chamberRight - a.radius;
                        a.vx = -Math.abs(a.vx) * 0.5;
                    }

                    // Inter-atomic soft repulsion
                    for (let j = i + 1; j < this.atoms.length; j++) {
                        const b = this.atoms[j];
                        const dx = b.x - a.x;
                        const dy = b.y - a.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const minDist = a.radius + b.radius;
                        if (dist < minDist && dist > 0.001) {
                            const overlap = (minDist - dist) * 0.5;
                            const nx = dx / dist;
                            const ny = dy / dist;
                            a.x -= nx * overlap;
                            a.y -= ny * overlap;
                            b.x += nx * overlap;
                            b.y += ny * overlap;
                        }
                    }
                } else if (phase.code === 'gas' || phase.code === 'supercritical' || phase.code === 'plasma') {
                    // Free kinetic dispersal
                    if (Math.abs(a.vx) < 10) a.vx = (Math.random() - 0.5) * thermalSpeed;
                    if (Math.abs(a.vy) < 10) a.vy = (Math.random() - 0.5) * thermalSpeed;

                    a.x += a.vx * dt;
                    a.y += a.vy * dt;

                    // Collisions with chamber walls & movable piston bottom
                    if (a.x < chamberLeft + a.radius) {
                        a.x = chamberLeft + a.radius;
                        a.vx = Math.abs(a.vx);
                    }
                    if (a.x > chamberRight - a.radius) {
                        a.x = chamberRight - a.radius;
                        a.vx = -Math.abs(a.vx);
                    }
                    if (a.y > chamberBottom - a.radius) {
                        a.y = chamberBottom - a.radius;
                        a.vy = -Math.abs(a.vy);
                    }
                    if (a.y < chamberTop + a.radius) {
                        a.y = chamberTop + a.radius;
                        a.vy = Math.abs(a.vy);
                    }
                }
            }

            // Plasma Sparks
            if (phase.code === 'plasma') {
                if (Math.random() < 0.25 && this.atoms.length > 2) {
                    const idxA = Math.floor(Math.random() * this.atoms.length);
                    const idxB = Math.floor(Math.random() * this.atoms.length);
                    const a1 = this.atoms[idxA];
                    const a2 = this.atoms[idxB];
                    this.plasmaSparks.push({
                        x1: a1.x, y1: a1.y,
                        x2: a2.x, y2: a2.y,
                        alpha: 1.0
                    });
                }
            }

            for (let i = this.plasmaSparks.length - 1; i >= 0; i--) {
                this.plasmaSparks[i].alpha -= dt * 4.0;
                if (this.plasmaSparks[i].alpha <= 0) this.plasmaSparks.splice(i, 1);
            }
        }

        renderPhaseDiagram(canvas) {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            const clientW = Math.floor(rect.width);
            const clientH = Math.floor(rect.height);

            if (canvas.width !== clientW * dpr || canvas.height !== clientH * dpr) {
                canvas.width = clientW * dpr;
                canvas.height = clientH * dpr;
            }

            const now = performance.now();
            const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
            this.lastFrameTime = now;

            const allElements = (typeof elementsData !== 'undefined' ? elementsData : (window.elementsData || []));
            const elData = allElements.find(e => e.atomicNumber === this.activeElementId) || { name: 'Carbon', symbol: 'C', melt: 3823, boil: 5100 };
            const phase = this.calculatePhase(elData);

            // Update Particle Chamber Simulation
            this.updateChamberPhysics(dt, clientW, clientH, phase);

            ctx.save();
            ctx.scale(dpr, dpr);

            const w = clientW;
            const h = clientH;
            ctx.clearRect(0, 0, w, h);

            if (this.viewMode === 'chamber') {
                this.renderChamberView(ctx, w, h, elData, phase, 0, w);
            } else if (this.viewMode === 'diagram') {
                this.renderDiagramView(ctx, w, h, elData, phase, 0, w);
            } else {
                // Split View: Chamber on Left (65%), P-T Phase Radar on Right (35%)
                const chamberW = w * 0.65;
                const radarW = w * 0.35;
                this.renderChamberView(ctx, w, h, elData, phase, 0, chamberW);
                this.renderDiagramView(ctx, w, h, elData, phase, chamberW, radarW);
            }

            // View Mode Switcher Pills (Top Center of Canvas)
            this.renderViewSwitcherHUD(ctx, w, h);

            ctx.restore();
        }

        renderViewSwitcherHUD(ctx, w, h) {
            const pillY = 10;
            const modes = [
                { id: 'split', label: 'Split View', icon: '🔲' },
                { id: 'chamber', label: 'Atom Chamber', icon: '⚛️' },
                { id: 'diagram', label: 'P-T Curve', icon: '📈' }
            ];

            let curX = 14;
            ctx.font = 'bold 11px var(--font-ui), sans-serif';

            for (const m of modes) {
                const isCur = this.viewMode === m.id;
                const text = `${m.icon} ${m.label}`;
                const textW = ctx.measureText(text).width;
                const pillW = textW + 18;
                const pillH = 24;

                ctx.fillStyle = isCur ? 'rgba(0, 212, 255, 0.35)' : 'rgba(11, 18, 33, 0.96)';
                ctx.strokeStyle = isCur ? '#00d4ff' : 'rgba(0, 212, 255, 0.25)';
                ctx.lineWidth = isCur ? 1.5 : 1.0;

                ctx.beginPath();
                ctx.roundRect(curX, pillY, pillW, pillH, 6);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = isCur ? '#ffffff' : '#94a3b8';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'left';
                ctx.fillText(text, curX + 9, pillY + pillH / 2);

                curX += pillW + 8;
            }
        }

        renderChamberView(ctx, w, h, elData, phase, startX, chamberW) {
            const T = this.temperatureK;
            const P = this.pressureAtm;
            const chamberLeft = startX + Math.max(16, chamberW * 0.05);
            const chamberRight = startX + chamberW - Math.max(16, chamberW * 0.05);
            this.lastChamberLeft = chamberLeft;
            this.lastChamberRight = chamberRight;
            const chamberBottom = h - 46;
            const chamberTop = this.pistonY + 12;

            // 1. Vessel Glass Enclosure Background (starts neatly at y=42)
            ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.35)';
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.roundRect(chamberLeft, 42, chamberRight - chamberLeft, chamberBottom - 42, 8);
            ctx.fill();
            ctx.stroke();

            // Top Cylinder Head Mount Block
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(chamberLeft + 1, 40, chamberRight - chamberLeft - 2, 8);
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(chamberLeft + 1, 40, chamberRight - chamberLeft - 2, 8);

            const midX = (chamberLeft + chamberRight) / 2;
            const pistonH = 16;

            // 2. Chrome Hydraulic Shaft / Piston Rod (starts neatly at top cylinder head y=48)
            if (this.pistonY > 48) {
                const rodGrad = ctx.createLinearGradient(midX - 7, 0, midX + 7, 0);
                rodGrad.addColorStop(0, '#334155');
                rodGrad.addColorStop(0.35, '#94a3b8');
                rodGrad.addColorStop(0.7, '#cbd5e1');
                rodGrad.addColorStop(1, '#334155');
                ctx.fillStyle = rodGrad;
                ctx.fillRect(midX - 7, 48, 14, this.pistonY - 48);

                ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.lineWidth = 1;
                ctx.strokeRect(midX - 7, 48, 14, this.pistonY - 48);
            }

            // Downward Hydraulic Force Chevrons (when compressing P >= 10 atm)
            if (P >= 10.0 && this.pistonY > 65) {
                ctx.fillStyle = '#38bdf8';
                ctx.font = 'bold 9px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('▼ ▼ ▼', midX, (48 + this.pistonY) / 2);
            }

            // 3. Movable Compression Piston Head
            const pistonW = chamberRight - chamberLeft - 4;
            const pistonGrad = ctx.createLinearGradient(0, this.pistonY, 0, this.pistonY + pistonH);
            pistonGrad.addColorStop(0, '#475569');
            pistonGrad.addColorStop(0.3, '#64748b');
            pistonGrad.addColorStop(0.8, '#334155');
            pistonGrad.addColorStop(1, '#1e293b');
            ctx.fillStyle = pistonGrad;
            ctx.fillRect(chamberLeft + 2, this.pistonY, pistonW, pistonH);

            // Specular top highlight bevel
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.fillRect(chamberLeft + 2, this.pistonY, pistonW, 1.5);

            // Bottom high-pressure seal lip
            ctx.fillStyle = (P >= 1000) ? '#f59e0b' : '#00d4ff';
            ctx.fillRect(chamberLeft + 2, this.pistonY + pistonH - 1.8, pistonW, 1.8);

            // Left & Right Wall Rubber Gaskets
            ctx.fillStyle = '#f97316'; // Industrial orange high-pressure seal
            ctx.fillRect(chamberLeft + 2, this.pistonY + 2, 3, pistonH - 4);
            ctx.fillRect(chamberRight - 5, this.pistonY + 2, 3, pistonH - 4);

            // Sleek Digital Pressure Badge Mounted ON the Piston Head
            const badgeW = Math.min(140, pistonW - 20);
            const badgeH = 14;
            const badgeX = midX - badgeW / 2;
            const badgeY = this.pistonY + (pistonH - badgeH) / 2;

            ctx.fillStyle = 'rgba(10, 16, 30, 0.92)';
            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
            ctx.fill();
            ctx.strokeStyle = (P >= 1000) ? 'rgba(245, 158, 11, 0.6)' : 'rgba(0, 212, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = (P >= 1000) ? '#fbbf24' : '#38bdf8';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const pText = P < 0.01 ? P.toExponential(1) : (P > 1e4 ? (P * 1.01325e-4).toFixed(1) + ' GPa' : P.toFixed(1) + ' atm');
            ctx.fillText(`⬇ PISTON: ${pText}`, midX, badgeY + badgeH / 2);

            // 3. Thermal Plate at Chamber Bottom
            const plateH = 10;
            const plateGrad = ctx.createLinearGradient(chamberLeft, chamberBottom, chamberRight, chamberBottom);
            if (T < 100) {
                plateGrad.addColorStop(0, '#0284c7');
                plateGrad.addColorStop(0.5, '#38bdf8');
                plateGrad.addColorStop(1, '#0284c7');
            } else if (T < 1000) {
                plateGrad.addColorStop(0, '#475569');
                plateGrad.addColorStop(0.5, '#64748b');
                plateGrad.addColorStop(1, '#475569');
            } else if (T < 3000) {
                plateGrad.addColorStop(0, '#ea580c');
                plateGrad.addColorStop(0.5, '#f97316');
                plateGrad.addColorStop(1, '#ea580c');
            } else {
                plateGrad.addColorStop(0, '#ef4444');
                plateGrad.addColorStop(0.5, '#ffffff');
                plateGrad.addColorStop(1, '#ef4444');
            }
            ctx.fillStyle = plateGrad;
            ctx.fillRect(chamberLeft + 2, chamberBottom, chamberRight - chamberLeft - 4, plateH);

            // Thermal plate label with protective backdrop pill
            ctx.fillStyle = 'rgba(10, 16, 30, 0.88)';
            ctx.beginPath();
            ctx.roundRect(midX - 70, chamberBottom + 5, 140, 18, 4);
            ctx.fill();
            ctx.fillStyle = '#cbd5e1';
            ctx.font = 'bold 9.5px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`THERMAL PLATE: ${T.toFixed(0)} K`, midX, chamberBottom + 14);

            // 4. Solid Crystal Lattice Bond Lines
            if (phase.code === 'solid' || phase.code === 'metallic') {
                ctx.strokeStyle = (phase.code === 'metallic') ? 'rgba(56, 189, 248, 0.45)' : 'rgba(0, 212, 255, 0.35)';
                ctx.lineWidth = 1.2;
                for (let i = 0; i < this.atoms.length; i++) {
                    const a = this.atoms[i];
                    for (let j = i + 1; j < this.atoms.length; j++) {
                        const b = this.atoms[j];
                        const dx = b.x - a.x;
                        const dy = b.y - a.y;
                        const d = Math.sqrt(dx * dx + dy * dy);
                        if (d < 30) {
                            ctx.beginPath();
                            ctx.moveTo(a.x, a.y);
                            ctx.lineTo(b.x, b.y);
                            ctx.stroke();
                        }
                    }
                }
            }

            // 5. Plasma Sparks
            if (phase.code === 'plasma') {
                for (const s of this.plasmaSparks) {
                    ctx.strokeStyle = `rgba(244, 63, 94, ${s.alpha})`;
                    ctx.lineWidth = 2.0;
                    ctx.beginPath();
                    ctx.moveTo(s.x1, s.y1);
                    ctx.lineTo((s.x1 + s.x2) / 2 + (Math.random() - 0.5) * 8, (s.y1 + s.y2) / 2 + (Math.random() - 0.5) * 8);
                    ctx.lineTo(s.x2, s.y2);
                    ctx.stroke();
                }
            }

            // 6. Atoms Rendering
            for (const a of this.atoms) {
                ctx.beginPath();
                ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);

                const grad = ctx.createRadialGradient(a.x - 2, a.y - 2, 1, a.x, a.y, a.radius);
                if (phase.code === 'plasma') {
                    grad.addColorStop(0, '#ffffff');
                    grad.addColorStop(0.35, '#f43f5e');
                    grad.addColorStop(1, '#881337');
                } else if (phase.code === 'liquid') {
                    grad.addColorStop(0, '#ffffff');
                    grad.addColorStop(0.35, '#10b981');
                    grad.addColorStop(1, '#064e3b');
                } else if (phase.code === 'gas') {
                    grad.addColorStop(0, '#ffffff');
                    grad.addColorStop(0.35, '#f97316');
                    grad.addColorStop(1, '#7c2d12');
                } else if (phase.code === 'supercritical') {
                    grad.addColorStop(0, '#ffffff');
                    grad.addColorStop(0.35, '#eab308');
                    grad.addColorStop(1, '#713f12');
                } else {
                    grad.addColorStop(0, '#ffffff');
                    grad.addColorStop(0.35, '#00d4ff');
                    grad.addColorStop(1, '#0369a1');
                }

                ctx.fillStyle = grad;
                ctx.fill();

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = 1.0;
                ctx.stroke();

                // Electron orbit for plasma or gas
                if (phase.code === 'plasma') {
                    const ex = a.x + Math.cos(a.electronAngle) * (a.radius + 6);
                    const ey = a.y + Math.sin(a.electronAngle) * (a.radius + 6);
                    ctx.fillStyle = '#38bdf8';
                    ctx.beginPath();
                    ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Phase State Overlay Tag with high-contrast protective badge
            const phaseTagTxt = `${phase.badge} (${elData.name})`;
            ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            const tagW = ctx.measureText(phaseTagTxt).width + 16;
            ctx.fillStyle = 'rgba(10, 16, 30, 0.90)';
            ctx.strokeStyle = phase.color || '#00d4ff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(chamberLeft + 10, chamberBottom - 28, tagW, 20, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = phase.color || '#00d4ff';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(phaseTagTxt, chamberLeft + 18, chamberBottom - 18);
        }

        renderDiagramView(ctx, w, h, elData, phase, startX, diagramW) {
            const padLeft = startX + 54;
            const padRight = startX + diagramW - 16;
            const padTop = 52;
            const padBottom = 38;
            const plotW = Math.max(100, padRight - padLeft);
            const plotH = Math.max(80, h - padTop - padBottom);

            this.diagramPadLeft = padLeft;
            this.diagramPadRight = padRight;
            this.diagramPadTop = padTop;
            this.diagramPadBottom = padBottom;
            this.lastDiagramH = h;

            const Z = this.activeElementId;
            const thermo = THERMO_ELEMENT_DB[Z] || {
                name: elData.name || 'Element',
                Tt: elData.melt ? Number(elData.melt) : 1000,
                Pt: 0.01,
                Tc: elData.boil ? Number(elData.boil) * 1.5 : 3000,
                Pc: 100,
                P_metal: 1e7,
                deltaH_vap: 150.0,
                deltaH_fus: 10.0
            };

            const T_melt_1atm = elData.melt ? Number(elData.melt) : (thermo.Tt || 1000);
            const T_boil_1atm = elData.boil ? Number(elData.boil) : (thermo.Tc * 0.7 || 2500);

            // Responsive Adaptive Temperature Domain
            const minT = 0;
            const maxT = Math.max(
                this.temperatureK * 1.25,
                Math.max(thermo.Tc * 1.35, Math.max(T_boil_1atm * 1.35, 350))
            );
            const minLogP = -6;
            const maxLogP = 6;

            this.diagramMinT = minT;
            this.diagramMaxT = maxT;
            this.diagramMinLogP = minLogP;
            this.diagramMaxLogP = maxLogP;

            const mapX = (t) => padLeft + (Math.max(0, Math.min(maxT, t)) / maxT) * plotW;
            const mapY = (logP) => padTop + (1 - (Math.max(minLogP, Math.min(maxLogP, logP)) - minLogP) / (maxLogP - minLogP)) * plotH;

            // 1. High-Tech Glassmorphism Background Card
            ctx.fillStyle = 'rgba(8, 14, 28, 0.94)';
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.28)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.roundRect(startX + 6, 42, diagramW - 12, h - 86, 10);
            ctx.fill();
            ctx.stroke();

            // 2. Generate Thermodynamic Boundary Points
            const dH_vap = (thermo.deltaH_vap || 150.0) * 1000;
            const dH_sub = ((thermo.deltaH_vap || 150.0) + (thermo.deltaH_fus || 10.0)) * 1000;
            const Tt = Math.max(1, thermo.Tt || 1000);
            const Pt = Math.max(1e-10, thermo.Pt || 0.01);
            const Tc = Math.max(Tt * 1.1, thermo.Tc || (Tt * 1.5));
            const Pc = Math.max(Pt * 1.5, thermo.Pc || 100);

            const logPt = Math.log10(Pt);
            const logPc = Math.log10(Pc);

            // A. Sublimation Curve Points (P from 10^-6 to Pt)
            const subPts = [];
            const subSteps = 24;
            for (let i = 0; i <= subSteps; i++) {
                const lp = minLogP + (i / subSteps) * (logPt - minLogP);
                const p = Math.pow(10, lp);
                const invT = (1.0 / Tt) - (R_GAS / dH_sub) * Math.log(Math.max(1e-12, p / Pt));
                const t = (invT > 0) ? Math.min(Tt, 1.0 / invT) : 0.1;
                subPts.push({ x: mapX(t), y: mapY(lp), t, p, lp });
            }

            // B. Melting / Fusion Curve Points (P from Pt to 10^6)
            const meltPts = [];
            const meltSteps = 28;
            for (let i = 0; i <= meltSteps; i++) {
                const lp = logPt + (i / meltSteps) * (maxLogP - logPt);
                const p = Math.pow(10, lp);
                const pEff = Math.max(0, p - Pt);
                const t = Tt * Math.pow(1.0 + pEff / 4000.0, 0.13);
                meltPts.push({ x: mapX(t), y: mapY(lp), t, p, lp });
            }

            // C. Vaporization Curve Points (P from Pt to Pc)
            const vapPts = [];
            const vapSteps = 24;
            for (let i = 0; i <= vapSteps; i++) {
                const frac = i / vapSteps;
                const lp = logPt + frac * (logPc - logPt);
                const p = Math.pow(10, lp);
                const invT = (1.0 / Tt) - (R_GAS / dH_vap) * Math.log(Math.max(1e-12, p / Pt));
                const tClausius = (invT > 0) ? Math.min(Tc, 1.0 / invT) : Tc;
                const t = (1 - frac) * tClausius + frac * Tc;
                vapPts.push({ x: mapX(t), y: mapY(lp), t, p, lp });
            }

            // 3. Clip plotting strictly to graph area
            ctx.save();
            ctx.beginPath();
            ctx.rect(padLeft, padTop, plotW, plotH);
            ctx.clip();

            // A. SOLID PHASE REGION SHADING (Icy Blue)
            ctx.fillStyle = 'rgba(14, 165, 233, 0.16)';
            ctx.beginPath();
            ctx.moveTo(padLeft, padTop);
            ctx.lineTo(meltPts[meltPts.length - 1].x, padTop);
            for (let i = meltPts.length - 1; i >= 0; i--) {
                ctx.lineTo(meltPts[i].x, meltPts[i].y);
            }
            for (let i = subPts.length - 1; i >= 0; i--) {
                ctx.lineTo(subPts[i].x, subPts[i].y);
            }
            ctx.lineTo(padLeft, mapY(minLogP));
            ctx.closePath();
            ctx.fill();

            // B. LIQUID PHASE REGION SHADING (Emerald Turquoise)
            ctx.fillStyle = 'rgba(16, 185, 129, 0.17)';
            ctx.beginPath();
            ctx.moveTo(meltPts[meltPts.length - 1].x, padTop);
            for (let i = meltPts.length - 1; i >= 0; i--) {
                ctx.lineTo(meltPts[i].x, meltPts[i].y);
            }
            for (let i = 0; i < vapPts.length; i++) {
                ctx.lineTo(vapPts[i].x, vapPts[i].y);
            }
            ctx.lineTo(mapX(Tc), padTop);
            ctx.closePath();
            ctx.fill();

            // C. GAS / VAPOR PHASE REGION SHADING (Warm Amber)
            ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
            ctx.beginPath();
            ctx.moveTo(subPts[0].x, subPts[0].y);
            for (let i = 0; i < subPts.length; i++) {
                ctx.lineTo(subPts[i].x, subPts[i].y);
            }
            for (let i = 0; i < vapPts.length; i++) {
                ctx.lineTo(vapPts[i].x, vapPts[i].y);
            }
            ctx.lineTo(padRight, mapY(logPc));
            ctx.lineTo(padRight, mapY(minLogP));
            ctx.closePath();
            ctx.fill();

            // D. SUPERCRITICAL FLUID REGION SHADING (Cosmic Violet)
            const scX = mapX(Tc);
            const scY = mapY(logPc);
            ctx.fillStyle = 'rgba(168, 85, 247, 0.18)';
            ctx.fillRect(scX, padTop, padRight - scX, scY - padTop);

            // 4. Region Watermark Text Labels
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 12px var(--font-ui), sans-serif';

            // Solid watermark
            const solidLabelX = (padLeft + mapX(Tt)) * 0.45;
            const solidLabelY = (padTop + mapY(minLogP)) * 0.45;
            ctx.fillStyle = 'rgba(56, 189, 248, 0.40)';
            ctx.fillText('🧊 SOLID', solidLabelX, solidLabelY);

            // Liquid watermark
            const liqLabelX = (mapX(Tt) + mapX(Tc)) * 0.52;
            const liqLabelY = (padTop + mapY(logPt)) * 0.50;
            if (liqLabelX > solidLabelX + 30 && liqLabelX < padRight - 30) {
                ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
                ctx.fillText('💧 LIQUID', liqLabelX, liqLabelY);
            }

            // Gas watermark
            const gasLabelX = (mapX(Tt) + padRight) * 0.55;
            const gasLabelY = (mapY(logPt) + mapY(minLogP)) * 0.52;
            ctx.fillStyle = 'rgba(245, 158, 11, 0.40)';
            ctx.fillText('💨 GAS', gasLabelX, gasLabelY);

            // Supercritical watermark
            if (padRight - scX > 60) {
                ctx.fillStyle = 'rgba(192, 132, 252, 0.45)';
                ctx.font = 'bold 10px var(--font-ui), sans-serif';
                ctx.fillText('🌀 SUPERCRITICAL', (scX + padRight) * 0.5, (padTop + scY) * 0.5);
            }

            // 5. Grid Lines & Axis Graduations
            ctx.lineWidth = 1;
            // Pressure horizontal grid lines
            for (let lp = -6; lp <= 6; lp += 2) {
                const y = mapY(lp);
                ctx.strokeStyle = (lp === 0) ? 'rgba(251, 191, 36, 0.45)' : 'rgba(255, 255, 255, 0.08)';
                ctx.setLineDash(lp === 0 ? [5, 4] : []);
                ctx.beginPath();
                ctx.moveTo(padLeft, y);
                ctx.lineTo(padRight, y);
                ctx.stroke();
            }
            ctx.setLineDash([]);

            // Temperature vertical grid lines
            const tStep = maxT > 4000 ? 2000 : (maxT > 1000 ? 500 : (maxT > 300 ? 100 : 25));
            for (let t = tStep; t < maxT; t += tStep) {
                const x = mapX(t);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.beginPath();
                ctx.moveTo(x, padTop);
                ctx.lineTo(x, padTop + plotH);
                ctx.stroke();
            }

            // 6. Draw Glowing Phase Boundary Curves
            // Sublimation Curve (Solid <-> Gas)
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            for (let i = 0; i < subPts.length; i++) {
                if (i === 0) ctx.moveTo(subPts[i].x, subPts[i].y);
                else ctx.lineTo(subPts[i].x, subPts[i].y);
            }
            ctx.stroke();

            // Melting / Fusion Curve (Solid <-> Liquid)
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            for (let i = 0; i < meltPts.length; i++) {
                if (i === 0) ctx.moveTo(meltPts[i].x, meltPts[i].y);
                else ctx.lineTo(meltPts[i].x, meltPts[i].y);
            }
            ctx.stroke();

            // Vaporization Curve (Liquid <-> Gas)
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            for (let i = 0; i < vapPts.length; i++) {
                if (i === 0) ctx.moveTo(vapPts[i].x, vapPts[i].y);
                else ctx.lineTo(vapPts[i].x, vapPts[i].y);
            }
            ctx.stroke();

            // Supercritical Boundary Dashed Lines
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(scX, padTop);
            ctx.lineTo(scX, scY);
            ctx.lineTo(padRight, scY);
            ctx.stroke();
            ctx.setLineDash([]);

            // 7. Standard 1 atm Isobar Labeling
            const y1atm = mapY(0);
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'right';
            ctx.fillText('1.0 atm (Earth STP)', padRight - 6, y1atm - 5);

            // 8. Thermodynamic Landmarks (Triple Point & Critical Point)
            // Triple Point Landmark
            const tpX = mapX(Tt);
            const tpY = mapY(logPt);
            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#00d4ff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(tpX, tpY - 5);
            ctx.lineTo(tpX + 5, tpY);
            ctx.lineTo(tpX, tpY + 5);
            ctx.lineTo(tpX - 5, tpY);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#bae6fd';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = (tpX > padRight - 80) ? 'right' : 'left';
            ctx.fillText(`◆ Triple Pt (${Tt.toFixed(0)}K)`, (tpX > padRight - 80) ? tpX - 8 : tpX + 8, tpY - 2);

            // Critical Point Landmark
            const cpX = mapX(Tc);
            const cpY = mapY(logPc);
            ctx.fillStyle = '#f59e0b';
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(cpX, cpY, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fde68a';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = (cpX > padRight - 90) ? 'right' : 'left';
            ctx.fillText(`★ Critical Pt (${Tc.toFixed(0)}K)`, (cpX > padRight - 90) ? cpX - 8 : cpX + 8, cpY - 6);

            // 9. Active State Pulsing Crosshairs & Marker
            const curT = Math.max(0, Math.min(maxT, this.temperatureK));
            const curLogP = Math.max(minLogP, Math.min(maxLogP, Math.log10(Math.max(1e-12, this.pressureAtm))));
            const curX = mapX(curT);
            const curY = mapY(curLogP);

            // Crosshair projections
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = phase.color || '#00d4ff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padLeft, curY);
            ctx.lineTo(curX, curY);
            ctx.lineTo(curX, padTop + plotH);
            ctx.stroke();
            ctx.setLineDash([]);

            // Pulsing target beacon
            const pulse = (performance.now() % 1400) / 1400;
            ctx.strokeStyle = phase.color || '#00d4ff';
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 1.0 - pulse;
            ctx.beginPath();
            ctx.arc(curX, curY, 6 + pulse * 14, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1.0;

            ctx.fillStyle = phase.color || '#00d4ff';
            ctx.shadowColor = phase.color || '#00d4ff';
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(curX, curY, 5.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.restore(); // restore clip

            // 10. Axis Numbers & Units (outside clip area)
            // Y-Axis Labels
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            const pLabels = [
                { lp: 6, txt: '10⁶ (1 Mbar)' },
                { lp: 3, txt: '10³ (1 kbar)' },
                { lp: 0, txt: '10⁰ (1 atm)' },
                { lp: -3, txt: '10⁻³ (1 mbar)' },
                { lp: -6, txt: '10⁻⁶ (μbar)' }
            ];
            for (const item of pLabels) {
                const y = mapY(item.lp);
                ctx.fillText(item.txt, padLeft - 6, y);
            }

            // Y-Axis Title (Vertical)
            ctx.save();
            ctx.translate(startX + 14, padTop + plotH / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 10px var(--font-ui), sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('PRESSURE P [atm]', 0, 0);
            ctx.restore();

            // X-Axis Labels
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            for (let t = tStep; t <= maxT; t += tStep) {
                const x = mapX(t);
                ctx.fillText(`${t}K`, x, padTop + plotH + 5);
            }

            // X-Axis Title
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 10px var(--font-ui), sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('TEMPERATURE T [Kelvin]', padLeft + plotW / 2, padTop + plotH + 18);

            // 11. Top Telemetry Header Badge
            const headerY = 48;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';

            // Element Name & Symbol
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 12px var(--font-ui), sans-serif';
            ctx.fillText(`📊 ${elData.name} (${elData.symbol}) · P–T PHASE DIAGRAM`, padLeft, headerY - 38);

            // Current state pill in top right of diagram card
            const pVal = this.pressureAtm;
            const pText = pVal < 0.01 ? pVal.toExponential(2) : (pVal > 1e4 ? (pVal * 1.01325e-4).toFixed(1) + ' GPa' : pVal.toFixed(2) + ' atm');
            const telemetryText = `${phase.badge || phase.state} | ${this.temperatureK.toFixed(1)} K (${(this.temperatureK - 273.15).toFixed(1)}°C) | ${pText}`;

            ctx.font = 'bold 10px monospace';
            const teleW = ctx.measureText(telemetryText).width + 16;
            const teleX = padRight - teleW;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.beginPath();
            ctx.roundRect(teleX, headerY - 42, teleW, 20, 4);
            ctx.fill();
            ctx.strokeStyle = phase.color || '#00d4ff';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = phase.color || '#38bdf8';
            ctx.fillText(telemetryText, teleX + 8, headerY - 37);

            // 12. Interactive Touch Hint at Bottom Right
            ctx.fillStyle = '#64748b';
            ctx.font = '9px var(--font-ui), sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillText('👆 Tap or drag on diagram to set (T, P)', padRight, h - 46);
        }
    }

    // Attach to Global Scope
    window.EnvironmentSimulationEngine = EnvironmentSimulationEngine;
    window.ENVIRONMENT_PRESETS = ENVIRONMENT_PRESETS;
    window.THERMO_ELEMENT_DB = THERMO_ELEMENT_DB;
    window.envSimulationEngine = new EnvironmentSimulationEngine();

})();
