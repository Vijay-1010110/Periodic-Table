/**
 * 06_emulator.js
 * Handles the interactive Nuclear Decay Emulator Canvas.
 */

window.NuclearEmulator = {
    canvas: null,
    ctx: null,
    particles: [], // {x, y, type: 'proton'|'neutron', vx, vy, isDecaying}
    animationId: null,
    currentIso: null,
    currentEl: null,
    isDecaying: false,
    
    init: function() {
        this.canvas = document.getElementById('nuclear-emulator-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        const btnSim = document.getElementById('btn-simulate-decay');
        const btnRes = document.getElementById('btn-reset-emulator');
        
        if (btnSim) btnSim.addEventListener('click', () => this.simulateDecay());
        if (btnRes) btnRes.addEventListener('click', () => this.resetEmulator());
    },
    
    loadIsotope: function(iso, elData) {
        this.currentIso = iso;
        this.currentEl = elData;
        this.isDecaying = false;
        
        if (!this.canvas) this.init();
        
        this.generateParticles();
        this.startLoop();
        
        const btnSim = document.getElementById('btn-simulate-decay');
        if (iso.isStable || !iso.decayMode || iso.decayMode === '-') {
            btnSim.style.opacity = '0.5';
            btnSim.style.cursor = 'not-allowed';
            btnSim.textContent = 'Stable (No Decay)';
        } else {
            btnSim.style.opacity = '1';
            btnSim.style.cursor = 'pointer';
            btnSim.textContent = 'Simulate Decay';
            btnSim.style.background = getDecayColor(iso.decayMode);
        }
    },
    
    generateParticles: function() {
        this.particles = [];
        const protons = this.currentEl.atomicNumber;
        const mass = this.currentIso.massNumber || (protons + Math.round(protons * 1.5));
        const neutrons = Math.max(0, mass - protons);
        
        // As requested by user: Don't render all 238, just render a representative core 
        // with some distinct surface particles and an illumination effect.
        // We will render up to ~40 particles to represent the core physically.
        
        const maxDisplay = 50;
        const displayProtons = Math.min(protons, Math.floor(maxDisplay / 2));
        const displayNeutrons = Math.min(neutrons, maxDisplay - displayProtons);
        
        const coreRadius = Math.min(40, 15 + (mass * 0.1));
        
        for (let i = 0; i < displayProtons; i++) {
            this.addParticle('proton', coreRadius);
        }
        for (let i = 0; i < displayNeutrons; i++) {
            this.addParticle('neutron', coreRadius);
        }
    },
    
    addParticle: function(type, coreRadius) {
        // Random position in a sphere (projected to 2D circle)
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * coreRadius;
        this.particles.push({
            x: r * Math.cos(angle),
            y: r * Math.sin(angle),
            baseX: r * Math.cos(angle),
            baseY: r * Math.sin(angle),
            type: type,
            vx: 0,
            vy: 0,
            isDecaying: false,
            phase: Math.random() * Math.PI * 2
        });
    },
    
    startLoop: function() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        
        const loop = (time) => {
            this.update(time);
            this.draw();
            this.animationId = requestAnimationFrame(loop);
        };
        this.animationId = requestAnimationFrame(loop);
    },
    
    update: function(time) {
        // Jitter / breathing effect
        this.particles.forEach(p => {
            if (!p.isDecaying) {
                p.x = p.baseX + Math.sin(time * 0.003 + p.phase) * 1.5;
                p.y = p.baseY + Math.cos(time * 0.002 + p.phase) * 1.5;
            } else {
                p.x += p.vx;
                p.y += p.vy;
            }
        });
    },
    
    draw: function() {
        if (!this.ctx) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        
        this.ctx.clearRect(0, 0, w, h);
        
        // Draw glow/illumination representing the bulk of the nucleus
        const protons = this.currentEl.atomicNumber;
        const mass = this.currentIso.massNumber || (protons * 2);
        const neutrons = Math.max(0, mass - protons);
        
        const coreRadius = Math.min(60, 20 + (mass * 0.15));
        
        // Core glow
        const gradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 2);
        if (this.currentIso.isStable) {
            gradient.addColorStop(0, 'rgba(74, 222, 128, 0.4)'); // Stable green glow
            gradient.addColorStop(1, 'rgba(74, 222, 128, 0)');
        } else {
            const dColor = getDecayColor(this.currentIso.decayMode);
            // Convert hex to rgba
            let r=255, g=0, b=0;
            if (dColor.startsWith('#') && dColor.length === 7) {
                r = parseInt(dColor.slice(1,3), 16);
                g = parseInt(dColor.slice(3,5), 16);
                b = parseInt(dColor.slice(5,7), 16);
            }
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.5)`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, coreRadius * 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw particles
        this.particles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(cx + p.x, cy + p.y, 6, 0, Math.PI * 2);
            if (p.type === 'proton') {
                this.ctx.fillStyle = '#ef4444'; // Red for proton
            } else if (p.type === 'neutron') {
                this.ctx.fillStyle = '#0ea5e9'; // Blue for neutron
            } else if (p.type === 'electron') {
                this.ctx.fillStyle = '#fde047'; // Yellow for electron
                this.ctx.arc(cx + p.x, cy + p.y, 3, 0, Math.PI * 2); // smaller
            } else if (p.type === 'positron') {
                this.ctx.fillStyle = '#fde047'; 
                this.ctx.arc(cx + p.x, cy + p.y, 3, 0, Math.PI * 2);
            }
            this.ctx.fill();
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = this.ctx.fillStyle;
        });
        this.ctx.shadowBlur = 0;
        
        // Draw text counts
        this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
        this.ctx.font = '16px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        
        let pCountText = `${protons} Protons`;
        let nCountText = `${neutrons} Neutrons`;
        
        if (this.isDecaying) {
            // Modify text based on decay
            const mode = this.currentIso.decayMode || '';
            if (/\bA\b/.test(mode) || mode.includes('Alpha')) {
                pCountText = `${protons - 2} Protons`;
                nCountText = `${neutrons - 2} Neutrons`;
            } else if (mode.includes('B-')) {
                pCountText = `${protons + 1} Protons`;
                nCountText = `${neutrons - 1} Neutrons`;
            } else if (mode.includes('B+') || mode.includes('EC')) {
                pCountText = `${protons - 1} Protons`;
                nCountText = `${neutrons + 1} Neutrons`;
            }
        }
        
        this.ctx.fillText(pCountText, cx, cy + coreRadius * 2 + 20);
        this.ctx.fillStyle = 'rgba(14, 165, 233, 0.8)';
        this.ctx.fillText(nCountText, cx, cy + coreRadius * 2 + 40);
        
        // Title
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 20px Inter, sans-serif';
        this.ctx.fillText(`Nucleus Core`, cx, 30);
    },
    
    simulateDecay: function() {
        if (this.isDecaying || this.currentIso.isStable) return;
        this.isDecaying = true;
        
        const mode = this.currentIso.decayMode || '';
        
        // We select particles to shoot out based on decay mode
        if (/\bA\b/.test(mode) || mode.includes('Alpha')) {
            // Alpha decay: 2 protons, 2 neutrons fly out
            let pSelected = 0, nSelected = 0;
            this.particles.forEach(p => {
                if (p.type === 'proton' && pSelected < 2) {
                    p.isDecaying = true; p.vx = 2; p.vy = -2; pSelected++;
                } else if (p.type === 'neutron' && nSelected < 2) {
                    p.isDecaying = true; p.vx = 2.2; p.vy = -1.8; nSelected++;
                }
            });
        } 
        else if (mode.includes('B-')) {
            // Beta-: Neutron turns into proton, electron flies out
            let n = this.particles.find(p => p.type === 'neutron');
            if (n) {
                n.type = 'proton';
                // Add an electron that flies away
                this.particles.push({
                    x: n.x, y: n.y, baseX: n.x, baseY: n.y,
                    type: 'electron', vx: 4, vy: -4, isDecaying: true, phase: 0
                });
            }
        }
        else if (mode.includes('B+') || mode.includes('EC')) {
            // Beta+: Proton turns into neutron, positron flies out
            let p = this.particles.find(p => p.type === 'proton');
            if (p) {
                p.type = 'neutron';
                this.particles.push({
                    x: p.x, y: p.y, baseX: p.x, baseY: p.y,
                    type: 'positron', vx: 4, vy: -4, isDecaying: true, phase: 0
                });
            }
        }
        else if (/\bp\b/.test(mode)) {
            // Proton emission
            let p = this.particles.find(p => p.type === 'proton');
            if (p) { p.isDecaying = true; p.vx = 3; p.vy = -3; }
        }
        else if (/\bn\b/.test(mode)) {
            // Neutron emission
            let n = this.particles.find(p => p.type === 'neutron');
            if (n) { n.isDecaying = true; n.vx = 3; n.vy = -3; }
        }
        else if (mode.includes('SF')) {
            // Spontaneous fission: split in two
            this.particles.forEach((p, i) => {
                p.isDecaying = true;
                if (i % 2 === 0) {
                    p.vx = -1.5; p.vy = 0;
                } else {
                    p.vx = 1.5; p.vy = 0;
                }
            });
        }
    },
    
    resetEmulator: function() {
        if (!this.currentIso) return;
        this.loadIsotope(this.currentIso, this.currentEl);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    NuclearEmulator.init();
});
