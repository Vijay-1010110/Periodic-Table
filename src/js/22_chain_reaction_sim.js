/**
 * PERIODICA 3D - Nuclear Chain Reaction Simulation Engine
 * Real-time Fission Dynamics, Neutron Transport, Moderation & Criticality Physics
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
            fissionQMeV: 202.5,
            avgPromptNeutrons: 2.43,
            thermalCrossSectionBarns: 585.0,
            fastCrossSectionBarns: 1.25,
            delayedFraction: 0.0065,
            desc: 'Thermal fissile isotope used in commercial LWRs and historical enriched devices.'
        },
        'PU239': {
            name: 'Plutonium-239',
            symbol: '²³⁹Pu',
            color: '#f59e0b',
            fissionQMeV: 207.1,
            avgPromptNeutrons: 2.88,
            thermalCrossSectionBarns: 748.0,
            fastCrossSectionBarns: 1.80,
            delayedFraction: 0.0021,
            desc: 'High neutron yield fissile actinide; lower critical mass and rapid prompt response.'
        },
        'U238': {
            name: 'Uranium-238 (Depleted)',
            symbol: '²³⁸U',
            color: '#64748b',
            fissionQMeV: 205.0,
            avgPromptNeutrons: 2.50,
            thermalCrossSectionBarns: 0.00002, // Non-fissile to thermal
            fastCrossSectionBarns: 0.60, // Threshold > 1 MeV
            delayedFraction: 0.0157,
            desc: 'Fertile isotope; captures thermal neutrons into Pu-239; fissionable only by energetic fast neutrons.'
        }
    };

    /**
     * Moderator Characteristics (Elastic neutron energy loss: xi parameter)
     */
    const MODERATOR_SPECS = {
        'light_water': { name: 'Light Water (H₂O)', xi: 0.925, slowingRatio: 61, color: 'rgba(0, 212, 255, 0.15)' },
        'heavy_water': { name: 'Heavy Water (D₂O)', xi: 0.508, slowingRatio: 5670, color: 'rgba(59, 130, 246, 0.20)' },
        'graphite':    { name: 'Nuclear Graphite (C)', xi: 0.158, slowingRatio: 192, color: 'rgba(75, 85, 99, 0.25)' },
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
            this.energyMeV = isThermal ? 0.000000025 : 2.0; // 0.025 eV vs 2 MeV
            this.age = 0;
            this.alive = true;
        }

        update(dt, width, height, moderator) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.age += dt;

            // Moderator collisions (thermalization)
            if (!this.isThermal && moderator && moderator.xi > 0) {
                if (Math.random() < 0.04 * moderator.xi) {
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
            if (this.age > 8.0) {
                this.alive = false;
            }
        }
    }

    class FissileNucleus {
        constructor(x, y, fuelType = 'U235') {
            this.x = x;
            this.y = y;
            this.fuelType = fuelType;
            this.radius = 9;
            this.fissioned = false;
            this.excitation = 0;
        }
    }

    class FissionFlash {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = 4;
            this.maxRadius = 38;
            this.opacity = 1.0;
        }

        update(dt) {
            this.radius += 90 * dt;
            this.opacity -= 2.2 * dt;
            return this.opacity > 0;
        }
    }

    /**
     * Master ChainReactionSimulationEngine
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
            this.width = 600;
            this.height = 400;

            // Telemetry
            this.generationHistory = [];
            this.fissionsTotal = 0;
            this.currentPowerMW = 0;
            this.keff = 0.98;
            this.promptCritical = false;
            this.scramActive = false;

            this.initChamber();
        }

        initChamber() {
            this.targets = [];
            this.neutrons = [];
            this.flashes = [];
            this.fissionsTotal = 0;
            this.currentPowerMW = 0;
            this.scramActive = false;

            // Generate lattice of fissile nuclei inside chamber
            const cols = 10;
            const rows = 7;
            const startX = 60;
            const startY = 50;
            const gapX = (this.width - 120) / (cols - 1);
            const gapY = (this.height - 100) / (rows - 1);

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const jitterX = (Math.random() - 0.5) * 8;
                    const jitterY = (Math.random() - 0.5) * 8;
                    this.targets.push(new FissileNucleus(
                        startX + c * gapX + jitterX,
                        startY + r * gapY + jitterY,
                        this.fuelType
                    ));
                }
            }
        }

        /**
         * Inject a prompt trigger neutron from user tap or injector gun
         */
        injectNeutron(x = 30, y = this.height / 2, angleRad = (Math.random() - 0.5) * 0.4) {
            const speed = 260; // Simulation velocity
            const vx = Math.cos(angleRad) * speed;
            const vy = Math.sin(angleRad) * speed;
            this.neutrons.push(new Neutron(x, y, vx, vy, false));

            if (window.physicsAudio) {
                window.physicsAudio.playNeutronGun();
            }
        }

        setControlRods(percentage) {
            this.controlRodInsertion = Math.max(0, Math.min(1.0, Number(percentage) || 0));
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
         * Emergency SCRAM: 100% control rods immediately dropped
         */
        triggerSCRAM() {
            this.scramActive = true;
            this.controlRodInsertion = 1.0;
            if (window.physicsAudio) {
                window.physicsAudio.playScramAlarm();
            }
        }

        update(dt) {
            const fuelSpec = FUEL_SPECS[this.fuelType] || FUEL_SPECS['U235'];
            const modSpec = MODERATOR_SPECS[this.moderatorType] || MODERATOR_SPECS['light_water'];

            let newNeutrons = [];
            let fissionsThisStep = 0;

            // Control Rod vertical barrier geometry (e.g. 3 inserted blades)
            const rodPositionsX = [this.width * 0.28, this.width * 0.50, this.width * 0.72];
            const rodMaxDepth = this.height * 0.85;
            const rodCurrentDepth = rodMaxDepth * this.controlRodInsertion;

            // Update Neutrons
            for (let i = 0; i < this.neutrons.length; i++) {
                const n = this.neutrons[i];
                n.update(dt, this.width, this.height, modSpec);
                if (!n.alive) continue;

                // Check Control Rod Absorption
                let absorbedByRod = false;
                for (const rx of rodPositionsX) {
                    if (Math.abs(n.x - rx) < 10 && n.y < rodCurrentDepth) {
                        absorbedByRod = true;
                        n.alive = false;
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

                    // Cross section probability (Thermal neutrons have vastly higher cross-section)
                    const baseProb = n.isThermal ? 0.85 : 0.18;
                    const effectiveRadius = n.isThermal ? (target.radius + 6) : (target.radius + 2);

                    if (distSq < effectiveRadius * effectiveRadius) {
                        if (Math.random() < baseProb) {
                            // FISSION EVENT OCCURS!
                            target.fissioned = true;
                            n.alive = false;
                            fissionsThisStep++;
                            this.fissionsTotal++;

                            this.flashes.push(new FissionFlash(target.x, target.y));

                            // Emit 2 to 3 prompt neutrons in random directions
                            const numEmitted = Math.random() < 0.5 ? 2 : 3;
                            for (let k = 0; k < numEmitted; k++) {
                                const angle = Math.random() * Math.PI * 2;
                                const speed = 240 + Math.random() * 80;
                                newNeutrons.push(new Neutron(
                                    target.x, target.y,
                                    Math.cos(angle) * speed,
                                    Math.sin(angle) * speed,
                                    false
                                ));
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

            // Cap max neutrons for 60fps mobile stability
            if (this.neutrons.length > 350) {
                this.neutrons = this.neutrons.slice(-350);
            }

            // Update Flashes
            this.flashes = this.flashes.filter(f => f.update(dt));

            // Calculate Effective Multiplication Factor (k_eff)
            if (this.neutrons.length > 0) {
                const birthRate = newNeutrons.length;
                this.keff = (birthRate / Math.max(1, (this.neutrons.length - birthRate) * 0.15)) * 0.95;
            } else {
                this.keff = 0.0;
            }

            this.promptCritical = this.keff > 1.05 && this.neutrons.length > 30;
            this.currentPowerMW = fissionsThisStep * fuelSpec.fissionQMeV * 1.602e-13 * 1e6; // Instantaneous MW proxy
        }

        render(canvas) {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const w = canvas.width = this.width = canvas.clientWidth * (window.devicePixelRatio || 1);
            const h = canvas.height = this.height = canvas.clientHeight * (window.devicePixelRatio || 1);

            ctx.clearRect(0, 0, w, h);

            // Cherenkov Radiation Ambient Glow (as neutron population escalates)
            const cherenkovAlpha = Math.min(0.45, (this.neutrons.length / 180) * 0.45);
            if (cherenkovAlpha > 0.01) {
                const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.6);
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

            // Control Rods
            const rodPositionsX = [w * 0.28, w * 0.50, w * 0.72];
            const rodDepth = h * 0.85 * this.controlRodInsertion;
            ctx.fillStyle = '#475569';
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.5;

            for (const rx of rodPositionsX) {
                ctx.fillRect(rx - 7, 0, 14, rodDepth);
                ctx.strokeRect(rx - 7, 0, 14, rodDepth);

                // Boron Carbide Crosshatch
                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(rx - 4, rodDepth - 6, 8, 4);
                ctx.fillStyle = '#475569';
            }

            // Fissile Targets
            for (const t of this.targets) {
                ctx.beginPath();
                ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
                if (t.fissioned) {
                    ctx.fillStyle = '#334155';
                    ctx.fill();
                    ctx.strokeStyle = '#1e293b';
                    ctx.stroke();
                } else {
                    const fuelSpec = FUEL_SPECS[t.fuelType] || FUEL_SPECS['U235'];
                    ctx.fillStyle = fuelSpec.color;
                    ctx.shadowColor = fuelSpec.color;
                    ctx.shadowBlur = 8;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    // Label Z
                    ctx.fillStyle = '#000000';
                    ctx.font = 'bold 8px monospace';
                    ctx.fillText('92', t.x - 5, t.y + 3);
                }
            }

            // Fission Flashes
            for (const f of this.flashes) {
                const flashGrad = ctx.createRadialGradient(f.x, f.y, 1, f.x, f.y, f.radius);
                flashGrad.addColorStop(0, `rgba(255, 255, 255, ${f.opacity})`);
                flashGrad.addColorStop(0.5, `rgba(245, 158, 11, ${f.opacity * 0.7})`);
                flashGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
                ctx.fillStyle = flashGrad;
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            // Neutrons
            for (const n of this.neutrons) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.isThermal ? 3.5 : 2.5, 0, Math.PI * 2);
                ctx.fillStyle = n.isThermal ? '#00d4ff' : '#ffffff';
                ctx.shadowColor = n.isThermal ? '#00d4ff' : '#fbbf24';
                ctx.shadowBlur = n.isThermal ? 6 : 4;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Telemetry HUD Overlay
            ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 1;
            ctx.fillRect(10, 10, 190, 78);
            ctx.strokeRect(10, 10, 190, 78);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '10px monospace';
            ctx.fillText(`Free Neutrons:  ${this.neutrons.length}`, 18, 28);
            ctx.fillText(`Fissions Total: ${this.fissionsTotal}`, 18, 44);

            // K_eff Color Tag
            let kColor = '#10b981';
            let kLabel = 'SUBCRITICAL';
            if (this.keff >= 0.99 && this.keff <= 1.02) {
                kColor = '#38bdf8';
                kLabel = 'CRITICAL (STEADY)';
            } else if (this.keff > 1.02) {
                kColor = '#ef4444';
                kLabel = 'SUPERCRITICAL';
            }

            ctx.fillStyle = kColor;
            ctx.font = 'bold 11px monospace';
            ctx.fillText(`k-eff: ${this.keff.toFixed(3)} [${kLabel}]`, 18, 62);

            if (this.promptCritical) {
                ctx.fillStyle = '#f43f5e';
                ctx.font = 'bold 10px monospace';
                ctx.fillText(`⚠️ PROMPT RUNAWAY`, 18, 78);
            }
        }
    }

    // Attach to Global Scope
    window.ChainReactionSimulationEngine = ChainReactionSimulationEngine;
    window.FUEL_SPECS = FUEL_SPECS;
    window.MODERATOR_SPECS = MODERATOR_SPECS;
    window.chainReactionEngine = new ChainReactionSimulationEngine();

})();
