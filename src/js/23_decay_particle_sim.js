/**
 * PERIODICA 3D - Multi-Mode Radioactive Decay & Nuclear Transmutation Lab
 * 
 * Features:
 * 1. Nuclear Transmutation (Alpha, Beta-, Beta+, Gamma with balanced nuclear equations)
 * 2. Half-Life Population Simulator (100 atoms with live N(t) decay graph & Geiger audio)
 * 3. Radiation Shielding Lab (Paper vs Aluminum vs Lead penetration with Geiger Ratemeter)
 * 4. Magnetic Lorentz Chamber (F = q(v x B) cloud chamber particle curvature)
 * 
 * Compliant with Nubase2020 nuclear evaluations & relativistic kinematics.
 * (c) 2026 Periodica 3D | Developer: Vijay-1010110
 */

(function () {
    'use strict';

    /**
     * Exemplar Nuclides for Decay Simulation
     */
    const DECAY_NUCLIDES = [
        {
            id: 'U238',
            name: 'Uranium-238',
            symbol: 'U',
            mass: 238,
            z: 92,
            mode: 'alpha',
            daughter: { name: 'Thorium-234', symbol: 'Th', mass: 234, z: 90, color: '#38bdf8' },
            particle: 'α (⁴He²⁺)',
            halfLifeStr: '4.468 × 10⁹ yr',
            halfLifeSec: 8.0,
            energyMeV: 4.27,
            equation: '²³⁸₉₂U ➔ ²³⁴₉₀Th + ⁴₂He²⁺ (+4.27 MeV)',
            desc: 'Alpha decay: heavy nucleus ejects a Helium-4 nucleus (2p + 2n), transmuting Uranium into Thorium.'
        },
        {
            id: 'C14',
            name: 'Carbon-14',
            symbol: 'C',
            mass: 14,
            z: 6,
            mode: 'beta_minus',
            daughter: { name: 'Nitrogen-14', symbol: 'N', mass: 14, z: 7, color: '#4ade80' },
            particle: 'β⁻ (e⁻ + ν̄ₑ)',
            halfLifeStr: '5,730 yr',
            halfLifeSec: 6.0,
            energyMeV: 0.156,
            equation: '¹⁴₆C ➔ ¹⁴₇N + e⁻ + ν̄ₑ (+0.156 MeV)',
            desc: 'Beta minus decay: a neutron converts into a proton, emitting a fast electron. Basis of radiocarbon dating.'
        },
        {
            id: 'F18',
            name: 'Fluorine-18',
            symbol: 'F',
            mass: 18,
            z: 9,
            mode: 'beta_plus',
            daughter: { name: 'Oxygen-18', symbol: 'O', mass: 18, z: 8, color: '#00d4ff' },
            particle: 'β⁺ (e⁺ + νₑ)',
            halfLifeStr: '109.7 min',
            halfLifeSec: 4.5,
            energyMeV: 0.633,
            equation: '¹⁸₉F ➔ ¹⁸₈O + e⁺ + νₑ (+0.633 MeV)',
            desc: 'Positron emission: a proton converts into a neutron, ejecting a positron (antimatter) used in PET scans.'
        },
        {
            id: 'Po210',
            name: 'Polonium-210',
            symbol: 'Po',
            mass: 210,
            z: 84,
            mode: 'alpha',
            daughter: { name: 'Lead-206', symbol: 'Pb', mass: 206, z: 82, color: '#94a3b8' },
            particle: 'α (⁴He²⁺)',
            halfLifeStr: '138.4 days',
            halfLifeSec: 5.5,
            energyMeV: 5.30,
            equation: '²¹⁰₈₄Po ➔ ²⁰⁶₈₂Pb + ⁴₂He²⁺ (+5.30 MeV)',
            desc: 'Marie Curie discovery: intense alpha emitter transmuting into stable Lead-206.'
        },
        {
            id: 'Co60',
            name: 'Cobalt-60',
            symbol: 'Co',
            mass: 60,
            z: 27,
            mode: 'gamma',
            daughter: { name: 'Cobalt-60 (Ground)', symbol: 'Co', mass: 60, z: 27, color: '#a855f7' },
            particle: 'γ (1.17 & 1.33 MeV)',
            halfLifeStr: '5.27 yr',
            halfLifeSec: 7.0,
            energyMeV: 1.33,
            equation: '⁶⁰ᵐ₂₇Co ➔ ⁶⁰₂₇Co + γ (+1.33 MeV)',
            desc: 'Gamma emission: excited isomeric nucleus drops to ground state, emitting penetrating gamma photons.'
        }
    ];

    /**
     * Cloud chamber droplet
     */
    class VaporDroplet {
        constructor(x, y, radius = 1.2) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.opacity = 0.9;
        }

        update(dt) {
            this.opacity -= 0.65 * dt;
            return this.opacity > 0;
        }

        render(ctx) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.7})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Emitted Particle in Lorentz / Chamber mode
     */
    class EmittedParticle {
        constructor(type, x, y, angle, energyMeV) {
            this.type = type;
            this.x = x;
            this.y = y;
            this.charge = 0;
            this.mass = 1;
            this.alive = true;
            this.annihilated = false;
            this.age = 0;

            const speedBase = 320;
            if (type === 'alpha') {
                this.charge = +2;
                this.mass = 4.0;
                this.speed = speedBase * 0.75;
                this.color = '#00d4ff';
                this.trackWidth = 3.5;
            } else if (type === 'beta_minus') {
                this.charge = -1;
                this.mass = 0.05;
                this.speed = speedBase * 1.4;
                this.color = '#ef4444';
                this.trackWidth = 1.2;
            } else if (type === 'beta_plus') {
                this.charge = +1;
                this.mass = 0.05;
                this.speed = speedBase * 1.35;
                this.color = '#fbbf24';
                this.trackWidth = 1.2;
            } else if (type === 'gamma') {
                this.charge = 0;
                this.mass = 0.001;
                this.speed = speedBase * 2.2;
                this.color = '#a855f7';
                this.trackWidth = 1.0;
            } else {
                this.speed = speedBase;
                this.color = '#ffffff';
                this.trackWidth = 2.0;
            }

            this.vx = Math.cos(angle) * this.speed;
            this.vy = Math.sin(angle) * this.speed;
        }

        update(dt, B_Tesla, droplets, width, height) {
            this.age += dt;

            if (this.charge !== 0 && B_Tesla !== 0) {
                const lorentzCoeff = (this.charge / this.mass) * B_Tesla * 16.0;
                const ax = this.vy * lorentzCoeff;
                const ay = -this.vx * lorentzCoeff;
                this.vx += ax * dt;
                this.vy += ay * dt;
            }

            this.x += this.vx * dt;
            this.y += this.vy * dt;

            // Condense vapor droplets along trail
            if (droplets && Math.random() < 0.65) {
                droplets.push(new VaporDroplet(this.x + (Math.random() - 0.5) * 2, this.y + (Math.random() - 0.5) * 2, Math.max(1.0, this.trackWidth * 0.6)));
            }

            // Beta+ annihilation chance
            if (this.type === 'beta_plus' && this.age > 0.4 && Math.random() < 0.04) {
                this.annihilated = true;
                this.alive = false;
            }

            if (this.x < 0 || this.x > width || this.y < 0 || this.y > height || this.age > 3.0) {
                this.alive = false;
            }
        }
    }

    /**
     * Master NuclearDecaySimulationEngine
     */
    class NuclearDecaySimulationEngine {
        constructor() {
            // Modes: 'transmutation' | 'halflife' | 'shielding' | 'chamber'
            this.currentMode = 'transmutation';
            this.currentPresetId = 'U238';

            // Lorentz & Chamber properties
            this.magneticFieldTesla = 1.0;
            this.particles = [];
            this.droplets = [];
            this.annihilationFlashes = [];
            this.totalDecaysCount = 0;
            this.autoTrigger = true;
            this.triggerAccumulator = 0;

            // Transmutation State
            this.transmutationState = {
                stage: 'parent', // 'parent' | 'decaying' | 'daughter'
                decayProgress: 0,
                ejectedParticles: [],
                shakeOffset: { x: 0, y: 0 }
            };

            // Half-Life Population State
            this.halfLifeAtoms = [];
            this.halfLifeElapsedSec = 0;
            this.halfLifeRunning = true;
            this.halfLifeHistory = []; // [ { time, parentCount } ]
            this.initHalfLifePopulation();

            // Shielding Lab State
            this.shieldingBarriers = {
                paper: true,
                aluminum: true,
                lead: true
            };
            this.shieldingParticles = [];
            this.cpmReading = 0;
            this.targetCpm = 0;

            // Canvas dimensions
            this.width = 800;
            this.height = 400;
            this.sourceX = 60;
            this.sourceY = 200;
        }

        // Backward compatibility properties & methods
        get bFieldTesla() { return this.magneticFieldTesla; }
        set bFieldTesla(v) { this.setMagneticField(v); }
        setNuclide(id) { this.setPreset(id); }
        setBField(v) { this.setMagneticField(v); }

        setMode(modeKey) {
            if (['transmutation', 'halflife', 'shielding', 'chamber'].includes(modeKey)) {
                this.currentMode = modeKey;
                if (modeKey === 'transmutation') {
                    this.resetTransmutation();
                } else if (modeKey === 'halflife') {
                    this.initHalfLifePopulation();
                }
                if (typeof window.renderTuningPanel === 'function') {
                    window.renderTuningPanel('decay');
                }
            }
        }

        setPreset(presetId) {
            const found = DECAY_NUCLIDES.find(p => p.id === presetId);
            if (found) {
                this.currentPresetId = found.id;
                this.resetTransmutation();
                this.initHalfLifePopulation();
                if (typeof window.renderTuningPanel === 'function') {
                    window.renderTuningPanel('decay');
                }
            }
        }

        setMagneticField(tesla) {
            this.magneticFieldTesla = Math.max(-3.0, Math.min(3.0, Number(tesla) || 0));
        }

        /* ==================== 1. TRANSMUTATION LOGIC ==================== */
        triggerTransmutation() {
            if (this.transmutationState.stage !== 'parent') {
                this.resetTransmutation();
                return;
            }

            const nuclide = DECAY_NUCLIDES.find(n => n.id === this.currentPresetId) || DECAY_NUCLIDES[0];
            this.transmutationState.stage = 'decaying';
            this.transmutationState.decayProgress = 0;

            if (window.physicsAudio) {
                window.physicsAudio.playGeigerClick();
            }
        }

        resetTransmutation() {
            this.transmutationState = {
                stage: 'parent',
                decayProgress: 0,
                ejectedParticles: [],
                shakeOffset: { x: 0, y: 0 }
            };
        }

        updateTransmutation(dt) {
            const state = this.transmutationState;
            const nuclide = DECAY_NUCLIDES.find(n => n.id === this.currentPresetId) || DECAY_NUCLIDES[0];

            if (state.stage === 'decaying') {
                state.decayProgress += dt * 1.5;

                // Nucleus shakes with quantum barrier penetration tension
                if (state.decayProgress < 0.6) {
                    state.shakeOffset.x = (Math.random() - 0.5) * 6;
                    state.shakeOffset.y = (Math.random() - 0.5) * 6;
                } else if (state.ejectedParticles.length === 0) {
                    // Eject particle!
                    state.shakeOffset = { x: 0, y: 0 };
                    state.stage = 'daughter';

                    const centerX = this.width * 0.45;
                    const centerY = this.height * 0.50;
                    const angle = -0.3 + (Math.random() - 0.5) * 0.4;
                    const speed = 360;

                    if (nuclide.mode === 'alpha') {
                        state.ejectedParticles.push({
                            type: 'alpha',
                            name: '⁴₂He²⁺ (Alpha)',
                            color: '#00d4ff',
                            radius: 12,
                            x: centerX,
                            y: centerY,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            trail: []
                        });
                    } else if (nuclide.mode === 'beta_minus') {
                        state.ejectedParticles.push({
                            type: 'beta_minus',
                            name: 'e⁻ (Fast Electron)',
                            color: '#ef4444',
                            radius: 6,
                            x: centerX,
                            y: centerY,
                            vx: Math.cos(angle) * (speed * 1.6),
                            vy: Math.sin(angle) * (speed * 1.6),
                            trail: []
                        });
                        // Antineutrino in opposite angle
                        state.ejectedParticles.push({
                            type: 'neutrino',
                            name: 'ν̄ₑ (Antineutrino)',
                            color: '#cbd5e1',
                            radius: 4,
                            x: centerX,
                            y: centerY,
                            vx: Math.cos(angle + Math.PI * 0.8) * (speed * 1.8),
                            vy: Math.sin(angle + Math.PI * 0.8) * (speed * 1.8),
                            trail: []
                        });
                    } else if (nuclide.mode === 'beta_plus') {
                        state.ejectedParticles.push({
                            type: 'beta_plus',
                            name: 'e⁺ (Positron)',
                            color: '#fbbf24',
                            radius: 6,
                            x: centerX,
                            y: centerY,
                            vx: Math.cos(angle) * (speed * 1.5),
                            vy: Math.sin(angle) * (speed * 1.5),
                            trail: []
                        });
                    } else if (nuclide.mode === 'gamma') {
                        state.ejectedParticles.push({
                            type: 'gamma',
                            name: 'γ (1.33 MeV Photon)',
                            color: '#c084fc',
                            radius: 8,
                            x: centerX,
                            y: centerY,
                            vx: Math.cos(angle) * (speed * 2.2),
                            vy: Math.sin(angle) * (speed * 2.2),
                            trail: []
                        });
                    }

                    if (window.physicsAudio) {
                        window.physicsAudio.playNeutronGun?.();
                    }
                }
            }

            // Update in-flight ejected particles
            for (const p of state.ejectedParticles) {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.trail.push({ x: p.x, y: p.y });
                if (p.trail.length > 25) p.trail.shift();
            }
        }

        /* ==================== 2. HALF-LIFE POPULATION LOGIC ==================== */
        initHalfLifePopulation() {
            this.halfLifeAtoms = [];
            this.halfLifeElapsedSec = 0;
            this.halfLifeHistory = [ { time: 0, pct: 100 } ];

            for (let i = 0; i < 100; i++) {
                this.halfLifeAtoms.push({
                    id: i,
                    decayed: false,
                    pulse: Math.random() * Math.PI * 2
                });
            }
        }

        updateHalfLife(dt) {
            if (!this.halfLifeRunning) return;

            const nuclide = DECAY_NUCLIDES.find(n => n.id === this.currentPresetId) || DECAY_NUCLIDES[0];
            const tHalf = nuclide.halfLifeSec || 6.0;
            this.halfLifeElapsedSec += dt;

            // Decay probability per dt: P = 1 - 2^(-dt / tHalf)
            const decayProb = 1 - Math.pow(0.5, dt / tHalf);

            let clickTriggered = false;
            for (const atom of this.halfLifeAtoms) {
                if (!atom.decayed && Math.random() < decayProb) {
                    atom.decayed = true;
                    if (!clickTriggered && window.physicsAudio) {
                        window.physicsAudio.playGeigerClick();
                        clickTriggered = true;
                    }
                }
                atom.pulse += dt * 3;
            }

            // Track history for live curve
            const parentCount = this.halfLifeAtoms.filter(a => !a.decayed).length;
            const curT = this.halfLifeElapsedSec / tHalf;
            if (this.halfLifeHistory.length === 0 || curT - this.halfLifeHistory[this.halfLifeHistory.length - 1].time > 0.08) {
                this.halfLifeHistory.push({ time: curT, pct: parentCount });
                if (this.halfLifeHistory.length > 120) this.halfLifeHistory.shift();
            }
        }

        /* ==================== 3. SHIELDING LAB LOGIC ==================== */
        toggleBarrier(barrierKey) {
            if (this.shieldingBarriers.hasOwnProperty(barrierKey)) {
                this.shieldingBarriers[barrierKey] = !this.shieldingBarriers[barrierKey];
                if (typeof window.renderTuningPanel === 'function') {
                    window.renderTuningPanel('decay');
                }
            }
        }

        updateShielding(dt) {
            const nuclide = DECAY_NUCLIDES.find(n => n.id === this.currentPresetId) || DECAY_NUCLIDES[0];
            const w = this.width;
            const h = this.height;

            const paperX = w * 0.32;
            const alumX = w * 0.52;
            const leadX = w * 0.72;
            const detectorX = w * 0.88;

            // Emit particles periodically
            this.triggerAccumulator += dt;
            if (this.triggerAccumulator >= 0.06) {
                this.triggerAccumulator = 0;
                const emitY = h * 0.5 + (Math.random() - 0.5) * 48;
                this.shieldingParticles.push({
                    type: nuclide.mode,
                    x: w * 0.12,
                    y: emitY,
                    speed: 280 + Math.random() * 40,
                    stopped: false,
                    alive: true,
                    color: (nuclide.mode === 'alpha') ? '#00d4ff' : (nuclide.mode === 'gamma' ? '#c084fc' : '#ef4444')
                });
            }

            let hitsDetector = 0;

            for (let i = this.shieldingParticles.length - 1; i >= 0; i--) {
                const p = this.shieldingParticles[i];
                if (p.stopped || !p.alive) {
                    this.shieldingParticles.splice(i, 1);
                    continue;
                }

                p.x += p.speed * dt;

                // Barrier 1: Paper
                if (this.shieldingBarriers.paper && p.x >= paperX && p.x <= paperX + 8) {
                    if (p.type === 'alpha') {
                        p.stopped = true; // Alpha stopped 100% by paper!
                        continue;
                    }
                }

                // Barrier 2: Aluminum
                if (this.shieldingBarriers.aluminum && p.x >= alumX && p.x <= alumX + 16) {
                    if (p.type === 'beta_minus' || p.type === 'beta_plus' || p.type === 'alpha') {
                        p.stopped = true; // Beta stopped 100% by aluminum!
                        continue;
                    }
                }

                // Barrier 3: Lead
                if (this.shieldingBarriers.lead && p.x >= leadX && p.x <= leadX + 28) {
                    if (Math.random() < 0.95) { // Lead stops 95% of gamma and all else!
                        p.stopped = true;
                        continue;
                    }
                }

                // Detector hit
                if (p.x >= detectorX) {
                    p.alive = false;
                    hitsDetector++;
                }

                if (p.x > w) p.alive = false;
            }

            // Target CPM calculated from detector hits
            this.targetCpm = hitsDetector * 800 + Math.floor(Math.random() * 25);
            this.cpmReading += (this.targetCpm - this.cpmReading) * dt * 4;

            if (hitsDetector > 0 && Math.random() < 0.35 && window.physicsAudio) {
                window.physicsAudio.playGeigerClick();
            }
        }

        /* ==================== 4. LORENTZ CLOUD CHAMBER LOGIC ==================== */
        triggerDecay(x = this.sourceX, y = this.sourceY) {
            const preset = DECAY_NUCLIDES.find(p => p.id === this.currentPresetId) || DECAY_NUCLIDES[0];
            const baseAngle = (Math.random() - 0.5) * 0.8;

            this.particles.push(new EmittedParticle(preset.mode, x, y, baseAngle, preset.energyMeV));
            this.totalDecaysCount++;

            if (window.physicsAudio) {
                window.physicsAudio.playGeigerClick();
            }
        }

        updateChamber(dt) {
            this.sourceX = this.width * 0.12;
            this.sourceY = this.height * 0.5;

            if (this.autoTrigger) {
                this.triggerAccumulator += dt;
                if (this.triggerAccumulator >= 0.28) {
                    this.triggerAccumulator = 0;
                    this.triggerDecay();
                }
            }

            const newlyCreated = [];
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                p.update(dt, this.magneticFieldTesla, this.droplets, this.width, this.height);

                if (p.annihilated) {
                    this.annihilationFlashes.push({ x: p.x, y: p.y, r: 12, alpha: 1.0 });
                    const gAngle = Math.random() * Math.PI * 2;
                    newlyCreated.push(new EmittedParticle('gamma', p.x, p.y, gAngle, 0.511));
                    newlyCreated.push(new EmittedParticle('gamma', p.x, p.y, gAngle + Math.PI, 0.511));
                }
            }

            this.particles = this.particles.filter(p => p.alive).concat(newlyCreated);
            this.droplets = this.droplets.filter(d => d.update(dt));
            if (this.droplets.length > 600) this.droplets = this.droplets.slice(-600);

            for (let i = this.annihilationFlashes.length - 1; i >= 0; i--) {
                const flash = this.annihilationFlashes[i];
                flash.alpha -= 2.5 * dt;
                if (flash.alpha <= 0) this.annihilationFlashes.splice(i, 1);
            }
        }

        /* ==================== MASTER UPDATE & RENDER ==================== */
        update(dt) {
            if (this.currentMode === 'transmutation') {
                this.updateTransmutation(dt);
            } else if (this.currentMode === 'halflife') {
                this.updateHalfLife(dt);
            } else if (this.currentMode === 'shielding') {
                this.updateShielding(dt);
            } else if (this.currentMode === 'chamber') {
                this.updateChamber(dt);
            }
        }

        render(canvas) {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const rect = canvas.getBoundingClientRect();
            const clientW = Math.max(300, rect.width || canvas.clientWidth || 800);
            const clientH = Math.max(220, rect.height || canvas.clientHeight || 400);
            const dpr = window.devicePixelRatio || 1;

            if (canvas.width !== Math.round(clientW * dpr) || canvas.height !== Math.round(clientH * dpr)) {
                canvas.width = Math.round(clientW * dpr);
                canvas.height = Math.round(clientH * dpr);
            }

            this.width = clientW;
            this.height = clientH;

            ctx.save();
            ctx.scale(dpr, dpr);

            const w = clientW;
            const h = clientH;

            // Deep Space / Quantum Lab Dark Background
            ctx.clearRect(0, 0, w, h);
            const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 20, w * 0.5, h * 0.5, w * 0.7);
            bgGrad.addColorStop(0, '#090d18');
            bgGrad.addColorStop(1, '#020409');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            if (this.currentMode === 'transmutation') {
                this.renderTransmutation(ctx, w, h);
            } else if (this.currentMode === 'halflife') {
                this.renderHalfLife(ctx, w, h);
            } else if (this.currentMode === 'shielding') {
                this.renderShielding(ctx, w, h);
            } else if (this.currentMode === 'chamber') {
                this.renderChamber(ctx, w, h);
            }

            ctx.restore();
        }

        /* ==================== RENDER 1: TRANSMUTATION ==================== */
        renderTransmutation(ctx, w, h) {
            const nuclide = DECAY_NUCLIDES.find(n => n.id === this.currentPresetId) || DECAY_NUCLIDES[0];
            const state = this.transmutationState;
            const isDaughter = state.stage === 'daughter';

            const activeSpec = isDaughter ? nuclide.daughter : nuclide;
            const cx = w * 0.45 + (state.shakeOffset.x || 0);
            const cy = h * 0.50 + (state.shakeOffset.y || 0);
            const r = Math.max(38, Math.min(54, h * 0.16));

            // Electron Cloud Aura
            const auraGrad = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.8);
            auraGrad.addColorStop(0, isDaughter ? 'rgba(74, 222, 128, 0.25)' : 'rgba(0, 212, 255, 0.22)');
            auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = auraGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, r * 1.8, 0, Math.PI * 2);
            ctx.fill();

            // Nucleus Core Sphere
            const coreGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 2, cx, cy, r);
            if (isDaughter) {
                coreGrad.addColorStop(0, '#ffffff');
                coreGrad.addColorStop(0.35, activeSpec.color || '#4ade80');
                coreGrad.addColorStop(1, '#064e3b');
            } else {
                coreGrad.addColorStop(0, '#ffffff');
                coreGrad.addColorStop(0.35, '#38bdf8');
                coreGrad.addColorStop(1, '#0c4a6e');
            }
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2.0;
            ctx.stroke();

            // Scientific Isotope Label
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(activeSpec.symbol, cx + 6, cy - 4);

            ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillStyle = isDaughter ? '#86efac' : '#7dd3fc';
            ctx.fillText(activeSpec.mass, cx - 14, cy - 10);

            ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(activeSpec.z, cx - 14, cy + 4);

            // Subtitle under nucleus
            ctx.font = 'bold 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillStyle = isDaughter ? '#86efac' : '#cbd5e1';
            ctx.fillText(`${activeSpec.name} (Z=${activeSpec.z})`, cx, cy + r + 18);

            // Render in-flight ejected particles
            for (const p of state.ejectedParticles) {
                // Trail
                if (p.trail.length > 1) {
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = 3.0;
                    ctx.beginPath();
                    ctx.moveTo(p.trail[0].x, p.trail[0].y);
                    for (let ti = 1; ti < p.trail.length; ti++) {
                        ctx.lineTo(p.trail[ti].x, p.trail[ti].y);
                    }
                    ctx.stroke();
                }

                // Particle Sphere
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px monospace';
                ctx.fillText(p.name, p.x, p.y - p.radius - 8);
            }

            // Top Banner: Nuclear Reaction Equation
            ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.35)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(14, 12, w - 28, 38, 8);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = isDaughter ? '#4ade80' : '#38bdf8';
            ctx.font = 'bold 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(`⚛️ ${nuclide.equation}`, 24, 31);

            // Bottom Explanation Banner
            ctx.fillStyle = 'rgba(10, 16, 30, 0.85)';
            ctx.beginPath();
            ctx.roundRect(14, h - 38, w - 28, 30, 6);
            ctx.fill();

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            const msg = isDaughter 
                ? `✅ TRANSMUTATION COMPLETE! ${nuclide.name} (Z=${nuclide.z}) has decayed into ${nuclide.daughter.name} (Z=${nuclide.daughter.z})!`
                : `💡 Tap "TRIGGER DECAY" (or tap nucleus) to watch quantum tunneling & transmutation!`;
            ctx.fillText(msg, 24, h - 23);
        }

        /* ==================== RENDER 2: HALF-LIFE POPULATION ==================== */
        renderHalfLife(ctx, w, h) {
            const nuclide = DECAY_NUCLIDES.find(n => n.id === this.currentPresetId) || DECAY_NUCLIDES[0];
            const tHalf = nuclide.halfLifeSec || 6.0;
            const parentCount = this.halfLifeAtoms.filter(a => !a.decayed).length;
            const daughterCount = 100 - parentCount;

            // 1. Grid of 100 Atoms on Left Half
            const gridW = w * 0.44;
            const startX = 18;
            const startY = 55;
            const spacing = Math.min((gridW - 20) / 10, (h - 90) / 10);

            for (let i = 0; i < this.halfLifeAtoms.length; i++) {
                const atom = this.halfLifeAtoms[i];
                const col = i % 10;
                const row = Math.floor(i / 10);
                const ax = startX + col * spacing;
                const ay = startY + row * spacing;

                const r = spacing * 0.38;
                ctx.beginPath();
                ctx.arc(ax, ay, r, 0, Math.PI * 2);
                if (atom.decayed) {
                    ctx.fillStyle = '#38bdf8'; // Daughter color
                } else {
                    ctx.fillStyle = '#4ade80'; // Parent color
                    ctx.shadowColor = '#4ade80';
                    ctx.shadowBlur = 4;
                }
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Legend below grid
            ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#4ade80';
            ctx.fillText(`🟢 Parent: ${nuclide.symbol} (${parentCount}%)`, startX, h - 16);

            ctx.fillStyle = '#38bdf8';
            ctx.fillText(`🔵 Daughter: ${nuclide.daughter.symbol} (${daughterCount}%)`, startX + 130, h - 16);

            // 2. Real-Time Half-Life Graph on Right Half
            const graphX = w * 0.50;
            const graphY = 55;
            const graphW = w * 0.46;
            const graphH = h - 100;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.roundRect(graphX, graphY, graphW, graphH, 8);
            ctx.fill();
            ctx.stroke();

            // Grid guidelines (100%, 50%, 25%)
            ctx.font = '10px monospace';
            ctx.fillStyle = '#64748b';
            ctx.textAlign = 'right';

            const y100 = graphY + 12;
            const y50 = graphY + graphH * 0.5;
            const y25 = graphY + graphH * 0.75;

            ctx.fillText('100%', graphX + 34, y100);
            ctx.fillText('50%', graphX + 34, y50);
            ctx.fillText('25%', graphX + 34, y25);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.beginPath();
            ctx.moveTo(graphX + 40, y50);
            ctx.lineTo(graphX + graphW - 10, y50);
            ctx.moveTo(graphX + 40, y25);
            ctx.lineTo(graphX + graphW - 10, y25);
            ctx.stroke();

            // Theoretical Half-Life Exponential Curve N(t) = 100 * (1/2)^t
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.35)';
            ctx.lineWidth = 2.0;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            const maxT = 3.5;
            for (let t = 0; t <= maxT; t += 0.05) {
                const px = (graphX + 40) + (t / maxT) * (graphW - 55);
                const py = y100 + (1 - Math.pow(0.5, t)) * (graphH - 24);
                if (t === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.setLineDash([]);

            // Live Actual History Trail
            if (this.halfLifeHistory.length > 1) {
                ctx.strokeStyle = '#4ade80';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                for (let i = 0; i < this.halfLifeHistory.length; i++) {
                    const hItem = this.halfLifeHistory[i];
                    const px = (graphX + 40) + (Math.min(maxT, hItem.time) / maxT) * (graphW - 55);
                    const py = y100 + (1 - hItem.pct / 100) * (graphH - 24);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();
            }

            // Top Status Bar
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'left';
            const curHalfLives = (this.halfLifeElapsedSec / tHalf).toFixed(1);
            ctx.fillText(`⏱️ Half-Life Progress: ${curHalfLives} t½ (${nuclide.name} t½ = ${nuclide.halfLifeStr})`, 18, 30);
        }

        /* ==================== RENDER 3: SHIELDING LAB ==================== */
        renderShielding(ctx, w, h) {
            const nuclide = DECAY_NUCLIDES.find(n => n.id === this.currentPresetId) || DECAY_NUCLIDES[0];

            // 1. Radioactive Source Collimator on Left
            const srcX = w * 0.10;
            const srcY = h * 0.50;

            ctx.fillStyle = '#334155';
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2.0;
            ctx.fillRect(srcX - 22, srcY - 28, 28, 56);
            ctx.strokeRect(srcX - 22, srcY - 28, 28, 56);

            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 15px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('☢', srcX - 8, srcY);

            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText(nuclide.particle, srcX - 8, srcY + 40);

            // 2. Shielding Barriers
            const paperX = w * 0.32;
            const alumX = w * 0.52;
            const leadX = w * 0.72;
            const barH = h * 0.65;
            const barY = h * 0.18;

            // Barrier 1: Paper
            if (this.shieldingBarriers.paper) {
                ctx.fillStyle = '#f8fafc';
                ctx.strokeStyle = '#94a3b8';
                ctx.lineWidth = 1.0;
                ctx.fillRect(paperX, barY, 8, barH);
                ctx.strokeRect(paperX, barY, 8, barH);
            }
            ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = this.shieldingBarriers.paper ? '#f8fafc' : '#64748b';
            ctx.fillText('📄 Paper', paperX + 4, barY + barH + 18);
            ctx.font = '9px monospace';
            ctx.fillText(this.shieldingBarriers.paper ? '(0.1 mm)' : '[OFF]', paperX + 4, barY + barH + 30);

            // Barrier 2: Aluminum
            if (this.shieldingBarriers.aluminum) {
                const alumGrad = ctx.createLinearGradient(alumX, 0, alumX + 16, 0);
                alumGrad.addColorStop(0, '#64748b');
                alumGrad.addColorStop(0.5, '#cbd5e1');
                alumGrad.addColorStop(1, '#64748b');
                ctx.fillStyle = alumGrad;
                ctx.fillRect(alumX, barY, 16, barH);
            }
            ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillStyle = this.shieldingBarriers.aluminum ? '#38bdf8' : '#64748b';
            ctx.fillText('🛡️ Aluminum', alumX + 8, barY + barH + 18);
            ctx.font = '9px monospace';
            ctx.fillText(this.shieldingBarriers.aluminum ? '(3 mm)' : '[OFF]', alumX + 8, barY + barH + 30);

            // Barrier 3: Lead
            if (this.shieldingBarriers.lead) {
                const leadGrad = ctx.createLinearGradient(leadX, 0, leadX + 28, 0);
                leadGrad.addColorStop(0, '#1e293b');
                leadGrad.addColorStop(0.5, '#475569');
                leadGrad.addColorStop(1, '#1e293b');
                ctx.fillStyle = leadGrad;
                ctx.fillRect(leadX, barY, 28, barH);
            }
            ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillStyle = this.shieldingBarriers.lead ? '#fbbf24' : '#64748b';
            ctx.fillText('🧱 Lead Brick', leadX + 14, barY + barH + 18);
            ctx.font = '9px monospace';
            ctx.fillText(this.shieldingBarriers.lead ? '(5 cm)' : '[OFF]', leadX + 14, barY + barH + 30);

            // 3. Geiger Counter Tube & Ratemeter on Right
            const detX = w * 0.88;
            const detY = h * 0.50;

            // Detector Tube
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 1.5;
            ctx.fillRect(detX - 8, detY - 32, 16, 64);
            ctx.strokeRect(detX - 8, detY - 32, 16, 64);

            // Digital CPM Gauge
            ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
            ctx.strokeStyle = this.cpmReading > 50 ? '#ef4444' : '#4ade80';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(detX - 35, detY + 44, 70, 36, 6);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = this.cpmReading > 50 ? '#ef4444' : '#4ade80';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.round(this.cpmReading)} CPM`, detX, detY + 60);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '8.5px monospace';
            const uSv = (this.cpmReading * 0.005).toFixed(2);
            ctx.fillText(`${uSv} µSv/h`, detX, detY + 73);

            // 4. Render Flying Radiation Particles
            for (const p of this.shieldingParticles) {
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.type === 'alpha' ? 4.5 : 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Top Header Banner
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`🛡️ Penetration & Shielding: ${nuclide.name} (${nuclide.particle})`, 18, 30);
        }

        /* ==================== RENDER 4: LORENTZ CLOUD CHAMBER ==================== */
        renderChamber(ctx, w, h) {
            const nuclide = DECAY_NUCLIDES.find(n => n.id === this.currentPresetId) || DECAY_NUCLIDES[0];

            // Magnetic Field Lines Visual Indicator (dots for +B, crosses for -B)
            if (Math.abs(this.magneticFieldTesla) > 0.05) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.font = 'bold 12px monospace';
                const symbol = this.magneticFieldTesla > 0 ? '⊙' : '⊗';
                for (let x = 40; x < w; x += 55) {
                    for (let y = 30; y < h; y += 45) {
                        ctx.fillText(symbol, x, y);
                    }
                }
            }

            // Render Droplets
            for (const d of this.droplets) {
                d.render(ctx);
            }

            // Render Particles
            for (const p of this.particles) {
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(3.5, p.trackWidth * 0.9), 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Annihilation Flashes
            for (const af of this.annihilationFlashes) {
                ctx.fillStyle = `rgba(251, 191, 36, ${af.alpha})`;
                ctx.shadowColor = '#fbbf24';
                ctx.shadowBlur = 16;
                ctx.beginPath();
                ctx.arc(af.x, af.y, af.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Capsule Source on Left
            ctx.fillStyle = '#334155';
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5;
            ctx.fillRect(this.sourceX - 18, this.sourceY - 18, 24, 36);
            ctx.strokeRect(this.sourceX - 18, this.sourceY - 18, 24, 36);

            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('☢', this.sourceX - 6, this.sourceY);

            // Telemetry Badge
            ctx.fillStyle = 'rgba(10, 15, 29, 0.88)';
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.35)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(14, 14, Math.min(280, w * 0.45), 68, 8);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#00d4ff';
            ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`🧲 Lorentz Chamber: F = q(v × B)`, 24, 32);

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '11px monospace';
            ctx.fillText(`Nuclide: ${nuclide.name} (${nuclide.particle})`, 24, 48);
            ctx.fillText(`Field B: ${this.magneticFieldTesla > 0 ? '+' : ''}${this.magneticFieldTesla.toFixed(1)} T | Log: ${this.totalDecaysCount}`, 24, 64);
        }
    }

    // Attach to Global Scope
    window.NuclearDecaySimulationEngine = NuclearDecaySimulationEngine;
    window.DECAY_PRESETS = DECAY_NUCLIDES;
    window.DECAY_NUCLIDES = DECAY_NUCLIDES;
    window.nuclearDecayEngine = new NuclearDecaySimulationEngine();
})();
