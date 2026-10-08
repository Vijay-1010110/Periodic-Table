/**
 * PERIODICA 3D - Molecular Dynamics & Interactive Bond Physics Simulation Engine
 * Harmonic Spring-Mass-Damper Forces, Lennard-Jones Potentials, and Maxwell-Boltzmann Agitation
 * 
 * (c) 2026 Periodica 3D | Developer: Vijay-1010110
 */

(function () {
    'use strict';

    /**
     * Standard Molecular Presets with Equilibrium Coordinates & Topology
     */
    const MOLECULE_PRESETS = {
        'H2O': {
            name: 'Water (H₂O)',
            desc: 'Polar bent molecule (104.5° bond angle) exhibiting rapid vibrational modes.',
            atoms: [
                { id: 0, element: 'O', x: 0, y: -6, z: 0, mass: 16.0, radius: 14, color: '#ef4444' },
                { id: 1, element: 'H', x: -38, y: 22, z: 0, mass: 1.0, radius: 9, color: '#ffffff' },
                { id: 2, element: 'H', x: 38, y: 22, z: 0, mass: 1.0, radius: 9, color: '#ffffff' }
            ],
            bonds: [
                { a: 0, b: 1, length: 44, k: 380 },
                { a: 0, b: 2, length: 44, k: 380 },
                { a: 1, b: 2, length: 69, k: 120 } // Angular constraint spring
            ]
        },
        'CO2': {
            name: 'Carbon Dioxide (CO₂)',
            desc: 'Linear non-polar molecule with symmetric and asymmetric infrared stretching modes.',
            atoms: [
                { id: 0, element: 'C', x: 0, y: 0, z: 0, mass: 12.0, radius: 12, color: '#475569' },
                { id: 1, element: 'O', x: -50, y: 0, z: 0, mass: 16.0, radius: 14, color: '#ef4444' },
                { id: 2, element: 'O', x: 50, y: 0, z: 0, mass: 16.0, radius: 14, color: '#ef4444' }
            ],
            bonds: [
                { a: 0, b: 1, length: 50, k: 520 },
                { a: 0, b: 2, length: 50, k: 520 },
                { a: 1, b: 2, length: 100, k: 180 }
            ]
        },
        'CH4': {
            name: 'Methane (CH₄)',
            desc: 'Tetrahedral geometry with four equivalent C-H covalent bonds.',
            atoms: [
                { id: 0, element: 'C', x: 0, y: 0, z: 0, mass: 12.0, radius: 13, color: '#475569' },
                { id: 1, element: 'H', x: 0, y: -45, z: 0, mass: 1.0, radius: 8, color: '#ffffff' },
                { id: 2, element: 'H', x: -42, y: 24, z: 0, mass: 1.0, radius: 8, color: '#ffffff' },
                { id: 3, element: 'H', x: 42, y: 24, z: 0, mass: 1.0, radius: 8, color: '#ffffff' }
            ],
            bonds: [
                { a: 0, b: 1, length: 45, k: 340 },
                { a: 0, b: 2, length: 48, k: 340 },
                { a: 0, b: 3, length: 48, k: 340 },
                { a: 1, b: 2, length: 78, k: 110 },
                { a: 1, b: 3, length: 78, k: 110 },
                { a: 2, b: 3, length: 84, k: 110 }
            ]
        },
        'C6H6': {
            name: 'Benzene (C₆H₆)',
            desc: 'Aromatic hexagonal planar ring exhibiting quantum resonance stabilization.',
            atoms: [
                // Ring Carbons
                { id: 0, element: 'C', x: 0, y: -40, z: 0, mass: 12.0, radius: 12, color: '#475569' },
                { id: 1, element: 'C', x: 35, y: -20, z: 0, mass: 12.0, radius: 12, color: '#475569' },
                { id: 2, element: 'C', x: 35, y: 20, z: 0, mass: 12.0, radius: 12, color: '#475569' },
                { id: 3, element: 'C', x: 0, y: 40, z: 0, mass: 12.0, radius: 12, color: '#475569' },
                { id: 4, element: 'C', x: -35, y: 20, z: 0, mass: 12.0, radius: 12, color: '#475569' },
                { id: 5, element: 'C', x: -35, y: -20, z: 0, mass: 12.0, radius: 12, color: '#475569' },
                // Outer Hydrogens
                { id: 6, element: 'H', x: 0, y: -72, z: 0, mass: 1.0, radius: 8, color: '#ffffff' },
                { id: 7, element: 'H', x: 62, y: -36, z: 0, mass: 1.0, radius: 8, color: '#ffffff' },
                { id: 8, element: 'H', x: 62, y: 36, z: 0, mass: 1.0, radius: 8, color: '#ffffff' },
                { id: 9, element: 'H', x: 0, y: 72, z: 0, mass: 1.0, radius: 8, color: '#ffffff' },
                { id: 10, element: 'H', x: -62, y: 36, z: 0, mass: 1.0, radius: 8, color: '#ffffff' },
                { id: 11, element: 'H', x: -62, y: -36, z: 0, mass: 1.0, radius: 8, color: '#ffffff' }
            ],
            bonds: [
                { a: 0, b: 1, length: 40, k: 450 },
                { a: 1, b: 2, length: 40, k: 450 },
                { a: 2, b: 3, length: 40, k: 450 },
                { a: 3, b: 4, length: 40, k: 450 },
                { a: 4, b: 5, length: 40, k: 450 },
                { a: 5, b: 0, length: 40, k: 450 },
                // C-H bonds
                { a: 0, b: 6, length: 32, k: 350 },
                { a: 1, b: 7, length: 32, k: 350 },
                { a: 2, b: 8, length: 32, k: 350 },
                { a: 3, b: 9, length: 32, k: 350 },
                { a: 4, b: 10, length: 32, k: 350 },
                { a: 5, b: 11, length: 32, k: 350 }
            ]
        }
    };

    /**
     * Physical Particle Entity
     */
    class SimAtom {
        constructor(config, offsetX, offsetY) {
            this.id = config.id;
            this.element = config.element;
            this.x = config.x + offsetX;
            this.y = config.y + offsetY;
            this.vx = 0;
            this.vy = 0;
            this.fx = 0;
            this.fy = 0;
            this.mass = config.mass || 12.0;
            this.radius = config.radius || 12;
            this.color = config.color || '#38bdf8';
            this.isDragged = false;
        }

        applyForce(fx, fy) {
            this.fx += fx;
            this.fy += fy;
        }

        integrate(dt, damping = 0.985) {
            if (this.isDragged) {
                this.vx = 0;
                this.vy = 0;
                this.fx = 0;
                this.fy = 0;
                return;
            }

            const ax = this.fx / this.mass;
            const ay = this.fy / this.mass;

            this.vx = (this.vx + ax * dt) * damping;
            this.vy = (this.vy + ay * dt) * damping;

            this.x += this.vx * dt;
            this.y += this.vy * dt;

            // Clear forces for next iteration
            this.fx = 0;
            this.fy = 0;
        }
    }

    /**
     * Master MolecularDynamicsEngine
     */
    class MolecularDynamicsEngine {
        constructor() {
            this.currentKey = 'H2O';
            this.temperatureK = 300.0;
            this.atoms = [];
            this.bonds = [];
            this.draggedAtom = null;
            this.width = 600;
            this.height = 400;
            this.centerGravityK = 18.0;

            this.loadPreset('H2O');
        }

        loadPreset(key) {
            const preset = MOLECULE_PRESETS[key] || MOLECULE_PRESETS['H2O'];
            this.currentKey = key;
            this.atoms = [];
            this.bonds = [];

            const centerX = this.width / 2;
            const centerY = this.height / 2;

            preset.atoms.forEach(cfg => {
                this.atoms.push(new SimAtom(cfg, centerX, centerY));
            });

            this.bonds = preset.bonds.map(b => ({
                a: b.a,
                b: b.b,
                targetLen: b.length,
                k: b.k,
                broken: false
            }));
        }

        setTemperature(kelvin) {
            this.temperatureK = Math.max(1, Math.min(3000, Number(kelvin) || 300));
        }

        startDrag(screenX, screenY) {
            for (const atom of this.atoms) {
                const dx = screenX - atom.x;
                const dy = screenY - atom.y;
                if (dx * dx + dy * dy < (atom.radius + 12) * (atom.radius + 12)) {
                    atom.isDragged = true;
                    this.draggedAtom = atom;
                    if (window.physicsAudio) {
                        window.physicsAudio.playBondStretchPing();
                    }
                    return atom;
                }
            }
            return null;
        }

        dragMove(screenX, screenY) {
            if (this.draggedAtom) {
                this.draggedAtom.x = screenX;
                this.draggedAtom.y = screenY;
            }
        }

        endDrag() {
            if (this.draggedAtom) {
                this.draggedAtom.isDragged = false;
                this.draggedAtom = null;
                if (window.physicsAudio) {
                    window.physicsAudio.playBondReleaseSnap();
                }
            }
        }

        update(dt) {
            const centerX = this.width / 2;
            const centerY = this.height / 2;

            // 1. Hooke's Law Spring-Damper Bond Forces
            for (const bond of this.bonds) {
                if (bond.broken) continue;
                const atomA = this.atoms[bond.a];
                const atomB = this.atoms[bond.b];
                if (!atomA || !atomB) continue;

                const dx = atomB.x - atomA.x;
                const dy = atomB.y - atomA.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
                const delta = dist - bond.targetLen;

                // Hooke force magnitude: F = -k * delta
                const forceMag = bond.k * delta;
                const fx = (dx / dist) * forceMag;
                const fy = (dy / dist) * forceMag;

                atomA.applyForce(fx, fy);
                atomB.applyForce(-fx, -fy);

                // Damping along bond axis
                const relVx = atomB.vx - atomA.vx;
                const relVy = atomB.vy - atomA.vy;
                const dampingMag = (dx * relVx + dy * relVy) / dist * 4.5;
                atomA.applyForce((dx / dist) * dampingMag, (dy / dist) * dampingMag);
                atomB.applyForce(-(dx / dist) * dampingMag, -(dy / dist) * dampingMag);
            }

            // 2. Lennard-Jones Non-Bonded Repulsion (Prevents atom overlap)
            for (let i = 0; i < this.atoms.length; i++) {
                for (let j = i + 1; j < this.atoms.length; j++) {
                    const a1 = this.atoms[i];
                    const a2 = this.atoms[j];
                    const dx = a2.x - a1.x;
                    const dy = a2.y - a1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
                    const minDist = a1.radius + a2.radius + 6;

                    if (dist < minDist) {
                        const overlap = minDist - dist;
                        const repForce = overlap * 600;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        a1.applyForce(-nx * repForce, -ny * repForce);
                        a2.applyForce(nx * repForce, ny * repForce);
                    }
                }
            }

            // 3. Thermal Agitation (Maxwell-Boltzmann Langevin kicks)
            // Agitation force proportional to sqrt(Temperature)
            const thermalStrength = Math.sqrt(this.temperatureK) * 24.0;
            for (const atom of this.atoms) {
                const kx = (Math.random() - 0.5) * thermalStrength;
                const ky = (Math.random() - 0.5) * thermalStrength;
                atom.applyForce(kx, ky);

                // Weak central restoring tether keeps molecule inside chamber viewport
                const cdx = centerX - atom.x;
                const cdy = centerY - atom.y;
                atom.applyForce(cdx * this.centerGravityK, cdy * this.centerGravityK);
            }

            // 4. Numerical Integration
            for (const atom of this.atoms) {
                atom.integrate(dt);
            }
        }

        render(canvas) {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const w = canvas.width = this.width = canvas.clientWidth * (window.devicePixelRatio || 1);
            const h = canvas.height = this.height = canvas.clientHeight * (window.devicePixelRatio || 1);

            ctx.clearRect(0, 0, w, h);

            // Subtle Molecular Orbital Density Background Vignette
            const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 30, w / 2, h / 2, w * 0.5);
            bgGrad.addColorStop(0, 'rgba(0, 212, 255, 0.04)');
            bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            // Render Covalent Bonds (Glowing Spring Cylinders)
            for (const bond of this.bonds) {
                if (bond.broken) continue;
                const a1 = this.atoms[bond.a];
                const a2 = this.atoms[bond.b];
                if (!a1 || !a2) continue;

                const dx = a2.x - a1.x;
                const dy = a2.y - a1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const strain = Math.abs(dist - bond.targetLen) / bond.targetLen;

                // Color shifts to warning red as bond is stretched under tension
                ctx.strokeStyle = strain > 0.45 ? '#ef4444' : (strain > 0.2 ? '#f59e0b' : 'rgba(255, 255, 255, 0.5)');
                ctx.lineWidth = 4.5;
                ctx.beginPath();
                ctx.moveTo(a1.x, a1.y);
                ctx.lineTo(a2.x, a2.y);
                ctx.stroke();

                // Inner core line
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(a1.x, a1.y);
                ctx.lineTo(a2.x, a2.y);
                ctx.stroke();
            }

            // Render Atoms (3D CPK Spheres)
            for (const atom of this.atoms) {
                const grad = ctx.createRadialGradient(
                    atom.x - atom.radius * 0.35, atom.y - atom.radius * 0.35, atom.radius * 0.1,
                    atom.x, atom.y, atom.radius
                );
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.3, atom.color);
                grad.addColorStop(1, '#0f172a');

                ctx.shadowColor = atom.color;
                ctx.shadowBlur = atom.isDragged ? 18 : 6;
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(atom.x, atom.y, atom.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = 1.0;
                ctx.stroke();

                // Chemical Symbol
                ctx.fillStyle = atom.element === 'H' ? '#0f172a' : '#ffffff';
                ctx.font = 'bold 9px sans-serif';
                ctx.fillText(atom.element, atom.x - 3.5, atom.y + 3.5);
            }

            // Telemetry HUD
            const preset = MOLECULE_PRESETS[this.currentKey] || MOLECULE_PRESETS['H2O'];
            ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 1;
            ctx.fillRect(10, 10, 210, 65);
            ctx.strokeRect(10, 10, 210, 65);

            ctx.fillStyle = '#00d4ff';
            ctx.font = 'bold 11px monospace';
            ctx.fillText(preset.name, 18, 26);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '9px monospace';
            ctx.fillText(`Thermal Agitation: ${this.temperatureK.toFixed(0)} K`, 18, 42);
            ctx.fillText(`Interactive Mode:  Drag any atom!`, 18, 58);
        }
    }

    // Attach to Global Scope
    window.MolecularDynamicsEngine = MolecularDynamicsEngine;
    window.MOLECULE_PRESETS = MOLECULE_PRESETS;
    window.molecularDynamicsEngine = new MolecularDynamicsEngine();

})();
