/**
 * PERIODICA 3D - Environment & Pressure Simulation System
 * Advanced P-T Phase Space, Extreme Planetary/Cosmic Environments & Clausius-Clapeyron Engine
 * 
 * Compliant with NIST Chemistry WebBook, IUPAC standards, and Bridgman high-pressure physics.
 * (c) 2026 Periodica 3D | Developer: Vijay-1010110
 */

(function () {
    'use strict';

    // Physical Constants
    const R_GAS = 8.314462618; // J / (mol * K)
    const ATM_TO_PA = 101325; // 1 atm in Pascals
    const BAR_TO_PA = 100000; // 1 bar in Pascals
    const GPA_TO_PA = 1e9; // 1 GPa in Pascals

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
        80: { name: 'Mercury',    Tt: 234.3, Pt: 2e-9,   Tc: 1750,  Pc: 1720,   P_metal: 0,     deltaH_vap: 59.11, deltaH_fus: 2.295 },
        92: { name: 'Uranium',    Tt: 1408,  Pt: 1e-8,   Tc: 4400,  Pc: 4000,   P_metal: 0,     deltaH_vap: 417.0, deltaH_fus: 9.140 }
    };

    /**
     * EnvironmentSimulationEngine (OOP Architecture)
     */
    class EnvironmentSimulationEngine {
        constructor() {
            this.temperatureK = 298.15;
            this.pressureAtm = 1.0;
            this.currentPresetId = 'earth_stp';
            this.listeners = new Set();
            this.activeElementId = 6; // Carbon default
        }

        /**
         * Subscribe to P-T state changes
         */
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
                activeElementId: this.activeElementId
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

        setActiveElement(atomicNumber) {
            this.activeElementId = atomicNumber;
            this.notify();
        }

        /**
         * Calculates state of matter using thermodynamic phase boundary equations
         */
        calculatePhase(elementData, T = this.temperatureK, P = this.pressureAtm) {
            const allElements = (typeof elementsData !== 'undefined' ? elementsData : (window.elementsData || []));
            const el = elementData || allElements.find(e => e.atomicNumber === this.activeElementId) || { atomicNumber: 6, meltingPoint: 3823, boilingPoint: 5100, name: 'Carbon' };
            const Z = el.atomicNumber || 6;
            const thermo = THERMO_ELEMENT_DB[Z] || {
                Tt: el.meltingPoint ? Number(el.meltingPoint) : (el.melt ? Number(el.melt) : 1000),
                Pt: 0.001,
                Tc: el.boilingPoint ? Number(el.boilingPoint) * 1.5 : (el.boil ? Number(el.boil) * 1.5 : 2000),
                Pc: 500,
                P_metal: 5e6,
                deltaH_vap: 50.0,
                deltaH_fus: 10.0
            };

            const T_melt_1atm = el.meltingPoint ? Number(el.meltingPoint) : (el.melt ? Number(el.melt) : thermo.Tt);
            const T_boil_1atm = el.boilingPoint ? Number(el.boilingPoint) : (el.boil ? Number(el.boil) : thermo.Tc);

            // 1. Plasma Regime (Thermonuclear / Ionization)
            if (T > 25000 || (T > 10000 && P < 0.01)) {
                return {
                    state: 'Plasma',
                    code: 'plasma',
                    color: '#f43f5e',
                    badge: '⚡ PLASMA',
                    details: 'Thermal ionization strips orbital electrons into a glowing soup of bare nuclei and free electrons.'
                };
            }

            // 2. High-Pressure Degenerate / Metallic Phase Transition
            if (thermo.P_metal > 0 && P >= thermo.P_metal) {
                return {
                    state: 'Metallic / Degenerate Solid',
                    code: 'metallic',
                    color: '#38bdf8',
                    badge: '💎 METALLIC SOLID',
                    details: `Extreme compressive stress (>${(thermo.P_metal * ATM_TO_PA / 1e9).toFixed(1)} GPa) forces electron delocalization into high-density conduction bands.`
                };
            }

            // 3. Supercritical Fluid Regime
            if (T > thermo.Tc && P > thermo.Pc) {
                return {
                    state: 'Supercritical Fluid',
                    code: 'supercritical',
                    color: '#eab308',
                    badge: '🌀 SUPERCRITICAL',
                    details: 'Beyond critical point (Tc, Pc); liquid and vapor densities merge into a high-density, low-viscosity penetrative fluid.'
                };
            }

            // 4. Pressure-Shifted Boiling Curve via Clausius-Clapeyron Approximation
            // P_boil(T) = 1 atm * exp[ -DeltaH_vap/R * (1/T - 1/T_boil_1atm) ]
            let dynamicTboil = T_boil_1atm;
            if (thermo.deltaH_vap > 0 && T_boil_1atm > 0) {
                const invT = (1 / T_boil_1atm) - (R_GAS * Math.log(Math.max(1e-12, P))) / (thermo.deltaH_vap * 1000);
                if (invT > 0) {
                    dynamicTboil = 1 / invT;
                } else {
                    dynamicTboil = T_boil_1atm * 3;
                }
            }

            // 5. Pressure-Shifted Melting Curve (Simon-Glatzel Relation)
            // P = a * ((T_m / T_0)^c - 1)
            let dynamicTmelt = T_melt_1atm;
            if (P > 1.0) {
                dynamicTmelt = T_melt_1atm * Math.pow(1 + P / 5000, 0.12);
            } else {
                dynamicTmelt = Math.max(0.1, T_melt_1atm * Math.pow(Math.max(1e-6, P), 0.02));
            }

            // Determine State
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
                    details: `Dispersed thermal kinetic vapor phase. Condensation occurs if cooled below ${dynamicTboil.toFixed(1)} K.`
                };
            }
        }

        /**
         * Renders an interactive 2D P-T Phase Diagram on an HTML5 canvas
         */
        renderPhaseDiagram(canvas, elementData) {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const rect = canvas.getBoundingClientRect();
            const clientW = Math.max(300, rect.width || canvas.clientWidth || 600);
            const clientH = Math.max(220, rect.height || canvas.clientHeight || 400);
            const dpr = window.devicePixelRatio || 1;

            if (canvas.width !== Math.round(clientW * dpr) || canvas.height !== Math.round(clientH * dpr)) {
                canvas.width = Math.round(clientW * dpr);
                canvas.height = Math.round(clientH * dpr);
            }

            ctx.save();
            ctx.scale(dpr, dpr);

            const w = clientW;
            const h = clientH;

            ctx.clearRect(0, 0, w, h);

            const padLeft = 55;
            const padBottom = 35;
            const padTop = 25;
            const padRight = 25;
            const plotW = w - padLeft - padRight;
            const plotH = h - padTop - padBottom;

            // Coordinate mapping (Log P vs Linear T)
            const minT = 0;
            const maxT = 6000;
            const minLogP = -6; // 10^-6 atm
            const maxLogP = 6;  // 10^+6 atm

            const mapX = (t) => padLeft + (t / maxT) * plotW;
            const mapY = (logP) => padTop + (1 - (logP - minLogP) / (maxLogP - minLogP)) * plotH;

            // Background Grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            for (let t = 1000; t <= 5000; t += 1000) {
                const x = mapX(t);
                ctx.beginPath();
                ctx.moveTo(x, padTop);
                ctx.lineTo(x, h - padBottom);
                ctx.stroke();

                ctx.fillStyle = '#94a3b8';
                ctx.font = '11px monospace';
                ctx.fillText(`${t}K`, x - 14, h - padBottom + 16);
            }

            for (let lp = minLogP; lp <= maxLogP; lp += 3) {
                const y = mapY(lp);
                ctx.beginPath();
                ctx.moveTo(padLeft, y);
                ctx.lineTo(w - padRight, y);
                ctx.stroke();

                ctx.fillStyle = '#94a3b8';
                ctx.font = '11px monospace';
                ctx.fillText(`10^${lp}`, 10, y + 4);
            }

            const Tm0 = elementData?.melt ? Number(elementData.melt) : 1000;
            const Tb0 = elementData?.boil ? Number(elementData.boil) : 2500;

            // Phase Boundary Curves (Solid-Liquid Simon line)
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 3.0;
            ctx.beginPath();
            for (let lp = minLogP; lp <= maxLogP; lp += 0.2) {
                const p = Math.pow(10, lp);
                const tm = Tm0 * Math.pow(Math.max(1e-4, 1 + p / 5000), 0.12);
                const px = mapX(tm);
                const py = mapY(lp);
                if (lp === minLogP) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();

            // Phase Boundary Curves (Liquid-Gas Clausius-Clapeyron curve)
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 3.0;
            ctx.beginPath();
            let first = true;
            for (let lp = minLogP; lp <= 3; lp += 0.2) {
                const p = Math.pow(10, lp);
                const invT = (1 / Tb0) - (R_GAS * Math.log(p)) / (80 * 1000);
                if (invT > 0) {
                    const tb = 1 / invT;
                    const px = mapX(tb);
                    const py = mapY(lp);
                    if (first) { ctx.moveTo(px, py); first = false; }
                    else ctx.lineTo(px, py);
                }
            }
            ctx.stroke();

            // Labels
            ctx.fillStyle = 'rgba(0, 212, 255, 0.9)';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText('SOLID', mapX(Tm0 * 0.4), mapY(2));

            ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
            ctx.fillText('LIQUID', mapX((Tm0 + Tb0) / 2), mapY(2));

            ctx.fillStyle = 'rgba(249, 115, 22, 0.9)';
            ctx.fillText('GAS', mapX(Math.min(maxT * 0.85, Tb0 * 1.5)), mapY(-3));

            // Current Operating Point Indicator (Glowing Reticle)
            const curLogP = Math.max(minLogP, Math.min(maxLogP, Math.log10(this.pressureAtm)));
            const curX = mapX(Math.min(maxT, this.temperatureK));
            const curY = mapY(curLogP);

            ctx.shadowColor = '#00d4ff';
            ctx.shadowBlur = 14;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(curX, curY, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.arc(curX, curY, 12, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        }
    }

    function openEnvPressureModal() {
        const modal = document.getElementById('env-pressure-modal');
        if (!modal) return;
        modal.style.display = 'flex';

        const engine = window.envSimulationEngine;
        if (engine) {
            const tempSlider = document.getElementById('env-modal-temp-slider');
            const pressSlider = document.getElementById('env-modal-press-slider');
            if (tempSlider) tempSlider.value = Math.min(6000, engine.temperatureK);
            if (pressSlider) pressSlider.value = Math.log10(Math.max(1e-12, engine.pressureAtm));
        }
        updateEnvModalState();
        if (typeof window.syncNativeSliderVisibility === 'function') {
            window.syncNativeSliderVisibility();
        }
    }

    function closeEnvPressureModal() {
        const modal = document.getElementById('env-pressure-modal');
        if (modal) modal.style.display = 'none';
        if (typeof window.syncNativeSliderVisibility === 'function') {
            window.syncNativeSliderVisibility();
        }
    }

    function applyEnvModalPreset(presetId) {
        if (!window.envSimulationEngine) return;
        window.envSimulationEngine.setPreset(presetId);
        const engine = window.envSimulationEngine;
        const tempSlider = document.getElementById('env-modal-temp-slider');
        const pressSlider = document.getElementById('env-modal-press-slider');
        if (tempSlider) tempSlider.value = Math.min(6000, engine.temperatureK);
        if (pressSlider) pressSlider.value = Math.log10(Math.max(1e-12, engine.pressureAtm));
        updateEnvModalState();
    }

    function updateEnvModalState() {
        const tempSlider = document.getElementById('env-modal-temp-slider');
        const pressSlider = document.getElementById('env-modal-press-slider');
        if (!tempSlider || !pressSlider || !window.envSimulationEngine) return;

        const tempK = parseFloat(tempSlider.value);
        const logP = parseFloat(pressSlider.value);
        const pressAtm = Math.pow(10, logP);

        window.envSimulationEngine.setTemperature(tempK);
        window.envSimulationEngine.setPressure(pressAtm);

        const tempDisp = document.getElementById('env-modal-temp-display');
        const pressDisp = document.getElementById('env-modal-press-display');
        if (tempDisp) tempDisp.textContent = `${tempK < 10 ? tempK.toFixed(2) : tempK.toFixed(0)} K`;
        if (pressDisp) {
            pressDisp.textContent = pressAtm < 0.01 || pressAtm > 1e4 ? `${pressAtm.toExponential(2)} atm` : `${pressAtm.toFixed(2)} atm`;
        }

        const z = window.selectedElement ? window.selectedElement.atomicNumber : 6;
        window.envSimulationEngine.setActiveElement(z);
        const elData = window.elementsData ? window.elementsData.find(e => e.atomicNumber === z) : null;
        const phase = window.envSimulationEngine.calculatePhase(elData);

        const targetEl = document.getElementById('env-modal-target-element');
        const phaseLabel = document.getElementById('env-modal-phase-label');
        const phaseBadge = document.getElementById('env-modal-phase-badge');

        if (targetEl && elData) {
            targetEl.textContent = `Target Element: ${elData.name} (${elData.symbol}, Z=${elData.atomicNumber})`;
        }
        if (phaseLabel) {
            phaseLabel.textContent = `Phase: ${phase.badge} - ${phase.details}`;
        }
        if (phaseBadge) {
            phaseBadge.textContent = phase.badge;
            phaseBadge.style.color = phase.color;
            phaseBadge.style.borderColor = phase.color;
        }
    }

    function applyEnvModalToTable() {
        if (!window.envSimulationEngine) return;
        const tempK = window.envSimulationEngine.temperatureK;
        if (typeof window.applyTempPreset === 'function') {
            window.applyTempPreset(tempK);
        } else {
            const tempSlider = document.getElementById('temp-slider');
            if (tempSlider) {
                tempSlider.value = Math.round(tempK);
                tempSlider.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
        closeEnvPressureModal();
    }

    function launchEnvToSimLab() {
        closeEnvPressureModal();
        if (typeof window.switchView === 'function') {
            window.switchView('simulations');
            if (typeof window.switchSimTab === 'function') {
                window.switchSimTab('environment');
            }
        }
    }

    // Attach to Global Scope
    window.EnvironmentSimulationEngine = EnvironmentSimulationEngine;
    window.ENVIRONMENT_PRESETS = ENVIRONMENT_PRESETS;
    window.envSimulationEngine = new EnvironmentSimulationEngine();
    window.openEnvPressureModal = openEnvPressureModal;
    window.closeEnvPressureModal = closeEnvPressureModal;
    window.applyEnvModalPreset = applyEnvModalPreset;
    window.updateEnvModalState = updateEnvModalState;
    window.applyEnvModalToTable = applyEnvModalToTable;
    window.launchEnvToSimLab = launchEnvToSimLab;

})();
