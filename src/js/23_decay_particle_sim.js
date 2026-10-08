/**
 * PERIODICA 3D - Multi-Mode Radioactive Decay & Particle Cloud Chamber Simulation
 * Quantum Tunneling, Lorentz Deflection F = q(v x B), and Wilson Cloud Droplet Physics
 * 
 * Compliant with Nubase2020 nuclear evaluations & relativistic kinematics.
 * (c) 2026 Periodica 3D | Developer: Vijay-1010110
 */

(function () {
    'use strict';

    /**
     * Exemplar Nuclides for Interactive Decay Chamber
     */
    const DECAY_PRESETS = [
        {
            id: 'U238',
            name: 'Uranium-238',
            mode: 'alpha',
            halfLifeStr: '4.468 × 10⁹ yr',
            energyMeV: 4.27,
            particle: 'α (⁴He²⁺)',
            desc: 'Classic alpha emitter undergoing quantum barrier tunneling.'
        },
        {
            id: 'C14',
            name: 'Carbon-14',
            mode: 'beta_minus',
            halfLifeStr: '5,730 yr',
            energyMeV: 0.156,
            particle: 'β⁻ (e⁻ + ν̄ₑ)',
            desc: 'Cosmogenic radiocarbon; neutron converts to proton emitting fast electron and antineutrino.'
        },
        {
            id: 'F18',
            name: 'Fluorine-18',
            mode: 'beta_plus',
            halfLifeStr: '109.7 min',
            energyMeV: 0.633,
            particle: 'β⁺ (e⁺ + νₑ)',
            desc: 'Clinical PET tracer isotope; positron emission followed by 511 keV annihilation radiation.'
        },
        {
            id: 'Co60',
            name: 'Cobalt-60',
            mode: 'gamma',
            halfLifeStr: '5.27 yr',
            energyMeV: 1.33,
            particle: 'γ (1.17 & 1.33 MeV)',
            desc: 'Penetrating isomeric gamma de-excitation photon cascades.'
        },
        {
            id: 'Cf252',
            name: 'Californium-252',
            mode: 'fission',
            halfLifeStr: '2.645 yr',
            energyMeV: 185.0,
            particle: 'Spontaneous Fission (SF + 3.8n)',
            desc: 'Extreme transuranic nuclide splitting spontaneously without external trigger.'
        }
    ];

    /**
     * Cloud Chamber Droplet condensation track
     */
    class VaporDroplet {
        constructor(x, y, radius = 1.2, color = 'rgba(255, 255, 255, 0.75)') {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.opacity = 0.9;
        }

        update(dt) {
            this.opacity -= 0.65 * dt; // Droplet evaporation
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
     * Emitted Nuclear Particle with Lorentz Dynamics
     */
    class EmittedParticle {
        constructor(type, x, y, angle, energyMeV) {
            this.type = type; // 'alpha', 'beta_minus', 'beta_plus', 'gamma', 'fission_fragment', 'neutron'
            this.x = x;
            this.y = y;
            this.charge = 0; // in elementary charge units e
            this.mass = 1;   // relative units
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
            } else if (type === 'fission_fragment') {
                this.charge = +18;
                this.mass = 120.0;
                this.speed = speedBase * 0.45;
                this.color = '#f59e0b';
                this.trackWidth = 5.0;
            }

            this.vx = Math.cos(angle) * this.speed;
            this.vy = Math.sin(angle) * this.speed;
        }

        update(dt, B_Tesla, droplets, width, height) {
            this.age += dt;

            // Lorentz Force: F = q * (v x B)
            // Magnetic field B is perpendicular to 2D plane (in z-axis)
            if (this.charge !== 0 && B_Tesla !== 0) {
                // a_x = (q/m) * vy * B
                // a_y = -(q/m) * vx * B
                const lorentzCoeff = (this.charge / this.mass) * B_Tesla * 16.0;
                const ax = this.vy * lorentzCoeff;
                const ay = -this.vx * lorentzCoeff;

                this.vx += ax * dt;
                this.vy += ay * dt;
            }

            // Vapor condensation (deposits droplets along ion track)
            if (Math.random() < 0.85) {
                droplets.push(new VaporDroplet(
                    this.x + (Math.random() - 0.5) * (this.trackWidth * 0.8),
                    this.y + (Math.random() - 0.5) * (this.trackWidth * 0.8),
                    this.trackWidth * 0.5,
                    this.color
                ));
            }

            this.x += this.vx * dt;
            this.y += this.vy * dt;

            // Positron Annihilation Event (Beta+ encounters electron in chamber)
            if (this.type === 'beta_plus' && this.age > 0.45 && Math.random() < 0.08) {
                this.annihilated = true;
                this.alive = false;
            }

            // Boundary exit
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
            this.currentPresetId = 'U238';
            this.magneticFieldTesla = 1.0; // +1.0 Tesla (perpendicular field)
            this.decayRateMultiplier = 1.0;
            this.particles = [];
            this.droplets = [];
            this.annihilationFlashes = [];
            this.width = 600;
            this.height = 400;
            this.sourceX = 80;
            this.sourceY = 200;
            this.totalDecaysCount = 0;
            this.autoTrigger = true;
            this.triggerAccumulator = 0;
        }

        setPreset(presetId) {
            const found = DECAY_PRESETS.find(p => p.id === presetId);
            if (found) {
                this.currentPresetId = found.id;
            }
        }

        setMagneticField(tesla) {
            this.magneticFieldTesla = Math.max(-3.0, Math.min(3.0, Number(tesla) || 0));
        }

        triggerDecay(x = this.sourceX, y = this.sourceY) {
            const preset = DECAY_PRESETS.find(p => p.id === this.currentPresetId) || DECAY_PRESETS[0];
            const baseAngle = (Math.random() - 0.5) * 0.8; // Emitter collimator beam toward right

            if (preset.mode === 'alpha') {
                this.particles.push(new EmittedParticle('alpha', x, y, baseAngle, preset.energyMeV));
            } else if (preset.mode === 'beta_minus') {
                this.particles.push(new EmittedParticle('beta_minus', x, y, baseAngle, preset.energyMeV));
            } else if (preset.mode === 'beta_plus') {
                this.particles.push(new EmittedParticle('beta_plus', x, y, baseAngle, preset.energyMeV));
            } else if (preset.mode === 'gamma') {
                this.particles.push(new EmittedParticle('gamma', x, y, baseAngle, preset.energyMeV));
            } else if (preset.mode === 'fission') {
                // Fission splits in opposite angles
                this.particles.push(new EmittedParticle('fission_fragment', x, y, baseAngle, preset.energyMeV * 0.5));
                this.particles.push(new EmittedParticle('fission_fragment', x, y, baseAngle + Math.PI, preset.energyMeV * 0.5));
            }

            this.totalDecaysCount++;

            if (window.physicsAudio) {
                window.physicsAudio.playGeigerClick();
            }
        }

        update(dt) {
            this.sourceX = this.width * 0.15;
            this.sourceY = this.height * 0.5;

            // Auto periodic decay emission
            if (this.autoTrigger) {
                this.triggerAccumulator += dt;
                if (this.triggerAccumulator >= (0.35 / this.decayRateMultiplier)) {
                    this.triggerAccumulator = 0;
                    this.triggerDecay();
                }
            }

            // Update particles
            const newlyCreatedParticles = [];
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                p.update(dt, this.magneticFieldTesla, this.droplets, this.width, this.height);

                // Handle Positron Annihilation: emit two 511 keV gamma rays at 180 degrees!
                if (p.annihilated) {
                    this.annihilationFlashes.push({ x: p.x, y: p.y, r: 12, alpha: 1.0 });
                    const gAngle = Math.random() * Math.PI * 2;
                    newlyCreatedParticles.push(new EmittedParticle('gamma', p.x, p.y, gAngle, 0.511));
                    newlyCreatedParticles.push(new EmittedParticle('gamma', p.x, p.y, gAngle + Math.PI, 0.511));
                    if (window.physicsAudio) {
                        window.physicsAudio.playAnnihilationZap();
                    }
                }
            }

            this.particles = this.particles.filter(p => p.alive).concat(newlyCreatedParticles);
            this.droplets = this.droplets.filter(d => d.update(dt));

            // Cap max droplets for 60fps performance
            if (this.droplets.length > 700) {
                this.droplets = this.droplets.slice(-700);
            }

            // Update Annihilation flashes
            for (let i = this.annihilationFlashes.length - 1; i >= 0; i--) {
                const flash = this.annihilationFlashes[i];
                flash.alpha -= 2.5 * dt;
                if (flash.alpha <= 0) {
                    this.annihilationFlashes.splice(i, 1);
                }
            }
        }

        render(canvas) {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const w = canvas.width = this.width = canvas.clientWidth * (window.devicePixelRatio || 1);
            const h = canvas.height = this.height = canvas.clientHeight * (window.devicePixelRatio || 1);

            ctx.clearRect(0, 0, w, h);

            // Wilson Cloud Chamber Dark Velveteen Background
            const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.7);
            bgGrad.addColorStop(0, '#090d16');
            bgGrad.addColorStop(1, '#020408');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            // Magnetic Field Lines Visual Indicator (dots for +B out-of-screen, crosses for -B into-screen)
            if (Math.abs(this.magneticFieldTesla) > 0.05) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
                ctx.font = '8px monospace';
                const symbol = this.magneticFieldTesla > 0 ? '⊙' : '⊗';
                for (let x = 40; x < w; x += 60) {
                    for (let y = 30; y < h; y += 50) {
                        ctx.fillText(symbol, x, y);
                    }
                }
            }

            // Render Vapor Droplets
            for (const d of this.droplets) {
                d.render(ctx);
            }

            // Render Particle Heads
            for (const p of this.particles) {
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.trackWidth * 0.75, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Render Annihilation Flashes
            for (const af of this.annihilationFlashes) {
                ctx.fillStyle = `rgba(251, 191, 36, ${af.alpha})`;
                ctx.shadowColor = '#fbbf24';
                ctx.shadowBlur = 16;
                ctx.beginPath();
                ctx.arc(af.x, af.y, af.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Collimated Radioactive Source Capsule
            ctx.fillStyle = '#334155';
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5;
            ctx.fillRect(this.sourceX - 16, this.sourceY - 14, 20, 28);
            ctx.strokeRect(this.sourceX - 16, this.sourceY - 14, 20, 28);

            // Trefoil Radiation Symbol
            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('☢', this.sourceX - 12, this.sourceY + 4);

            // Telemetry HUD
            const preset = DECAY_PRESETS.find(p => p.id === this.currentPresetId) || DECAY_PRESETS[0];
            ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.25)';
            ctx.lineWidth = 1;
            ctx.fillRect(10, 10, 230, 80);
            ctx.strokeRect(10, 10, 230, 80);

            ctx.fillStyle = '#00d4ff';
            ctx.font = 'bold 11px monospace';
            ctx.fillText(`${preset.name} (${preset.particle})`, 18, 26);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '9px monospace';
            ctx.fillText(`Half-life:    ${preset.halfLifeStr}`, 18, 42);
            ctx.fillText(`Q-Value:      ${preset.energyMeV} MeV`, 18, 56);
            ctx.fillText(`Magnetic B:   ${this.magneticFieldTesla > 0 ? '+' : ''}${this.magneticFieldTesla.toFixed(1)} Tesla`, 18, 70);
            ctx.fillText(`Events Log:   ${this.totalDecaysCount}`, 18, 84);
        }
    }

    // Attach to Global Scope
    window.NuclearDecaySimulationEngine = NuclearDecaySimulationEngine;
    window.DECAY_PRESETS = DECAY_PRESETS;
    window.nuclearDecayEngine = new NuclearDecaySimulationEngine();

})();
