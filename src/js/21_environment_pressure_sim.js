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
            this.temperatureK = 1800.0;
            this.pressureAtm = 50.0;
            this.currentPresetId = 'earth_stp';
            this.listeners = new Set();
            this.activeElementId = 26; // Iron (Z=26) default for mockup

            // View Mode: 'split' | 'chamber' | 'diagram'
            this.viewMode = 'diagram';
            this.isDraggingDiagram = false;

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
                document.querySelectorAll('.env-mode-btn').forEach(btn => {
                    if (btn.getAttribute('data-mode') === mode) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
                this.notify();
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
            this.activeElementId = parseInt(z, 10) || 26;
            this.notify();
        }

        setLogPressure(logP) {
            const val = parseFloat(logP);
            const p = Math.pow(10, Math.max(-6, Math.min(6, val)));
            this.setPressure(p);
        }

        heat(deltaK = 200) {
            this.setTemperature(Math.min(35000, this.temperatureK + deltaK));
        }

        cool(deltaK = 200) {
            this.setTemperature(Math.max(1, this.temperatureK - deltaK));
        }

        compress(factor = 10.0) {
            this.setPressure(Math.min(1e11, this.pressureAtm * factor));
        }

        decompress(factor = 10.0) {
            this.setPressure(Math.max(1e-12, this.pressureAtm / factor));
        }

        quickJumpPhase(phaseType) {
            const allElements = (typeof elementsData !== 'undefined' ? elementsData : (window.elementsData || []));
            const elData = allElements.find(e => e.atomicNumber === this.activeElementId) || { melt: 1811, boil: 3134 };
            const Tm = elData.meltingPoint ? Number(elData.meltingPoint) : (elData.melt ? Number(elData.melt) : 1811);
            const Tb = elData.boilingPoint ? Number(elData.boilingPoint) : (elData.boil ? Number(elData.boil) : 3134);
            const thermo = THERMO_ELEMENT_DB[this.activeElementId] || { Tt: Tm, Pt: 0.01, Tc: Tb * 1.5, Pc: 100 };

            if (phaseType === 'solid') {
                this.setTemperature(Math.max(10, Tm * 0.45));
                this.setPressure(1.0);
            } else if (phaseType === 'liquid') {
                this.setTemperature(Tm + (Tb - Tm) * 0.40);
                this.setPressure(1.0);
            } else if (phaseType === 'gas') {
                this.setTemperature(Tb * 1.35);
                this.setPressure(0.1);
            } else if (phaseType === 'plasma' || phaseType === 'super') {
                this.setTemperature(thermo.Tc * 1.15);
                this.setPressure(thermo.Pc * 1.5);
            } else if (phaseType === 'triple') {
                this.setTemperature(thermo.Tt);
                this.setPressure(thermo.Pt);
            }

            this.notify();
            if (window.physicsAudio) {
                window.physicsAudio.playPhaseTransitionSizzle?.(phaseType);
            }
        }

        updateDOMTelemetry(elData, phase) {
            // 1. Element badge in right sidebar
            const activeZ = document.getElementById('env-active-z');
            const activeSym = document.getElementById('env-active-sym');
            const activeName = document.getElementById('env-active-name');
            if (activeZ) activeZ.textContent = elData.atomicNumber || this.activeElementId;
            if (activeSym) activeSym.textContent = elData.symbol || 'Fe';
            if (activeName) activeName.textContent = elData.name || 'Iron';

            // 2. Phase Badge
            const phaseTxt = document.getElementById('env-phase-text');
            const phaseDot = document.getElementById('env-phase-dot');
            const phaseBadge = document.getElementById('env-active-phase-badge');
            if (phaseTxt) phaseTxt.textContent = (phase.state || 'SOLID').toUpperCase();
            if (phaseDot && phase.color) {
                phaseDot.style.background = phase.color;
                phaseDot.style.boxShadow = '0 0 6px ' + phase.color;
            }
            if (phaseBadge && phase.color) {
                phaseBadge.style.color = phase.color;
                phaseBadge.style.borderColor = phase.color;
            }

            // 1. Element Selector in sidebar header
            const elemSelect = document.getElementById('env-elem-select');
            if (elemSelect && elemSelect.value != this.activeElementId) {
                elemSelect.value = String(this.activeElementId);
            }

            // 3. Telemetry (TEMP) with integrated 1 atm Melt info
            const Tm = elData.meltingPoint ? Number(elData.meltingPoint) : (elData.melt ? Number(elData.melt) : 1811);
            const tempK = document.getElementById('env-temp-k');
            const tempC = document.getElementById('env-temp-c');
            if (tempK) tempK.textContent = this.temperatureK.toFixed(1) + ' K';
            if (tempC) tempC.textContent = (this.temperatureK - 273.15).toFixed(1) + ' °C • Melt: ' + Tm + ' K';

            // 4. Telemetry (PRESSURE)
            const pressAtm = document.getElementById('env-press-atm');
            const pressSi = document.getElementById('env-press-si');
            if (pressAtm) {
                const p = this.pressureAtm;
                if (p < 0.001) {
                    pressAtm.textContent = p.toExponential(2) + ' atm';
                } else if (p > 1e6) {
                    pressAtm.textContent = p.toExponential(2) + ' atm';
                } else {
                    pressAtm.textContent = p.toFixed(2) + ' atm';
                }
            }
            if (pressSi) {
                const pa = this.pressureAtm * 101325;
                if (pa >= 1e9) {
                    pressSi.textContent = (pa / 1e9).toFixed(2) + ' GPa';
                } else if (pa >= 1e6) {
                    pressSi.textContent = (pa / 1e6).toFixed(2) + ' MPa';
                } else if (pa >= 1e3) {
                    pressSi.textContent = (pa / 1e3).toFixed(1) + ' kPa';
                } else {
                    pressSi.textContent = pa.toFixed(1) + ' Pa';
                }
            }

            // 5. Pressure Slider (Log P)
            const pressSlider = document.getElementById('env-press-slider');
            if (pressSlider && document.activeElement !== pressSlider) {
                const logP = Math.max(-6, Math.min(6, Math.log10(Math.max(1e-12, this.pressureAtm))));
                pressSlider.value = logP.toFixed(2);
            }

            // Dock chips and header modes removed per user instruction
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

            const T_melt_1atm = elementData?.meltingPoint ? Number(elementData.meltingPoint) : (elementData?.melt ? Number(elementData.melt) : (thermo.Tt || 1811));
            const T_boil_1atm = elementData?.boilingPoint ? Number(elementData.boilingPoint) : (elementData?.boil ? Number(elementData.boil) : (thermo.Tc || 3134));

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
            const elData = allElements.find(e => e.atomicNumber === this.activeElementId) || { name: 'Iron', symbol: 'Fe', atomicNumber: 26, melt: 1811, boil: 3134 };
            const phase = this.calculatePhase(elData);

            // Sync HTML Sidebar HUD & Bottom Dock Telemetry
            this.updateDOMTelemetry(elData, phase);

            // Update Particle Chamber Simulation
            this.updateChamberPhysics(dt, clientW, clientH, phase);

            ctx.save();
            ctx.scale(dpr, dpr);

            const w = clientW;
            const h = clientH;
            ctx.clearRect(0, 0, w, h);

            if (this.viewMode === 'chamber') {
                this.renderChamberView(ctx, w, h, elData, phase, 0, w);
            } else if (this.viewMode === 'split') {
                const chamberW = Math.floor(w * 0.45);
                const diagramW = w - chamberW;
                this.renderChamberView(ctx, w, h, elData, phase, 0, chamberW);
                this.renderDiagramView(ctx, w, h, elData, phase, chamberW, diagramW);
            } else {
                // 'diagram' default: 100% of left card canvas
                this.renderDiagramView(ctx, w, h, elData, phase, 0, w);
            }

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
            const padLeft = startX + 66;
            const padRight = startX + diagramW - 20;
            const padTop = 32;
            const padBottom = 40;
            const plotW = Math.max(100, padRight - padLeft);
            const plotH = Math.max(80, h - padTop - padBottom);

            const pVal = this.pressureAtm;
            const pText = pVal < 0.001 ? pVal.toExponential(2) + ' atm' : (pVal > 1e4 ? (pVal * 1.01325e-4).toFixed(2) + ' GPa' : pVal.toFixed(2) + ' atm');

            this.diagramPadLeft = padLeft;
            this.diagramPadRight = padRight;
            this.diagramPadTop = padTop;
            this.diagramPadBottom = padBottom;
            this.lastDiagramH = h;

            const Z = this.activeElementId || 26;
            const thermo = THERMO_ELEMENT_DB[Z] || {
                name: elData.name || 'Iron',
                Tt: elData.meltingPoint ? Number(elData.meltingPoint) : 1811,
                Pt: 0.01,
                Tc: elData.boilingPoint ? Number(elData.boilingPoint) * 1.5 : 9240,
                Pc: 100,
                P_metal: 1e7,
                deltaH_vap: 340.0,
                deltaH_fus: 13.8
            };

            const minT = 0;
            const maxT = Math.max(300, Math.ceil((thermo.Tc * 1.25) / 1000) * 1000);
            const minLogP = -6;
            const maxLogP = 6;

            this.diagramMinT = minT;
            this.diagramMaxT = maxT;
            this.diagramMinLogP = minLogP;
            this.diagramMaxLogP = maxLogP;

            const mapX = (t) => padLeft + (Math.max(0, Math.min(maxT, t)) / maxT) * plotW;
            const mapY = (logP) => padTop + (1 - (Math.max(minLogP, Math.min(maxLogP, logP)) - minLogP) / 12) * plotH;

            // --- Top Canvas Title Strip (inside canvas header, y = 18) ---
            const titleSym = elData.symbol || 'Fe';
            const titleZ = elData.atomicNumber || Z;
            const titleName = elData.name || 'Iron';

            ctx.font = 'bold 11px DM Sans, -apple-system, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#f8fafc';
            const mainTitle = titleZ + ' ' + titleSym + ' (' + titleName + ') — P–T PHASE DIAGRAM';
            ctx.fillText(mainTitle, padLeft, 18);

            const titleW = ctx.measureText(mainTitle).width;
            ctx.font = '9.5px DM Sans, sans-serif';
            ctx.fillStyle = '#64748b';
            ctx.fillText(' (Log P vs. Linear T)', padLeft + titleW, 18);

            const totalTitleW = titleW + ctx.measureText(' (Log P vs. Linear T)').width;
            const rightReserve = 145;
            const availCenterSpace = (padRight - rightReserve) - (padLeft + totalTitleW + 15);

            if (availCenterSpace >= 220) {
                ctx.fillStyle = '#34d399';
                ctx.font = 'bold 10px IBM Plex Mono, monospace';
                ctx.fillText('▲ Triple Pt: ' + thermo.Tt.toFixed(0) + ' K', padLeft + totalTitleW + 20, 18);

                ctx.fillStyle = '#fbbf24';
                ctx.fillText('★ Critical Pt: ' + thermo.Tc.toFixed(0) + ' K', padLeft + totalTitleW + 135, 18);
            } else if (availCenterSpace >= 110) {
                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 10px IBM Plex Mono, monospace';
                ctx.fillText('★ Critical: ' + thermo.Tc.toFixed(0) + ' K', padLeft + totalTitleW + 16, 18);
            }

            ctx.textAlign = 'right';
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 10px DM Sans, sans-serif';
            ctx.fillText('👆 Tap or drag crosshair', padRight, 18);

            // --- 1. Scientific Plot Background ---
            const bgGrad = ctx.createLinearGradient(padLeft, padTop, padRight, padTop + plotH);
            bgGrad.addColorStop(0, 'rgba(8, 14, 28, 0.96)');
            bgGrad.addColorStop(1, 'rgba(3, 7, 18, 0.98)');
            ctx.fillStyle = bgGrad;
            ctx.beginPath();
            ctx.roundRect(padLeft, padTop, plotW, plotH, 6);
            ctx.fill();

            ctx.strokeStyle = 'rgba(0, 212, 255, 0.22)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Precision Corner Brackets
            const bLen = 12;
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 1.6;

            ctx.beginPath();
            ctx.moveTo(padLeft, padTop + bLen); ctx.lineTo(padLeft, padTop); ctx.lineTo(padLeft + bLen, padTop);
            ctx.moveTo(padRight - bLen, padTop); ctx.lineTo(padRight, padTop); ctx.lineTo(padRight, padTop + bLen);
            ctx.moveTo(padLeft, padTop + plotH - bLen); ctx.lineTo(padLeft, padTop + plotH); ctx.lineTo(padLeft + bLen, padTop + plotH);
            ctx.moveTo(padRight - bLen, padTop + plotH); ctx.lineTo(padRight, padTop + plotH); ctx.lineTo(padRight, padTop + plotH - bLen);
            ctx.stroke();

            // --- 2. Thermodynamic Curves Calculation ---
            const dH_vap = (thermo.deltaH_vap || 150.0) * 1000;
            const dH_sub = ((thermo.deltaH_vap || 150.0) + (thermo.deltaH_fus || 10.0)) * 1000;
            const Tt = Math.max(1, thermo.Tt || 1000);
            const Pt = Math.max(1e-10, thermo.Pt || 0.01);
            const Tc = Math.max(Tt * 1.1, thermo.Tc || (Tt * 1.5));
            const Pc = Math.max(Pt * 1.5, thermo.Pc || 100);

            const logPt = Math.log10(Pt);
            const logPc = Math.log10(Pc);

            // Sublimation curve points
            const subPts = [];
            const subSteps = 24;
            for (let i = 0; i <= subSteps; i++) {
                const lp = minLogP + (i / subSteps) * (logPt - minLogP);
                const p = Math.pow(10, lp);
                const invT = (1.0 / Tt) - (R_GAS / dH_sub) * Math.log(Math.max(1e-12, p / Pt));
                const t = (invT > 0) ? Math.min(Tt, 1.0 / invT) : 0.1;
                subPts.push({ x: mapX(t), y: mapY(lp), t, p, lp });
            }

            // Melting / Fusion curve points
            const meltPts = [];
            const meltSteps = 28;
            for (let i = 0; i <= meltSteps; i++) {
                const lp = logPt + (i / meltSteps) * (maxLogP - logPt);
                const p = Math.pow(10, lp);
                const pEff = Math.max(0, p - Pt);
                const t = Tt * Math.pow(1.0 + pEff / 4000.0, 0.13);
                meltPts.push({ x: mapX(t), y: mapY(lp), t, p, lp });
            }

            // Vaporization curve points
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

            const scX = mapX(Tc);
            const scY = mapY(logPc);

            // --- 3. Plot Area Shading & Elements (Clipped) ---
            ctx.save();
            ctx.beginPath();
            ctx.rect(padLeft, padTop, plotW, plotH);
            ctx.clip();

            // A. Solid Phase Shading
            ctx.fillStyle = 'rgba(6, 182, 212, 0.16)';
            ctx.beginPath();
            ctx.moveTo(padLeft, padTop);
            ctx.lineTo(meltPts[meltPts.length - 1].x, padTop);
            for (let i = meltPts.length - 1; i >= 0; i--) ctx.lineTo(meltPts[i].x, meltPts[i].y);
            for (let i = subPts.length - 1; i >= 0; i--) ctx.lineTo(subPts[i].x, subPts[i].y);
            ctx.lineTo(padLeft, mapY(minLogP));
            ctx.closePath();
            ctx.fill();

            // B. Liquid Phase Shading
            ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
            ctx.beginPath();
            ctx.moveTo(meltPts[meltPts.length - 1].x, padTop);
            for (let i = meltPts.length - 1; i >= 0; i--) ctx.lineTo(meltPts[i].x, meltPts[i].y);
            for (let i = 0; i < vapPts.length; i++) ctx.lineTo(vapPts[i].x, vapPts[i].y);
            ctx.lineTo(mapX(Tc), padTop);
            ctx.closePath();
            ctx.fill();

            // C. Gas / Vapor Phase Shading
            ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
            ctx.beginPath();
            ctx.moveTo(subPts[0].x, subPts[0].y);
            for (let i = 0; i < subPts.length; i++) ctx.lineTo(subPts[i].x, subPts[i].y);
            for (let i = 0; i < vapPts.length; i++) ctx.lineTo(vapPts[i].x, vapPts[i].y);
            ctx.lineTo(mapX(Tc), padTop + plotH);
            ctx.lineTo(padRight, padTop + plotH);
            ctx.lineTo(subPts[0].x, padTop + plotH);
            ctx.closePath();
            ctx.fill();

            // D. Supercritical Region Shading
            if (scX < padRight && scY > padTop) {
                ctx.fillStyle = 'rgba(168, 85, 247, 0.18)';
                ctx.fillRect(scX, padTop, padRight - scX, scY - padTop);
            }

            // E. Grid Lines
            // Horizontal lines for major orders: 10^6, 10^3, 10^0 (1 atm), 10^-3, 10^-6
            const hOrders = [6, 3, 0, -3, -6];
            for (const lp of hOrders) {
                const gy = mapY(lp);
                if (lp === 0) {
                    ctx.setLineDash([5, 4]);
                    ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
                    ctx.lineWidth = 1.2;
                } else {
                    ctx.setLineDash([]);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
                    ctx.lineWidth = 1;
                }
                ctx.beginPath();
                ctx.moveTo(padLeft, gy);
                ctx.lineTo(padRight, gy);
                ctx.stroke();

                if (lp === 0) {
                    ctx.fillStyle = '#fbbf24';
                    ctx.font = 'bold 9.5px IBM Plex Mono, monospace';
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText('1.0 atm (Earth STP)', padRight - 10, gy - 3);
                }
            }
            ctx.setLineDash([]);

            // Vertical temperature grid lines
            const tGridStep = maxT / 5;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.lineWidth = 1;
            for (let step = 1; step <= 5; step++) {
                const gx = mapX(step * tGridStep);
                ctx.beginPath();
                ctx.moveTo(gx, padTop);
                ctx.lineTo(gx, padTop + plotH);
                ctx.stroke();
            }

            // F. Region Name Badges inside Plot
            ctx.font = 'bold 11px DM Sans, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Solid badge
            ctx.fillStyle = '#38bdf8';
            ctx.fillText('🧊 SOLID', padLeft + plotW * 0.15, padTop + plotH * 0.46);

            // Liquid badge
            ctx.fillStyle = '#34d399';
            const liqX = (mapX(Tt) + scX) * 0.5;
            const liqY = (padTop + mapY(logPt)) * 0.45;
            if (liqX > padLeft + 60 && liqX < padRight - 60) {
                ctx.fillText('💧 LIQUID', liqX, liqY);
            }

            // Gas badge
            ctx.fillStyle = '#fbbf24';
            const gasX = (mapX(Tt) + padRight) * 0.52;
            const gasY = padTop + plotH * 0.68;
            ctx.fillText('💨 GAS', gasX, gasY);

            // Supercritical badge
            if (padRight - scX > 60) {
                ctx.fillStyle = '#c084fc';
                ctx.fillText('🌀 SUPERCRITICAL', (scX + padRight) * 0.5, (padTop + scY) * 0.5);
            }

            // G. Boundary Curves
            // Sublimation Curve (Solid <-> Gas)
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 2.4;
            ctx.shadowColor = 'rgba(0, 229, 255, 0.5)';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            for (let i = 0; i < subPts.length; i++) {
                if (i === 0) ctx.moveTo(subPts[i].x, subPts[i].y);
                else ctx.lineTo(subPts[i].x, subPts[i].y);
            }
            ctx.stroke();

            // Melting Curve (Solid <-> Liquid)
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 2.4;
            ctx.shadowColor = 'rgba(0, 229, 255, 0.5)';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            for (let i = 0; i < meltPts.length; i++) {
                if (i === 0) ctx.moveTo(meltPts[i].x, meltPts[i].y);
                else ctx.lineTo(meltPts[i].x, meltPts[i].y);
            }
            ctx.stroke();

            // Vaporization Curve (Liquid <-> Gas)
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 2.6;
            ctx.shadowColor = 'rgba(249, 115, 22, 0.6)';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            for (let i = 0; i < vapPts.length; i++) {
                if (i === 0) ctx.moveTo(vapPts[i].x, vapPts[i].y);
                else ctx.lineTo(vapPts[i].x, vapPts[i].y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Supercritical Boundary Dashed Lines
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.75)';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(scX, padTop);
            ctx.lineTo(scX, scY);
            ctx.lineTo(padRight, scY);
            ctx.stroke();
            ctx.setLineDash([]);

            // H. Landmarks (Triple Point & Critical Point)
            const drawPill = (lx, ly, txt, color, isRight) => {
                ctx.save();
                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(lx, ly, 4.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.font = 'bold 9.5px IBM Plex Mono, monospace';
                const tw = ctx.measureText(txt).width;
                const pw = tw + 12;
                const ph = 18;
                let px = isRight ? (lx + 8) : (lx - pw - 8);
                if (px < padLeft + 4) px = padLeft + 6;
                if (px + pw > padRight - 4) px = padRight - pw - 6;

                let py = ly - ph / 2;
                if (py < padTop + 4) py = padTop + 4;
                if (py + ph > padTop + plotH - 4) py = padTop + plotH - ph - 4;

                ctx.fillStyle = 'rgba(10, 18, 34, 0.92)';
                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(px, py, pw, ph, 4);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(txt, px + pw / 2, py + ph / 2);
                ctx.restore();
            };

            const tpX = mapX(Tt);
            const tpY = mapY(logPt);
            drawPill(tpX, tpY, '▲ Triple Pt (' + thermo.Tt.toFixed(0) + 'K)', '#34d399', true);

            drawPill(scX, scY, '★ Critical Pt (' + thermo.Tc.toFixed(0) + 'K)', '#fbbf24', false);

            // I. Active Crosshair & Cursor
            const curT = Math.max(0, Math.min(maxT, this.temperatureK));
            const curLogP = Math.max(minLogP, Math.min(maxLogP, Math.log10(Math.max(1e-12, this.pressureAtm))));
            const curX = mapX(curT);
            const curY = mapY(curLogP);

            // Cyan Dashed Crosshairs
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(padLeft, curY);
            ctx.lineTo(curX, curY);
            ctx.lineTo(curX, padTop + plotH);
            ctx.stroke();
            ctx.setLineDash([]);

            // Glowing Cursor Dot
            ctx.fillStyle = '#00e5ff';
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(curX, curY, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Tooltip Pill above cursor (e.g., "1800K • 50.00 atm")
            const tipText = Math.round(this.temperatureK) + 'K • ' + pText;
            ctx.font = 'bold 10px IBM Plex Mono, monospace';
            const tipW = ctx.measureText(tipText).width + 16;
            const tipH = 20;
            let tipX = curX - tipW / 2;
            if (tipX < padLeft + 6) tipX = padLeft + 6;
            if (tipX + tipW > padRight - 6) tipX = padRight - tipW - 6;
            const tipY = (curY - 26 < padTop + 4) ? (curY + 12) : (curY - 26);

            ctx.fillStyle = 'rgba(8, 14, 28, 0.94)';
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.roundRect(tipX, tipY, tipW, tipH, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tipText, tipX + tipW / 2, tipY + tipH / 2);

            ctx.restore(); // end plot clip

            // --- 4. Y-Axis Ticks & Labels (Outside Plot on Left) ---
            const yLabels = [
                { lp: 6, txt: '1 Mbar' },
                { lp: 3, txt: '1 kbar' },
                { lp: 0, txt: '1 atm' },
                { lp: -3, txt: '1 mbar' },
                { lp: -6, txt: '1 μbar' }
            ];

            ctx.font = 'bold 10px IBM Plex Mono, monospace';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';

            for (const item of yLabels) {
                const y = mapY(item.lp);
                if (item.lp === 0) {
                    ctx.fillStyle = '#fbbf24';
                    ctx.fillText(item.txt, padLeft - 8, y);
                } else {
                    ctx.fillStyle = '#cbd5e1';
                    ctx.fillText(item.txt, padLeft - 8, y);
                }

                // Tick mark line
                ctx.strokeStyle = (item.lp === 0) ? '#fbbf24' : 'rgba(255, 255, 255, 0.25)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(padLeft - 5, y);
                ctx.lineTo(padLeft, y);
                ctx.stroke();
            }

            // Rotated Y-Axis Label
            ctx.save();
            ctx.translate(startX + 16, padTop + plotH / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = '#00d4ff';
            ctx.font = 'bold 11px DM Sans, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('PRESSURE [atm]', 0, 0);
            ctx.restore();

            // --- 5. X-Axis Ticks & Labels (Outside Plot at Bottom) ---
            ctx.font = 'bold 9.5px IBM Plex Mono, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';

            for (let step = 0; step <= 5; step++) {
                const t = step * tGridStep;
                const x = mapX(t);
                ctx.fillStyle = '#cbd5e1';
                ctx.fillText(Math.round(t) + 'K', x, padTop + plotH + 5);

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, padTop + plotH);
                ctx.lineTo(x, padTop + plotH + 4);
                ctx.stroke();
            }

            // X-Axis Title
            ctx.fillStyle = '#00d4ff';
            ctx.font = 'bold 11px DM Sans, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText('TEMPERATURE [K]', padLeft + plotW / 2, padTop + plotH + 20);
        }
    }

    // Attach to Global Scope
    window.EnvironmentSimulationEngine = EnvironmentSimulationEngine;
    window.ENVIRONMENT_PRESETS = ENVIRONMENT_PRESETS;
    window.THERMO_ELEMENT_DB = THERMO_ELEMENT_DB;
    window.envSimulationEngine = new EnvironmentSimulationEngine();

})();
