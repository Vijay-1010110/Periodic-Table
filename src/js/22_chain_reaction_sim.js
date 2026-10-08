/**
 * PERIODICA 3D - Nuclear Chain Reaction Simulation & Interactive Game Engine
 * Real-time Fission Dynamics, Neutron Transport, Moderation & Criticality Game Suite
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
            color: '#64748b',
            glowColor: 'rgba(100, 116, 139, 0.45)',
            fissionQMeV: 205.0,
            avgPromptNeutrons: 2.50,
            thermalCrossSectionBarns: 0.00002, // Non-fissile to thermal
            fastCrossSectionBarns: 0.60,
            delayedFraction: 0.0157,
            desc: 'Fertile isotope; captures thermal neutrons into Pu-239; fissions only with energetic fast neutrons.'
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
            // Save trail for visual clarity
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 5) this.trail.shift();

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

            // Natural decay / absorption loss
            if (this.age > 7.0) {
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
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = 6;
            this.maxRadius = 46;
            this.opacity = 1.0;
        }

        update(dt) {
            this.radius += 110 * dt;
            this.opacity -= 2.4 * dt;
            return this.opacity > 0;
        }
    }

    // Daughter fission fragments flying outward: Krypton-92 and Barium-141
    class FissionFragment {
        constructor(x, y, symbol, color, vx, vy) {
            this.x = x;
            this.y = y;
            this.symbol = symbol;
            this.color = color;
            this.vx = vx;
            this.vy = vy;
            this.opacity = 1.0;
            this.age = 0;
        }

        update(dt) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.age += dt;
            this.opacity -= 1.8 * dt;
            return this.opacity > 0;
        }
    }

    // Floating Game Score & Energy Popups
    class FloatingScoreText {
        constructor(x, y, text, color = '#fbbf24') {
            this.x = x;
            this.y = y;
            this.text = text;
            this.color = color;
            this.opacity = 1.0;
            this.vy = -36;
        }

        update(dt) {
            this.y += this.vy * dt;
            this.opacity -= 1.3 * dt;
            return this.opacity > 0;
        }
    }

    /**
     * Master ChainReactionSimulationEngine with Game Progression & Step Narrator
     */
    class ChainReactionSimulationEngine {
        constructor() {
            this.fuelType = 'U235';
            this.moderatorType = 'light_water';
            this.controlRodInsertion = 0.35; // 35% inserted
            this.targetCount = 70;
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
            this.stepHighlightTimer = 0;
            this.reactionNarrative = 'Ready to launch! Tap "Fire Neutron" or tap anywhere in the reactor to start the fission process.';

            // Missions System
            this.gameMissions = [
                {
                    id: 'm1',
                    title: 'The First Spark 🎯',
                    desc: 'Fire a neutron and trigger your first nuclear fission!',
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
                    desc: 'Reach supercritical power (>2,000 MW) and execute an emergency SCRAM before temperature critical!',
                    goal: 1,
                    current: 0,
                    completed: false,
                    badge: 'Meltdown Hero 🛡️'
                }
            ];

            this.initChamber();
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
            this.activeReactionStep = 1;
            this.reactionNarrative = 'Reactor chamber ready. Fire a neutron to initiate the nuclear fission process!';

            this.repositionLattice(this.width, this.height);
        }

        repositionLattice(w, h) {
            this.width = Math.max(320, w);
            this.height = Math.max(240, h);
            this.targets = [];

            // Compute optimal grid layout based on viewport dimensions
            const cols = Math.max(6, Math.min(12, Math.floor(this.width / 62)));
            const rows = Math.max(4, Math.min(8, Math.floor(this.height / 54)));
            const cellRadius = Math.max(13, Math.min(18, Math.floor(Math.min(this.width / cols, this.height / rows) * 0.28)));

            const marginX = Math.max(35, this.width * 0.06);
            const marginTop = Math.max(88, this.height * 0.22);
            const marginBottom = 48;
            const spanW = this.width - marginX * 2;
            const spanH = Math.max(120, this.height - marginTop - marginBottom);

            const gapX = spanW / Math.max(1, cols - 1);
            const gapY = spanH / Math.max(1, rows - 1);

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const jitterX = (Math.random() - 0.5) * 4;
                    const jitterY = (Math.random() - 0.5) * 4;
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
         * Fire a neutron from injector nozzle or direct touch
         */
        injectNeutron(x = 35, y = this.height / 2, angleRad = (Math.random() - 0.5) * 0.35, speed = 280) {
            const vx = Math.cos(angleRad) * speed;
            const vy = Math.sin(angleRad) * speed;
            this.neutrons.push(new Neutron(x, y, vx, vy, false));

            this.activeReactionStep = 1;
            this.reactionNarrative = '🎯 Step 1: Free neutron launched into reactor core traveling toward ²³⁵U fuel atoms!';
            this.updateDOMStepper();

            if (window.physicsAudio) {
                window.physicsAudio.playNeutronGun();
            }
        }

        /**
         * Aim and fire toward target coordinates
         */
        aimAndFire(targetX, targetY) {
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

        /**
         * Emergency SCRAM: Control rods slam shut (100%) to quench runaway reaction
         */
        triggerSCRAM() {
            this.scramActive = true;
            this.controlRodInsertion = 1.0;
            this.chainCombo = 0;
            this.reactionNarrative = '🚨 EMERGENCY SCRAM ACTIVATED! Control rods fully lowered to 100% — absorbing all free neutrons!';
            this.updateDOMStepper();

            // Check Mission 4
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
            this.floatingTexts.push(new FloatingScoreText(this.width / 2, this.height * 0.35, `🏆 ${mission.title} COMPLETED! +500 PTS`, '#4ade80'));
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
            const fuelSpec = FUEL_SPECS[this.fuelType] || FUEL_SPECS['U235'];
            const modSpec = MODERATOR_SPECS[this.moderatorType] || MODERATOR_SPECS['light_water'];

            // Combo Decay
            if (this.comboTimer > 0) {
                this.comboTimer -= dt;
                if (this.comboTimer <= 0) {
                    this.chainCombo = 0;
                }
            }

            // Pulse target animations
            for (const t of this.targets) {
                t.update(dt);
            }

            let newNeutrons = [];
            let fissionsThisStep = 0;

            // Control Rod vertical barrier geometry
            const rodPositionsX = [this.width * 0.28, this.width * 0.50, this.width * 0.72];
            const rodMaxDepth = this.height * 0.88;
            const rodCurrentDepth = rodMaxDepth * this.controlRodInsertion;

            // Update Neutrons
            for (let i = 0; i < this.neutrons.length; i++) {
                const n = this.neutrons[i];
                n.update(dt, this.width, this.height, modSpec);
                if (!n.alive) continue;

                // Check Control Rod Absorption
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

                // Check Fissile Nucleus Collision
                for (let j = 0; j < this.targets.length; j++) {
                    const target = this.targets[j];
                    if (target.fissioned) continue;

                    const dx = n.x - target.x;
                    const dy = n.y - target.y;
                    const distSq = dx * dx + dy * dy;

                    const baseProb = n.isThermal ? 0.88 : 0.22;
                    const effectiveRadius = n.isThermal ? (target.radius + 8) : (target.radius + 3);

                    if (distSq < effectiveRadius * effectiveRadius) {
                        if (Math.random() < baseProb) {
                            // FISSION EVENT OCCURS!
                            target.fissioned = true;
                            n.alive = false;
                            fissionsThisStep++;
                            this.fissionsTotal++;
                            this.chainCombo++;
                            this.comboTimer = 1.3;
                            this.score += 200 + this.chainCombo * 25;

                            // Spawn Fission Flash
                            this.flashes.push(new FissionFlash(target.x, target.y));

                            // Spawn Daughter Fission Fragments (Krypton & Barium splitting)
                            const splitAngle = Math.random() * Math.PI;
                            const fragSpeed = 70;
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

                            // Floating Game Score Text
                            this.floatingTexts.push(new FloatingScoreText(
                                target.x, target.y - 14,
                                `+${fuelSpec.fissionQMeV.toFixed(0)} MeV ⚡`,
                                '#fbbf24'
                            ));

                            // Emit 2 to 3 prompt neutrons in random directions
                            const numEmitted = Math.random() < 0.45 ? 2 : 3;
                            for (let k = 0; k < numEmitted; k++) {
                                const angle = Math.random() * Math.PI * 2;
                                const speed = 250 + Math.random() * 90;
                                newNeutrons.push(new Neutron(
                                    target.x, target.y,
                                    Math.cos(angle) * speed,
                                    Math.sin(angle) * speed,
                                    false
                                ));
                            }

                            // Update Reaction Process Stepper
                            if (this.chainCombo > 1) {
                                this.activeReactionStep = 4;
                                this.reactionNarrative = `🔄 Step 4: Multiplier Active! Chain combo x${this.chainCombo} — emitted neutrons striking adjacent fuel cells!`;
                            } else {
                                this.activeReactionStep = 3;
                                this.reactionNarrative = `💥 Step 3: FISSION! Nucleus split into Krypton & Barium, releasing +${fuelSpec.fissionQMeV.toFixed(0)} MeV and 2-3 prompt neutrons!`;
                            }

                            // Check Missions
                            const m1 = this.gameMissions.find(m => m.id === 'm1');
                            if (m1 && !m1.completed) {
                                m1.current = 1;
                                m1.completed = true;
                                this.score += 250;
                                this.onMissionCompleted(m1);
                            }

                            const m2 = this.gameMissions.find(m => m.id === 'm2');
                            if (m2 && !m2.completed) {
                                m2.current = Math.max(m2.current, this.chainCombo);
                                if (m2.current >= m2.goal) {
                                    m2.completed = true;
                                    this.score += 500;
                                    this.onMissionCompleted(m2);
                                }
                            }

                            if (window.physicsAudio) {
                                window.physicsAudio.playFissionClick();
                            }
                            break;
                        }
                    }
                }
            }

            // Filter dead neutrons & append newly born neutrons
            this.neutrons = this.neutrons.filter(n => n.alive).concat(newNeutrons);

            // Cap max neutrons for mobile 60fps stability
            if (this.neutrons.length > 280) {
                this.neutrons = this.neutrons.slice(-280);
            }

            // Update Flashes, Fragments & Floating texts
            this.flashes = this.flashes.filter(f => f.update(dt));
            this.fragments = this.fragments.filter(fg => fg.update(dt));
            this.floatingTexts = this.floatingTexts.filter(ft => ft.update(dt));

            // Calculate Effective Multiplication Factor (k_eff)
            if (this.neutrons.length > 0) {
                const birthRate = newNeutrons.length;
                this.keff = (birthRate / Math.max(1, (this.neutrons.length - birthRate) * 0.16)) * 0.96;
            } else {
                this.keff = 0.0;
            }

            this.promptCritical = this.keff > 1.03 && this.neutrons.length > 25;
            this.currentPowerMW = fissionsThisStep * fuelSpec.fissionQMeV * 1.602e-13 * 1.2e6;

            // Check Mission 3 (Stable Criticality)
            const m3 = this.gameMissions.find(m => m.id === 'm3');
            if (m3 && !m3.completed) {
                if (this.keff >= 0.99 && this.keff <= 1.02 && this.neutrons.length > 5) {
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

            // Idle reset narrative
            if (this.neutrons.length === 0 && fissionsThisStep === 0 && !this.scramActive) {
                if (this.activeReactionStep > 1) {
                    this.activeReactionStep = 1;
                    this.reactionNarrative = 'Core quiet. Tap anywhere on the grid or press "Fire Neutron" to start the reaction!';
                    this.updateDOMStepper();
                }
            }
        }

        updateDOMStepper() {
            // Update Stepper Step Highlights
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

            // Update Narrator Banner Text
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

            // Recompute lattice if geometry shifted significantly
            if (Math.abs(this.width - clientW) > 25 || Math.abs(this.height - clientH) > 25) {
                this.repositionLattice(clientW, clientH);
            }

            ctx.save();
            ctx.scale(dpr, dpr);

            const w = this.width;
            const h = this.height;

            ctx.clearRect(0, 0, w, h);

            // 1. Ambient Cherenkov Radiation Glow
            const cherenkovAlpha = Math.min(0.40, (this.neutrons.length / 140) * 0.40);
            if (cherenkovAlpha > 0.01) {
                const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.55);
                grad.addColorStop(0, `rgba(0, 212, 255, ${cherenkovAlpha})`);
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);
            }

            // 2. Moderator Background Tint
            const modSpec = MODERATOR_SPECS[this.moderatorType];
            if (modSpec && modSpec.color !== 'transparent') {
                ctx.fillStyle = modSpec.color;
                ctx.fillRect(0, 0, w, h);
            }

            // 3. Grid Lattice subtle background lines
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

            // 4. Control Rods (Boron Carbide Absorber Blades)
            const rodPositionsX = [w * 0.28, w * 0.50, w * 0.72];
            const rodDepth = h * 0.88 * this.controlRodInsertion;
            const rodW = 18;

            for (const rx of rodPositionsX) {
                // Rod channel casing
                ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
                ctx.fillRect(rx - rodW / 2, 0, rodW, h * 0.90);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.strokeRect(rx - rodW / 2, 0, rodW, h * 0.90);

                if (rodDepth > 4) {
                    // Active Boron blade
                    const bladeGrad = ctx.createLinearGradient(rx - rodW / 2, 0, rx + rodW / 2, 0);
                    bladeGrad.addColorStop(0, '#334155');
                    bladeGrad.addColorStop(0.5, '#64748b');
                    bladeGrad.addColorStop(1, '#334155');
                    ctx.fillStyle = bladeGrad;
                    ctx.fillRect(rx - rodW / 2 + 1, 0, rodW - 2, rodDepth);

                    // Caution Hazard Stripes at bottom tip
                    ctx.fillStyle = '#f59e0b';
                    ctx.fillRect(rx - rodW / 2 + 2, Math.max(0, rodDepth - 10), rodW - 4, 8);
                }
            }

            // 5. Fissile Nuclei (Atoms)
            const fuelSpec = FUEL_SPECS[this.fuelType] || FUEL_SPECS['U235'];
            for (const t of this.targets) {
                if (t.fissioned) {
                    // Spent / Split atom crater
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
                    // Active Fuel Atom with glowing orbital shell
                    const pulse = Math.sin(t.pulsePhase) * 1.5;
                    const r = t.radius + pulse;

                    // Outer orbital aura
                    ctx.beginPath();
                    ctx.arc(t.x, t.y, r + 4, 0, Math.PI * 2);
                    ctx.fillStyle = fuelSpec.glowColor;
                    ctx.fill();

                    // Solid atom core
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

                    // Element Symbol (Crisp, bold, large readable typography)
                    ctx.fillStyle = '#000000';
                    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(fuelSpec.symbol, t.x, t.y);
                }
            }

            // 6. Daughter Fragments Flying Outward
            for (const fg of this.fragments) {
                ctx.fillStyle = fg.color;
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(fg.symbol, fg.x, fg.y);
            }

            // 7. Fission Shockwave Flashes
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

            // 8. Neutrons with Glowing Trails
            for (const n of this.neutrons) {
                // Trail
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

                // Head
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.isThermal ? 4.5 : 3.5, 0, Math.PI * 2);
                ctx.fillStyle = n.isThermal ? '#00d4ff' : '#ffffff';
                ctx.shadowColor = n.isThermal ? '#00d4ff' : '#fbbf24';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // 9. Floating Score & Energy Labels (+200 MeV)
            for (const ft of this.floatingTexts) {
                ctx.fillStyle = ft.color;
                ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
                ctx.shadowBlur = 4;
                ctx.fillText(ft.text, ft.x, ft.y);
                ctx.shadowBlur = 0;
            }

            // 10. Sci-Fi Game Bottom Telemetry Bar (Docked cleanly across bottom, ZERO overlap!)
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

            // Status label
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
                // Compact 2-column mode for narrow mobile / split screens
                ctx.fillStyle = '#38bdf8';
                ctx.fillText(`⚡ ${this.currentPowerMW.toFixed(0)} MW`, barX + 8, midY);
                ctx.fillStyle = '#fbbf24';
                ctx.fillText(`⭐ ${this.score} [${kLabel}]`, barX + barW * 0.50, midY);
            } else {
                const colW = barW / 4;
                // Segment 1: Power
                ctx.fillStyle = '#38bdf8';
                ctx.fillText(`⚡ ${this.currentPowerMW.toFixed(0)} MW`, barX + 8, midY);

                // Segment 2: Fissions
                ctx.fillStyle = '#cbd5e1';
                ctx.fillText(`🎯 ${this.fissionsTotal}/${this.targets.length}`, barX + colW + 4, midY);

                // Segment 3: k-eff
                ctx.fillStyle = kColor;
                ctx.fillText(`k: ${this.keff.toFixed(2)} [${kLabel}]`, barX + colW * 2 + 4, midY);

                // Segment 4: Score & Combo
                ctx.fillStyle = '#fbbf24';
                const comboText = this.chainCombo > 1 ? `x${this.chainCombo}🔥` : `⭐ ${this.score}`;
                ctx.fillText(comboText, barX + colW * 3 + 4, midY);
            }

            ctx.restore();
        }
    }

    // Attach to Global Scope
    window.ChainReactionSimulationEngine = ChainReactionSimulationEngine;
    window.FUEL_SPECS = FUEL_SPECS;
    window.MODERATOR_SPECS = MODERATOR_SPECS;
    window.chainReactionEngine = new ChainReactionSimulationEngine();

})();
