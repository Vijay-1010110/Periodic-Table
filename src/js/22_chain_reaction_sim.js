/**
 * PERIODICA 3D - Nuclear Fission & Chain Reaction Simulation Engine
 * High-Precision PhET & Brilliant.org Pedagogical Architecture
 * 
 * Features:
 * 1. Progressive Scenarios:
 *    - Scenario 1: Single Nucleus Fission (Tutorial Mode with Bohr-Wheeler Liquid Drop elongation,
 *                  slow-motion thermal neutron absorption, Kr-92 + Ba-141 scission split,
 *                  3 prompt neutrons, and +200 MeV energy release).
 *    - Scenario 2: Chain Reaction Sandbox (Density slider, exponential cascade, combo scoring).
 *    - Scenario 3: Controlled Reactor Core (Boron control rods, moderator selection, turbine power, SCRAM).
 * 2. Real-time 60 FPS Canvas Renderer with DPR scaling, Cherenkov radiation, and zero telemetry clipping.
 * 
 * Sourced from IAEA Nuclear Data Services & Evaluated Nuclear Data File (ENDF/B-VIII.0).
 * (c) 2026 Periodica 3D | Developer: Vijay-1010110
 */

(function () {
    'use strict';

    /**
     * Fissile Fuel Nuclear Specifications
     */
    const FUEL_SPECS = {
        'U235': {
            name: 'Uranium-235',
            symbol: '²³⁵U',
            protons: 92,
            neutrons: 143,
            color: '#10b981',
            glowColor: 'rgba(16, 185, 129, 0.65)',
            fissionQMeV: 202.5,
            avgPromptNeutrons: 2.43,
            thermalCrossSectionBarns: 585.0,
            fastCrossSectionBarns: 1.25,
            delayedFraction: 0.0065,
            desc: 'Thermal fissile isotope used in commercial LWRs and enriched devices.'
        },
        'PU239': {
            name: 'Plutonium-239',
            symbol: '²³⁹Pu',
            protons: 94,
            neutrons: 145,
            color: '#f59e0b',
            glowColor: 'rgba(245, 158, 11, 0.70)',
            fissionQMeV: 207.1,
            avgPromptNeutrons: 2.88,
            thermalCrossSectionBarns: 748.0,
            fastCrossSectionBarns: 1.80,
            delayedFraction: 0.0021,
            desc: 'High neutron yield actinide; rapid prompt response and lower critical mass.'
        },
        'U238': {
            name: 'Uranium-238 (Depleted)',
            symbol: '²³⁸U',
            protons: 92,
            neutrons: 146,
            color: '#64748b',
            glowColor: 'rgba(100, 116, 139, 0.45)',
            fissionQMeV: 205.0,
            avgPromptNeutrons: 2.50,
            thermalCrossSectionBarns: 0.00002,
            fastCrossSectionBarns: 0.60,
            delayedFraction: 0.0157,
            desc: 'Fertile isotope; captures thermal neutrons into Pu-239; fissions only with fast neutrons.'
        }
    };

    /**
     * Moderator Characteristics
     */
    const MODERATOR_SPECS = {
        'light_water': { name: 'Light Water (H₂O)', xi: 0.925, slowingRatio: 61, color: 'rgba(0, 212, 255, 0.12)' },
        'heavy_water': { name: 'Heavy Water (D₂O)', xi: 0.508, slowingRatio: 5670, color: 'rgba(59, 130, 246, 0.18)' },
        'graphite':    { name: 'Nuclear Graphite (C)', xi: 0.158, slowingRatio: 192, color: 'rgba(75, 85, 99, 0.22)' },
        'vacuum':      { name: 'Fast / Vacuum (No Moderator)', xi: 0.0, slowingRatio: 0, color: 'transparent' }
    };

    /**
     * Single Particle Entities
     */
    class Neutron {
        constructor(x, y, vx, vy, isThermal = false) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.isThermal = isThermal;
            this.energyMeV = isThermal ? 0.000000025 : 2.0;
            this.age = 0;
            this.alive = true;
            this.trail = [];
        }

        update(dt, width, height, moderator) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 6) this.trail.shift();

            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.age += dt;

            // Moderator collisions (thermalization)
            if (!this.isThermal && moderator && moderator.xi > 0) {
                if (Math.random() < 0.05 * moderator.xi) {
                    this.isThermal = true;
                    this.energyMeV = 0.000000025;
                    this.vx *= 0.45;
                    this.vy *= 0.45;
                }
            }

            // Chamber boundary conditions (Leakage)
            if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                this.alive = false;
            }

            if (this.age > 7.5) {
                this.alive = false;
            }
        }
    }

    class FissileNucleus {
        constructor(x, y, fuelType = 'U235', radius = 16) {
            this.x = x;
            this.y = y;
            this.fuelType = fuelType;
            this.radius = radius;
            this.fissioned = false;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }

        update(dt) {
            this.pulsePhase += dt * 3.0;
        }
    }

    class FissionFlash {
        constructor(x, y, maxRadius = 46) {
            this.x = x;
            this.y = y;
            this.radius = 6;
            this.maxRadius = maxRadius;
            this.opacity = 1.0;
        }

        update(dt) {
            this.radius += 120 * dt;
            this.opacity -= 2.2 * dt;
            return this.opacity > 0;
        }
    }

    class FissionFragment {
        constructor(x, y, symbol, color, vx, vy, radius = 10, label = '') {
            this.x = x;
            this.y = y;
            this.symbol = symbol;
            this.color = color;
            this.vx = vx;
            this.vy = vy;
            this.radius = radius;
            this.label = label;
            this.age = 0;
            this.opacity = 1.0;
            this.trail = [];
        }

        update(dt) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 5) this.trail.shift();

            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.vx *= 0.985;
            this.vy *= 0.985;
            this.age += dt;
            this.opacity -= 0.22 * dt;
            return this.opacity > 0;
        }
    }

    class FloatingScoreText {
        constructor(x, y, text, color = '#fbbf24', duration = 1.5) {
            this.x = x;
            this.y = y;
            this.text = text;
            this.color = color;
            this.opacity = 1.0;
            this.vy = -34;
            this.duration = duration;
        }

        update(dt) {
            this.y += this.vy * dt;
            this.opacity -= (1.0 / this.duration) * dt;
            return this.opacity > 0;
        }
    }

    /**
     * Master ChainReactionSimulationEngine with Progressive Scenarios
     */
    class ChainReactionSimulationEngine {
        constructor() {
            // Scenario Management: 'single_fission' | 'chain_sandbox' | 'reactor_core'
            this.currentScenario = 'single_fission';

            this.fuelType = 'U235';
            this.moderatorType = 'light_water';
            this.controlRodInsertion = 0.35;
            this.atomDensity = 45; // Sandbox atom count

            this.neutrons = [];
            this.targets = [];
            this.flashes = [];
            this.fragments = [];
            this.floatingTexts = [];
            this.width = 700;
            this.height = 420;

            // Telemetry & Game State
            this.fissionsTotal = 0;
            this.currentPowerMW = 0;
            this.keff = 0.0;
            this.promptCritical = false;
            this.scramActive = false;

            // Gamification
            this.score = 0;
            this.chainCombo = 0;
            this.comboTimer = 0;
            this.stableCriticalTimer = 0;

            // Reaction Process Step Tracker (1 to 4)
            this.activeReactionStep = 1;
            this.reactionNarrative = 'Scenario 1: Single Nucleus Fission. Aim neutron gun & tap "FIRE NEUTRON" to observe Bohr-Wheeler liquid-drop split!';

            // Single Nucleus Fission Tutorial State Machine
            this.singleAtomState = {
                stage: 'ready', // 'ready' | 'neutron_flying' | 'absorbed' | 'elongating' | 'splitting' | 'insight'
                stageTimer: 0,
                nucleusX: 0,
                nucleusY: 0,
                nucleusRadius: 52,
                elongation: 1.0,
                neckFactor: 1.0,
                oscillation: 0,
                gunX: 70,
                gunY: 0,
                gunAngle: 0,
                incomingNeutron: null,
                splitFragments: [],
                promptNeutrons: [],
                energyBurstRadius: 0,
                energyBurstAlpha: 1.0,
                tutorialCallouts: []
            };

            // Game Missions
            this.gameMissions = [
                {
                    id: 'm1',
                    title: 'The First Spark 🎯',
                    desc: 'Trigger a clean nuclear fission split into Kr-92 and Ba-141!',
                    goal: 1,
                    current: 0,
                    completed: false,
                    badge: 'Atom Breaker ⭐'
                },
                {
                    id: 'm2',
                    title: 'Chain Reaction Combo ⚡',
                    desc: 'Achieve a chain cascade splitting at least 10 atoms in one continuous surge!',
                    goal: 10,
                    current: 0,
                    completed: false,
                    badge: 'Chain Master ⚡'
                },
                {
                    id: 'm3',
                    title: 'Grid Power Stability 🔋',
                    desc: 'Balance Control Rods to hold reactor in steady Critical state (k-eff 0.99 - 1.02) for 6 seconds!',
                    goal: 6.0,
                    current: 0.0,
                    completed: false,
                    badge: 'Reactor Operator 🎖️'
                },
                {
                    id: 'm4',
                    title: 'Prevent Meltdown 🚨',
                    desc: 'Reach supercritical power (>2,000 MW) and execute an emergency SCRAM before critical!',
                    goal: 1,
                    current: 0,
                    completed: false,
                    badge: 'Meltdown Hero 🛡️'
                }
            ];

            this.initChamber();
        }

        setScenario(scenarioKey) {
            if (['single_fission', 'chain_sandbox', 'reactor_core'].includes(scenarioKey)) {
                this.currentScenario = scenarioKey;
                this.initChamber();
                if (typeof window.renderTuningPanel === 'function') {
                    window.renderTuningPanel('chain_reaction');
                }
            }
        }

        initChamber() {
            this.targets = [];
            this.neutrons = [];
            this.flashes = [];
            this.fragments = [];
            this.floatingTexts = [];
            this.fissionsTotal = 0;
            this.currentPowerMW = 0;
            this.chainCombo = 0;
            this.comboTimer = 0;
            this.stableCriticalTimer = 0;
            this.scramActive = false;

            if (this.currentScenario === 'single_fission') {
                this.initSingleAtomScenario();
            } else if (this.currentScenario === 'chain_sandbox') {
                this.activeReactionStep = 1;
                this.reactionNarrative = 'Scenario 2: Chain Reaction Sandbox. Tap anywhere on the fuel cluster to launch neutrons and trigger cascades!';
                this.repositionLattice(this.width, this.height, this.atomDensity);
            } else {
                this.activeReactionStep = 1;
                this.reactionNarrative = 'Scenario 3: Controlled Reactor Core. Adjust Boron Control Rods and moderator to maintain steady 1,000 MW power!';
                this.repositionLattice(this.width, this.height, 56);
            }

            this.updateDOMStepper();
        }

        initSingleAtomScenario() {
            this.activeReactionStep = 1;
            this.reactionNarrative = '🎯 Step 1: Aim the neutron emitter on the left and tap "FIRE NEUTRON" to initiate thermal absorption into ²³⁵U!';
            
            const centerX = this.width * 0.55;
            const centerY = this.height * 0.48;
            this.singleAtomState = {
                stage: 'ready',
                stageTimer: 0,
                nucleusX: centerX,
                nucleusY: centerY,
                nucleusRadius: Math.max(38, Math.min(54, this.height * 0.16)),
                elongation: 1.0,
                neckFactor: 1.0,
                oscillation: 0,
                gunX: Math.max(50, this.width * 0.10),
                gunY: centerY,
                gunAngle: 0,
                incomingNeutron: null,
                splitFragments: [],
                promptNeutrons: [],
                energyBurstRadius: 0,
                energyBurstAlpha: 1.0,
                tutorialCallouts: [
                    { text: '²³⁵U Fuel Nucleus (92p + 143n)', x: centerX, y: centerY - 65, color: '#10b981' },
                    { text: 'Aimable Thermal Neutron Gun (0.025 eV)', x: Math.max(50, this.width * 0.10) + 70, y: centerY + 45, color: '#38bdf8' }
                ]
            };

            // Calculate direct angle from gun to nucleus
            const dx = this.singleAtomState.nucleusX - this.singleAtomState.gunX;
            const dy = this.singleAtomState.nucleusY - this.singleAtomState.gunY;
            this.singleAtomState.gunAngle = Math.atan2(dy, dx);
        }

        repositionLattice(w, h, targetCount = 60) {
            this.width = Math.max(320, w);
            this.height = Math.max(240, h);
            this.targets = [];

            if (this.currentScenario === 'single_fission') {
                this.initSingleAtomScenario();
                return;
            }

            // Grid Layout for Sandbox & Reactor modes
            const aspect = this.width / this.height;
            let cols = Math.max(5, Math.min(14, Math.round(Math.sqrt(targetCount * aspect))));
            let rows = Math.max(3, Math.min(8, Math.round(targetCount / cols)));

            const marginX = Math.max(35, this.width * 0.08);
            const marginTop = Math.max(80, this.height * 0.22);
            const marginBottom = 50;
            const spanW = this.width - marginX * 2;
            const spanH = Math.max(120, this.height - marginTop - marginBottom);

            const gapX = spanW / Math.max(1, cols - 1);
            const gapY = spanH / Math.max(1, rows - 1);
            const cellRadius = Math.max(12, Math.min(18, Math.min(gapX, gapY) * 0.36));

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const jitterX = (Math.random() - 0.5) * 5;
                    const jitterY = (Math.random() - 0.5) * 5;
                    this.targets.push(new FissileNucleus(
                        marginX + c * gapX + jitterX,
                        marginTop + r * gapY + jitterY,
                        this.fuelType,
                        cellRadius
                    ));
                }
            }
        }

        /**
         * Fire a neutron based on current scenario
         */
        injectNeutron(x = 35, y = this.height / 2, angleRad = 0, speed = 280) {
            if (this.currentScenario === 'single_fission') {
                this.fireSingleAtomNeutron();
                return;
            }

            const vx = Math.cos(angleRad) * speed;
            const vy = Math.sin(angleRad) * speed;
            this.neutrons.push(new Neutron(x, y, vx, vy, false));

            this.activeReactionStep = 1;
            this.reactionNarrative = '🎯 Step 1: Fast neutron launched into fuel lattice!';
            this.updateDOMStepper();

            if (window.physicsAudio) {
                window.physicsAudio.playNeutronGun();
            }
        }

        fireSingleAtomNeutron() {
            const state = this.singleAtomState;
            if (state.stage !== 'ready' && state.stage !== 'insight') {
                return;
            }

            state.stage = 'neutron_flying';
            state.stageTimer = 0;
            state.splitFragments = [];
            state.promptNeutrons = [];
            state.energyBurstRadius = 0;
            state.energyBurstAlpha = 1.0;

            const speed = 240;
            const vx = Math.cos(state.gunAngle) * speed;
            const vy = Math.sin(state.gunAngle) * speed;
            state.incomingNeutron = new Neutron(state.gunX, state.gunY, vx, vy, true);

            this.activeReactionStep = 1;
            this.reactionNarrative = '🎯 Step 1: Thermal neutron in flight toward ²³⁵U nucleus!';
            this.updateDOMStepper();

            if (window.physicsAudio) {
                window.physicsAudio.playNeutronGun();
            }
        }

        aimAndFire(targetX, targetY) {
            if (this.currentScenario === 'single_fission') {
                // Update gun angle towards touch and fire
                const state = this.singleAtomState;
                const dx = targetX - state.gunX;
                const dy = targetY - state.gunY;
                state.gunAngle = Math.atan2(dy, dx);
                this.fireSingleAtomNeutron();
                return;
            }

            const startX = 30;
            const startY = this.height / 2;
            const dx = targetX - startX;
            const dy = targetY - startY;
            const angle = Math.atan2(dy, dx);
            this.injectNeutron(startX, startY, angle, 320);
        }

        setControlRods(percentage) {
            this.controlRodInsertion = Math.max(0, Math.min(1.0, Number(percentage) || 0));
            if (this.controlRodInsertion < 0.95) {
                this.scramActive = false;
            }
            this.updateDOMStepper();
        }

        setFuel(fuelKey) {
            if (FUEL_SPECS[fuelKey]) {
                this.fuelType = fuelKey;
                this.initChamber();
            }
        }

        setModerator(modKey) {
            if (MODERATOR_SPECS[modKey]) {
                this.moderatorType = modKey;
            }
        }

        setAtomDensity(count) {
            this.atomDensity = Math.max(12, Math.min(100, Number(count) || 45));
            if (this.currentScenario === 'chain_sandbox') {
                this.repositionLattice(this.width, this.height, this.atomDensity);
            }
        }

        triggerSCRAM() {
            this.scramActive = true;
            this.controlRodInsertion = 1.0;
            this.chainCombo = 0;
            this.reactionNarrative = '🚨 EMERGENCY SCRAM ACTIVATED! Control rods fully lowered to 100% — absorbing all free neutrons!';
            this.updateDOMStepper();

            const m4 = this.gameMissions.find(m => m.id === 'm4');
            if (m4 && !m4.completed && this.currentPowerMW > 1500) {
                m4.current = 1;
                m4.completed = true;
                this.score += 1000;
                this.onMissionCompleted(m4);
            }

            if (window.physicsAudio) {
                window.physicsAudio.playScramAlarm();
            }
        }

        onMissionCompleted(mission) {
            this.floatingTexts.push(new FloatingScoreText(this.width / 2, this.height * 0.35, `🏆 ${mission.title} COMPLETED! +500 PTS`, '#4ade80', 2.0));
            if (window.physicsAudio) {
                window.physicsAudio.playMissionCompleteChime?.();
            }
            if (window.NativeServices?.Haptics) {
                window.NativeServices.Haptics.notification('SUCCESS');
            }
            if (typeof window.renderTuningPanel === 'function') {
                window.renderTuningPanel('chain_reaction');
            }
        }

        update(dt) {
            if (this.currentScenario === 'single_fission') {
                this.updateSingleAtomScenario(dt);
                return;
            }

            const fuelSpec = FUEL_SPECS[this.fuelType] || FUEL_SPECS['U235'];
            const modSpec = MODERATOR_SPECS[this.moderatorType] || MODERATOR_SPECS['light_water'];

            if (this.comboTimer > 0) {
                this.comboTimer -= dt;
                if (this.comboTimer <= 0) {
                    this.chainCombo = 0;
                }
            }

            for (const t of this.targets) {
                t.update(dt);
            }

            let newNeutrons = [];
            let fissionsThisStep = 0;

            const rodPositionsX = [this.width * 0.28, this.width * 0.50, this.width * 0.72];
            const rodMaxDepth = this.height * 0.88;
            const rodCurrentDepth = (this.currentScenario === 'reactor_core') ? rodMaxDepth * this.controlRodInsertion : 0;

            for (let i = 0; i < this.neutrons.length; i++) {
                const n = this.neutrons[i];
                n.update(dt, this.width, this.height, modSpec);
                if (!n.alive) continue;

                if (this.currentScenario === 'reactor_core' && rodCurrentDepth > 5) {
                    let absorbedByRod = false;
                    for (const rx of rodPositionsX) {
                        if (Math.abs(n.x - rx) < 14 && n.y < rodCurrentDepth) {
                            absorbedByRod = true;
                            n.alive = false;
                            this.floatingTexts.push(new FloatingScoreText(rx, n.y, 'Absorbed 🛡️', '#94a3b8'));
                            break;
                        }
                    }
                    if (absorbedByRod) continue;
                }

                for (let j = 0; j < this.targets.length; j++) {
                    const target = this.targets[j];
                    if (target.fissioned) continue;

                    const dx = n.x - target.x;
                    const dy = n.y - target.y;
                    const distSq = dx * dx + dy * dy;

                    const baseProb = n.isThermal ? 0.88 : 0.24;
                    const effectiveRadius = n.isThermal ? (target.radius + 8) : (target.radius + 3);

                    if (distSq < effectiveRadius * effectiveRadius) {
                        if (Math.random() < baseProb) {
                            target.fissioned = true;
                            n.alive = false;
                            fissionsThisStep++;
                            this.fissionsTotal++;
                            this.chainCombo++;
                            this.comboTimer = 1.4;
                            this.score += 200 + this.chainCombo * 25;

                            this.flashes.push(new FissionFlash(target.x, target.y));

                            const splitAngle = Math.random() * Math.PI;
                            const fragSpeed = 75;
                            this.fragments.push(new FissionFragment(
                                target.x, target.y,
                                '⁹²Kr', '#38bdf8',
                                Math.cos(splitAngle) * fragSpeed,
                                Math.sin(splitAngle) * fragSpeed
                            ));
                            this.fragments.push(new FissionFragment(
                                target.x, target.y,
                                '¹⁴¹Ba', '#fb923c',
                                -Math.cos(splitAngle) * fragSpeed,
                                -Math.sin(splitAngle) * fragSpeed
                            ));

                            this.floatingTexts.push(new FloatingScoreText(
                                target.x, target.y - 14,
                                `+${fuelSpec.fissionQMeV.toFixed(0)} MeV ⚡`,
                                '#fbbf24'
                            ));

                            const numEmitted = Math.random() < 0.45 ? 2 : 3;
                            for (let k = 0; k < numEmitted; k++) {
                                const angle = Math.random() * Math.PI * 2;
                                const speed = 240 + Math.random() * 90;
                                newNeutrons.push(new Neutron(
                                    target.x, target.y,
                                    Math.cos(angle) * speed,
                                    Math.sin(angle) * speed,
                                    false
                                ));
                            }

                            if (this.fissionsTotal === 1) {
                                const m1 = this.gameMissions.find(m => m.id === 'm1');
                                if (m1 && !m1.completed) {
                                    m1.current = 1;
                                    m1.completed = true;
                                    this.onMissionCompleted(m1);
                                }
                            }

                            if (this.chainCombo >= 10) {
                                const m2 = this.gameMissions.find(m => m.id === 'm2');
                                if (m2 && !m2.completed) {
                                    m2.current = 10;
                                    m2.completed = true;
                                    this.onMissionCompleted(m2);
                                }
                            }

                            this.activeReactionStep = 3;
                            this.reactionNarrative = `💥 Fission split in progress! Combo x${this.chainCombo} generating energy!`;
                            this.updateDOMStepper();

                            if (window.physicsAudio) {
                                window.physicsAudio.playFissionBoom?.() || window.physicsAudio.playFissionClick();
                            }
                            break;
                        }
                    }
                }
            }

            this.neutrons = this.neutrons.filter(n => n.alive).concat(newNeutrons);
            if (this.neutrons.length > 250) {
                this.neutrons = this.neutrons.slice(-250);
            }

            this.flashes = this.flashes.filter(f => f.update(dt));
            this.fragments = this.fragments.filter(fg => fg.update(dt));
            this.floatingTexts = this.floatingTexts.filter(ft => ft.update(dt));

            if (this.neutrons.length > 0) {
                const birthRate = newNeutrons.length;
                this.keff = (birthRate / Math.max(1, (this.neutrons.length - birthRate) * 0.16)) * 0.96;
            } else {
                this.keff = 0.0;
            }

            this.promptCritical = this.keff > 1.03 && this.neutrons.length > 20;
            this.currentPowerMW = fissionsThisStep * fuelSpec.fissionQMeV * 1.602e-13 * 1.2e6;

            const m3 = this.gameMissions.find(m => m.id === 'm3');
            if (m3 && !m3.completed && this.currentScenario === 'reactor_core') {
                if (this.keff >= 0.99 && this.keff <= 1.02 && this.neutrons.length > 4) {
                    this.stableCriticalTimer += dt;
                    m3.current = Math.min(m3.goal, this.stableCriticalTimer);
                    if (this.stableCriticalTimer >= m3.goal) {
                        m3.completed = true;
                        this.score += 600;
                        this.onMissionCompleted(m3);
                    }
                } else {
                    this.stableCriticalTimer = Math.max(0, this.stableCriticalTimer - dt * 0.5);
                    m3.current = this.stableCriticalTimer;
                }
            }

            if (this.neutrons.length === 0 && fissionsThisStep === 0 && !this.scramActive) {
                if (this.activeReactionStep > 1) {
                    this.activeReactionStep = 1;
                    this.reactionNarrative = 'Core quiet. Tap anywhere on the lattice to inject neutrons!';
                    this.updateDOMStepper();
                }
            }
        }

        updateSingleAtomScenario(dt) {
            const state = this.singleAtomState;
            state.stageTimer += dt;

            // Update Fragments and Prompt Neutrons in single fission mode
            state.splitFragments = state.splitFragments.filter(fg => fg.update(dt));
            for (const n of state.promptNeutrons) {
                n.update(dt, this.width, this.height, null);
            }
            state.promptNeutrons = state.promptNeutrons.filter(n => n.alive);
            this.floatingTexts = this.floatingTexts.filter(ft => ft.update(dt));

            if (state.stage === 'neutron_flying') {
                if (state.incomingNeutron) {
                    state.incomingNeutron.update(dt, this.width, this.height, null);

                    const dx = state.incomingNeutron.x - state.nucleusX;
                    const dy = state.incomingNeutron.y - state.nucleusY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < state.nucleusRadius) {
                        // Neutron absorbs into nucleus!
                        state.incomingNeutron = null;
                        state.stage = 'absorbed';
                        state.stageTimer = 0;
                        state.elongation = 1.0;
                        state.neckFactor = 1.0;

                        this.activeReactionStep = 2;
                        this.reactionNarrative = '⚡ Step 2: Thermal neutron absorbed into ²³⁵U! Compound nucleus ²³⁶U* formed (+6.5 MeV excitation)!';
                        this.updateDOMStepper();

                        if (window.physicsAudio) {
                            window.physicsAudio.playNeutronCapture?.();
                        }
                    }
                }
            } else if (state.stage === 'absorbed') {
                // Compound nucleus vibrating (0.9 seconds)
                state.oscillation += dt * 14.0;
                if (state.stageTimer >= 0.9) {
                    state.stage = 'elongating';
                    state.stageTimer = 0;

                    this.activeReactionStep = 2;
                    this.reactionNarrative = '⚡ Step 2: Bohr-Wheeler Liquid Drop elongation! Coulomb repulsion between 92 protons stretches the nucleus!';
                    this.updateDOMStepper();

                    if (window.physicsAudio) {
                        window.physicsAudio.playElongationTension?.();
                    }
                }
            } else if (state.stage === 'elongating') {
                // Liquid droplet necking & elongation (1.8 seconds)
                const progress = Math.min(1.0, state.stageTimer / 1.8);
                state.elongation = 1.0 + progress * 1.5; // Stretches horizontally to 2.5x
                state.neckFactor = 1.0 - progress * 0.95; // Neck thins down to 0.05
                state.oscillation += dt * 8.0;

                if (state.stageTimer >= 1.8) {
                    // SCISSION SPLIT!
                    state.stage = 'splitting';
                    state.stageTimer = 0;
                    this.fissionsTotal = 1;
                    this.score += 500;

                    // Spawn fragments Kr-92 and Ba-141
                    const splitAngle = -0.35;
                    const speed = 120;
                    state.splitFragments = [
                        new FissionFragment(
                            state.nucleusX - 22, state.nucleusY,
                            '¹⁴¹Ba', '#fb923c',
                            -Math.cos(splitAngle) * speed * 0.85,
                            -Math.sin(splitAngle) * speed * 0.85,
                            24, 'Barium-141 (56p + 85n, ~85 MeV)'
                        ),
                        new FissionFragment(
                            state.nucleusX + 22, state.nucleusY,
                            '⁹²Kr', '#38bdf8',
                            Math.cos(splitAngle) * speed * 1.15,
                            Math.sin(splitAngle) * speed * 1.15,
                            18, 'Krypton-92 (36p + 56n, ~98 MeV)'
                        )
                    ];

                    // Spawn 3 Prompt Fast Neutrons
                    state.promptNeutrons = [
                        new Neutron(state.nucleusX, state.nucleusY - 8, -60, -220, false),
                        new Neutron(state.nucleusX, state.nucleusY + 8, 180, 160, false),
                        new Neutron(state.nucleusX, state.nucleusY, 210, -110, false)
                    ];

                    this.flashes.push(new FissionFlash(state.nucleusX, state.nucleusY, 80));
                    this.floatingTexts.push(new FloatingScoreText(
                        state.nucleusX, state.nucleusY - 35,
                        '+200.5 MeV KINETIC ENERGY RELEASED! 💥',
                        '#fbbf24', 3.0
                    ));

                    // Complete Mission 1
                    const m1 = this.gameMissions.find(m => m.id === 'm1');
                    if (m1 && !m1.completed) {
                        m1.current = 1;
                        m1.completed = true;
                        this.onMissionCompleted(m1);
                    }

                    this.activeReactionStep = 3;
                    this.reactionNarrative = '💥 Step 3: Scission Split! Nucleus divided into ⁹²Kr + ¹⁴¹Ba + 3 prompt neutrons + 200 MeV energy!';
                    this.updateDOMStepper();

                    if (window.physicsAudio) {
                        window.physicsAudio.playFissionBoom?.() || window.physicsAudio.playFissionClick();
                    }
                }
            } else if (state.stage === 'splitting') {
                if (state.stageTimer >= 2.0) {
                    state.stage = 'insight';
                    state.stageTimer = 0;

                    this.activeReactionStep = 4;
                    this.reactionNarrative = '🔄 Step 4: Multiplier Insight! 1 neutron in produced 3 prompt neutrons out! Each can trigger another fission in dense fuel.';
                    this.updateDOMStepper();
                }
            }
        }

        updateDOMStepper() {
            for (let s = 1; s <= 4; s++) {
                const stepEl = document.getElementById(`rxn-step-${s}`);
                if (stepEl) {
                    if (s === this.activeReactionStep) {
                        stepEl.classList.add('active');
                    } else {
                        stepEl.classList.remove('active');
                    }
                }
            }

            const msgEl = document.getElementById('sim-narrator-msg');
            if (msgEl && msgEl.textContent !== this.reactionNarrative) {
                msgEl.textContent = this.reactionNarrative;
            }
        }

        render(canvas) {
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

            if (Math.abs(this.width - clientW) > 25 || Math.abs(this.height - clientH) > 25) {
                this.repositionLattice(clientW, clientH, this.atomDensity);
            }

            ctx.save();
            ctx.scale(dpr, dpr);

            const w = this.width;
            const h = this.height;

            ctx.clearRect(0, 0, w, h);

            if (this.currentScenario === 'single_fission') {
                this.renderSingleAtomScenario(ctx, w, h);
            } else {
                this.renderMultiAtomScenario(ctx, w, h);
            }

            // Always render Floating Scores
            for (const ft of this.floatingTexts) {
                ctx.fillStyle = ft.color;
                ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
                ctx.shadowBlur = 5;
                ctx.fillText(ft.text, ft.x, ft.y);
                ctx.shadowBlur = 0;
            }

            // Render Scenario Bar Pills on Top-Left of Canvas
            this.renderScenarioHUD(ctx, w, h);

            ctx.restore();
        }

        renderScenarioHUD(ctx, w, h) {
            const pillY = 12;
            const scenarios = [
                { id: 'single_fission', label: '1. Single Atom Fission', icon: '🎯' },
                { id: 'chain_sandbox', label: '2. Chain Sandbox', icon: '⚡' },
                { id: 'reactor_core', label: '3. Reactor Core', icon: '🔋' }
            ];

            let curX = 14;
            ctx.font = 'bold 11px var(--font-ui), sans-serif';

            for (const s of scenarios) {
                const isCur = this.currentScenario === s.id;
                const text = `${s.icon} ${s.label}`;
                const textW = ctx.measureText(text).width;
                const pillW = textW + 18;
                const pillH = 24;

                ctx.fillStyle = isCur ? 'rgba(0, 212, 255, 0.28)' : 'rgba(15, 23, 42, 0.75)';
                ctx.strokeStyle = isCur ? '#00d4ff' : 'rgba(255, 255, 255, 0.15)';
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

        renderSingleAtomScenario(ctx, w, h) {
            const state = this.singleAtomState;

            // Subtle Cherenkov & Background Grid
            const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.55);
            grad.addColorStop(0, 'rgba(0, 212, 255, 0.08)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // 1. Neutron Emitter on the Left
            const gunX = state.gunX;
            const gunY = state.gunY;
            const barrelLen = 32;
            const barrelEndX = gunX + Math.cos(state.gunAngle) * barrelLen;
            const barrelEndY = gunY + Math.sin(state.gunAngle) * barrelLen;

            // Aim dashed trajectory line
            if (state.stage === 'ready' || state.stage === 'insight') {
                ctx.save();
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = 'rgba(0, 212, 255, 0.55)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(barrelEndX, barrelEndY);
                ctx.lineTo(state.nucleusX, state.nucleusY);
                ctx.stroke();
                ctx.restore();
            }

            // Emitter Body
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.arc(gunX, gunY, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Barrel
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(gunX, gunY);
            ctx.lineTo(barrelEndX, barrelEndY);
            ctx.stroke();

            // Gun label
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('EMITTER', gunX, gunY + 28);

            // 2. In-Flight Thermal Neutron
            if (state.incomingNeutron && state.incomingNeutron.alive) {
                const n = state.incomingNeutron;
                ctx.fillStyle = '#00d4ff';
                ctx.shadowColor = '#00d4ff';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(n.x, n.y, 6.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('¹n (Thermal)', n.x, n.y - 12);
            }

            // 3. Render Large Liquid-Drop Nucleus
            if (state.stage === 'ready' || state.stage === 'neutron_flying' || state.stage === 'absorbed' || state.stage === 'elongating') {
                const cx = state.nucleusX;
                const cy = state.nucleusY;
                const r = state.nucleusRadius;
                const elong = state.elongation;
                const neck = state.neckFactor;
                const osc = Math.sin(state.oscillation) * 4;

                ctx.save();
                ctx.translate(cx, cy);

                if (state.stage === 'elongating' && elong > 1.2) {
                    // Bohr-Wheeler Dumbbell shape (Dual lobe liquid drop with neck)
                    const lobeDist = (elong - 1.0) * 36;
                    const lobeR = r * 0.78;
                    const neckW = r * 0.75 * neck;

                    // Glow aura
                    ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
                    ctx.beginPath();
                    ctx.arc(-lobeDist, 0, lobeR + 10, 0, Math.PI * 2);
                    ctx.arc(lobeDist, 0, lobeR + 10, 0, Math.PI * 2);
                    ctx.fill();

                    // Left Lobe (Ba precursor)
                    const gradBa = ctx.createRadialGradient(-lobeDist, 0, 2, -lobeDist, 0, lobeR);
                    gradBa.addColorStop(0, '#ffffff');
                    gradBa.addColorStop(0.35, '#fb923c');
                    gradBa.addColorStop(1, '#9a3412');
                    ctx.fillStyle = gradBa;
                    ctx.beginPath();
                    ctx.arc(-lobeDist, 0, lobeR, 0, Math.PI * 2);
                    ctx.fill();

                    // Right Lobe (Kr precursor)
                    const gradKr = ctx.createRadialGradient(lobeDist, 0, 2, lobeDist, 0, lobeR * 0.88);
                    gradKr.addColorStop(0, '#ffffff');
                    gradKr.addColorStop(0.35, '#38bdf8');
                    gradKr.addColorStop(1, '#0369a1');
                    ctx.fillStyle = gradKr;
                    ctx.beginPath();
                    ctx.arc(lobeDist, 0, lobeR * 0.88, 0, Math.PI * 2);
                    ctx.fill();

                    // Connecting Neck
                    ctx.fillStyle = '#e2e8f0';
                    ctx.beginPath();
                    ctx.roundRect(-lobeDist * 0.6, -neckW / 2, lobeDist * 1.2, neckW, 4);
                    ctx.fill();

                    // Tension label
                    ctx.fillStyle = '#fbbf24';
                    ctx.font = 'bold 11px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('⚡ Coulomb Repulsion > Strong Force', 0, -lobeR - 16);
                } else {
                    // Spherical / Oscillating Compound Nucleus
                    const auraColor = (state.stage === 'absorbed') ? 'rgba(251, 191, 36, 0.45)' : 'rgba(16, 185, 129, 0.35)';
                    ctx.fillStyle = auraColor;
                    ctx.beginPath();
                    ctx.arc(0, 0, r + 10 + osc, 0, Math.PI * 2);
                    ctx.fill();

                    const coreGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r + osc);
                    if (state.stage === 'absorbed') {
                        coreGrad.addColorStop(0, '#ffffff');
                        coreGrad.addColorStop(0.35, '#fbbf24');
                        coreGrad.addColorStop(1, '#d97706');
                    } else {
                        coreGrad.addColorStop(0, '#ffffff');
                        coreGrad.addColorStop(0.35, '#10b981');
                        coreGrad.addColorStop(1, '#064e3b');
                    }

                    ctx.fillStyle = coreGrad;
                    ctx.beginPath();
                    ctx.arc(0, 0, r + osc, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.lineWidth = 2.0;
                    ctx.stroke();

                    // Nucleus Label
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 16px monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const symText = (state.stage === 'absorbed') ? '²³⁶U*' : '²³⁵U';
                    ctx.fillText(symText, 0, -4);

                    ctx.font = 'bold 10px monospace';
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                    const nucText = (state.stage === 'absorbed') ? '92p + 144n (Excited)' : '92p + 143n';
                    ctx.fillText(nucText, 0, 14);
                }

                ctx.restore();
            }

            // 4. Render Fragments Flying Outward
            for (const fg of state.splitFragments) {
                // Fragment trail
                if (fg.trail.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(fg.trail[0].x, fg.trail[0].y);
                    for (let ti = 1; ti < fg.trail.length; ti++) {
                        ctx.lineTo(fg.trail[ti].x, fg.trail[ti].y);
                    }
                    ctx.strokeStyle = fg.color;
                    ctx.lineWidth = 3.5;
                    ctx.stroke();
                }

                // Fragment Ball
                const fGrad = ctx.createRadialGradient(fg.x - 4, fg.y - 4, 1, fg.x, fg.y, fg.radius);
                fGrad.addColorStop(0, '#ffffff');
                fGrad.addColorStop(0.4, fg.color);
                fGrad.addColorStop(1, '#0f172a');
                ctx.fillStyle = fGrad;
                ctx.beginPath();
                ctx.arc(fg.x, fg.y, fg.radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(fg.symbol, fg.x, fg.y);

                // Callout label
                if (fg.label) {
                    ctx.fillStyle = fg.color;
                    ctx.font = 'bold 10px monospace';
                    ctx.fillText(fg.label, fg.x, fg.y + fg.radius + 14);
                }
            }

            // 5. Render 3 Prompt Fast Neutrons with Glowing Trails
            for (const pn of state.promptNeutrons) {
                if (pn.trail.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(pn.trail[0].x, pn.trail[0].y);
                    for (let ti = 1; ti < pn.trail.length; ti++) {
                        ctx.lineTo(pn.trail[ti].x, pn.trail[ti].y);
                    }
                    ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
                    ctx.lineWidth = 2.5;
                    ctx.stroke();
                }

                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#fbbf24';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(pn.x, pn.y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('¹n (Prompt 2 MeV)', pn.x, pn.y - 10);
            }

            // 6. Fission Flashes
            for (const f of this.flashes) {
                const flashGrad = ctx.createRadialGradient(f.x, f.y, 1, f.x, f.y, f.radius);
                flashGrad.addColorStop(0, `rgba(255, 255, 255, ${f.opacity})`);
                flashGrad.addColorStop(0.4, `rgba(245, 158, 11, ${f.opacity * 0.8})`);
                flashGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
                ctx.fillStyle = flashGrad;
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            // 7. Interactive Insight Card when split completes
            if (state.stage === 'insight') {
                const cardW = Math.min(480, w - 40);
                const cardH = 88;
                const cardX = (w - cardW) / 2;
                const cardY = h - cardH - 48;

                ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
                ctx.strokeStyle = '#00d4ff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(cardX, cardY, cardW, cardH, 10);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#38bdf8';
                ctx.font = 'bold 12px var(--font-ui), sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('💡 Pedagogical Insight: Fission Multiplier Concept', w / 2, cardY + 22);

                ctx.fillStyle = '#cbd5e1';
                ctx.font = '11px var(--font-ui), sans-serif';
                ctx.fillText('1 Thermal Neutron absorbed → 3 Prompt Neutrons ejected!', w / 2, cardY + 42);
                ctx.fillText('In a dense fuel matrix, this multiplies exponentially: 1 ➔ 3 ➔ 9 ➔ 27 atoms!', w / 2, cardY + 58);

                ctx.fillStyle = '#4ade80';
                ctx.font = 'bold 11px monospace';
                ctx.fillText('👉 Switch to "Scenario 2: Chain Sandbox" to trigger exponential cascades!', w / 2, cardY + 76);
            }
        }

        renderMultiAtomScenario(ctx, w, h) {
            // Ambient Cherenkov Radiation Glow
            const cherenkovAlpha = Math.min(0.40, (this.neutrons.length / 140) * 0.40);
            if (cherenkovAlpha > 0.01) {
                const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.55);
                grad.addColorStop(0, `rgba(0, 212, 255, ${cherenkovAlpha})`);
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);
            }

            // Moderator Background Tint
            const modSpec = MODERATOR_SPECS[this.moderatorType];
            if (modSpec && modSpec.color !== 'transparent') {
                ctx.fillStyle = modSpec.color;
                ctx.fillRect(0, 0, w, h);
            }

            // Subtle Grid Lattice Lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.lineWidth = 1;
            for (let gx = 50; gx < w; gx += 50) {
                ctx.beginPath();
                ctx.moveTo(gx, 0);
                ctx.lineTo(gx, h);
                ctx.stroke();
            }
            for (let gy = 40; gy < h; gy += 40) {
                ctx.beginPath();
                ctx.moveTo(0, gy);
                ctx.lineTo(w, gy);
                ctx.stroke();
            }

            // Control Rods (in Reactor Core mode)
            if (this.currentScenario === 'reactor_core') {
                const rodPositionsX = [w * 0.28, w * 0.50, w * 0.72];
                const rodDepth = h * 0.88 * this.controlRodInsertion;
                const rodW = 18;

                for (const rx of rodPositionsX) {
                    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
                    ctx.fillRect(rx - rodW / 2, 0, rodW, h * 0.90);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                    ctx.strokeRect(rx - rodW / 2, 0, rodW, h * 0.90);

                    if (rodDepth > 4) {
                        const bladeGrad = ctx.createLinearGradient(rx - rodW / 2, 0, rx + rodW / 2, 0);
                        bladeGrad.addColorStop(0, '#334155');
                        bladeGrad.addColorStop(0.5, '#64748b');
                        bladeGrad.addColorStop(1, '#334155');
                        ctx.fillStyle = bladeGrad;
                        ctx.fillRect(rx - rodW / 2 + 1, 0, rodW - 2, rodDepth);

                        ctx.fillStyle = '#f59e0b';
                        ctx.fillRect(rx - rodW / 2 + 2, Math.max(0, rodDepth - 10), rodW - 4, 8);
                    }
                }
            }

            // Fissile Nuclei Atoms
            const fuelSpec = FUEL_SPECS[this.fuelType] || FUEL_SPECS['U235'];
            for (const t of this.targets) {
                if (t.fissioned) {
                    ctx.beginPath();
                    ctx.arc(t.x, t.y, t.radius * 0.85, 0, Math.PI * 2);
                    ctx.fillStyle = '#1e293b';
                    ctx.fill();
                    ctx.strokeStyle = '#334155';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();

                    ctx.fillStyle = '#64748b';
                    ctx.font = 'bold 10px monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('⚡', t.x, t.y);
                } else {
                    const pulse = Math.sin(t.pulsePhase) * 1.5;
                    const r = t.radius + pulse;

                    ctx.beginPath();
                    ctx.arc(t.x, t.y, r + 4, 0, Math.PI * 2);
                    ctx.fillStyle = fuelSpec.glowColor;
                    ctx.fill();

                    const coreGrad = ctx.createRadialGradient(t.x - r * 0.3, t.y - r * 0.3, 1, t.x, t.y, r);
                    coreGrad.addColorStop(0, '#ffffff');
                    coreGrad.addColorStop(0.35, fuelSpec.color);
                    coreGrad.addColorStop(1, '#064e3b');
                    ctx.fillStyle = coreGrad;

                    ctx.beginPath();
                    ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
                    ctx.lineWidth = 1.2;
                    ctx.stroke();

                    ctx.fillStyle = '#000000';
                    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(fuelSpec.symbol, t.x, t.y);
                }
            }

            // Daughter Fragments
            for (const fg of this.fragments) {
                ctx.fillStyle = fg.color;
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(fg.symbol, fg.x, fg.y);
            }

            // Flashes
            for (const f of this.flashes) {
                const flashGrad = ctx.createRadialGradient(f.x, f.y, 1, f.x, f.y, f.radius);
                flashGrad.addColorStop(0, `rgba(255, 255, 255, ${f.opacity})`);
                flashGrad.addColorStop(0.4, `rgba(245, 158, 11, ${f.opacity * 0.8})`);
                flashGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
                ctx.fillStyle = flashGrad;
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            // Neutrons with glowing trails
            for (const n of this.neutrons) {
                if (n.trail.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(n.trail[0].x, n.trail[0].y);
                    for (let ti = 1; ti < n.trail.length; ti++) {
                        ctx.lineTo(n.trail[ti].x, n.trail[ti].y);
                    }
                    ctx.strokeStyle = n.isThermal ? 'rgba(0, 212, 255, 0.45)' : 'rgba(251, 191, 36, 0.45)';
                    ctx.lineWidth = n.isThermal ? 2.5 : 1.8;
                    ctx.stroke();
                }

                ctx.beginPath();
                ctx.arc(n.x, n.y, n.isThermal ? 4.5 : 3.5, 0, Math.PI * 2);
                ctx.fillStyle = n.isThermal ? '#00d4ff' : '#ffffff';
                ctx.shadowColor = n.isThermal ? '#00d4ff' : '#fbbf24';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Bottom Telemetry Bar
            const barH = 32;
            const barY = h - barH - 8;
            const barX = 10;
            const barW = w - 20;

            ctx.fillStyle = 'rgba(10, 15, 29, 0.92)';
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.40)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.roundRect(barX, barY, barW, barH, 7);
            ctx.fill();
            ctx.stroke();

            let kColor = '#10b981';
            let kLabel = 'SUBCRITICAL';
            if (this.keff >= 0.99 && this.keff <= 1.02) {
                kColor = '#38bdf8';
                kLabel = 'CRITICAL';
            } else if (this.keff > 1.02) {
                kColor = '#ef4444';
                kLabel = 'SUPERCRITICAL';
            }

            ctx.font = 'bold 11px monospace';
            ctx.textBaseline = 'middle';
            const midY = barY + barH / 2;

            if (barW < 360) {
                ctx.fillStyle = '#38bdf8';
                ctx.fillText(`⚡ ${this.currentPowerMW.toFixed(0)} MW`, barX + 8, midY);
                ctx.fillStyle = '#fbbf24';
                ctx.fillText(`⭐ ${this.score} [${kLabel}]`, barX + barW * 0.50, midY);
            } else {
                const colW = barW / 4;
                ctx.fillStyle = '#38bdf8';
                ctx.fillText(`⚡ ${this.currentPowerMW.toFixed(0)} MW`, barX + 8, midY);

                ctx.fillStyle = '#cbd5e1';
                ctx.fillText(`🎯 ${this.fissionsTotal}/${this.targets.length}`, barX + colW + 4, midY);

                ctx.fillStyle = kColor;
                ctx.fillText(`k: ${this.keff.toFixed(2)} [${kLabel}]`, barX + colW * 2 + 4, midY);

                ctx.fillStyle = '#fbbf24';
                const comboText = this.chainCombo > 1 ? `x${this.chainCombo}🔥` : `⭐ ${this.score}`;
                ctx.fillText(comboText, barX + colW * 3 + 4, midY);
            }
        }
    }

    // Attach to Global Scope
    window.ChainReactionSimulationEngine = ChainReactionSimulationEngine;
    window.FUEL_SPECS = FUEL_SPECS;
    window.MODERATOR_SPECS = MODERATOR_SPECS;
    window.chainReactionEngine = new ChainReactionSimulationEngine();

})();
