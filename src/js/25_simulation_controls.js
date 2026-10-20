/**
 * PERIODICA 3D - Simulation Master Game Controls, Offline Audio Synthesizer & Haptics
 * Game-grade loop controller, Bullet-time slow motion, and Web Audio API physical sound engine.
 * 
 * (c) 2026 Periodica 3D | Developer: Vijay-1010110
 */

(function () {
    'use strict';

    /**
     * Web Audio API Synthesizer (100% Offline, Zero External Assets)
     */
    class PhysicsAudioSynthesizer {
        constructor() {
            this.ctx = null;
            this.muted = false;
        }

        initContext() {
            if (!this.ctx && typeof window.AudioContext !== 'undefined') {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioCtx();
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        playGeigerClick() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            // Sharp burst click with authentic analog Geiger jitter
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(2400 + (Math.random() - 0.5) * 800, t);
            gain.gain.setValueAtTime(0.28, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.016);
        }

        playNeutronGun() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(940, t);
            osc.frequency.exponentialRampToValueAtTime(240, t + 0.08);

            gain.gain.setValueAtTime(0.32, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.09);
        }

        playNeutronCapture() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            // Ascending resonant ping on neutron absorption
            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, t);
            osc.frequency.exponentialRampToValueAtTime(640, t + 0.12);

            gain.gain.setValueAtTime(0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.16);
        }

        playElongationTension() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            // Low oscillating droplet necking frequency
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(110, t);
            osc.frequency.linearRampToValueAtTime(160, t + 0.18);

            gain.gain.setValueAtTime(0.28, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.24);
        }

        playFissionBoom() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const t = this.ctx.currentTime;

            // Deep Sub-Bass Resonant Fission Boom (55Hz down to 24Hz)
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(55, t);
            osc.frequency.exponentialRampToValueAtTime(24, t + 0.45);

            gain.gain.setValueAtTime(0.75, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.50);

            // High frequency gamma burst crackle
            const noise = this.ctx.createOscillator();
            const noiseGain = this.ctx.createGain();
            noise.type = 'square';
            noise.frequency.setValueAtTime(1200, t);
            noise.frequency.exponentialRampToValueAtTime(180, t + 0.15);
            noiseGain.gain.setValueAtTime(0.25, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            noise.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.52);

            noise.start(t);
            noise.stop(t + 0.18);
        }

        playFissionClick() {
            this.playFissionBoom();
        }

        playPhaseTransitionSizzle(phaseType) {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            if (phaseType === 'solid') {
                // High crystalline clink
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1200, t);
                osc.frequency.exponentialRampToValueAtTime(2400, t + 0.08);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
            } else if (phaseType === 'liquid') {
                // Fluid whoosh
                osc.type = 'sine';
                osc.frequency.setValueAtTime(340, t);
                osc.frequency.exponentialRampToValueAtTime(180, t + 0.14);
                gain.gain.setValueAtTime(0.35, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
            } else if (phaseType === 'gas') {
                // Vapor hiss
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(800, t);
                osc.frequency.exponentialRampToValueAtTime(400, t + 0.15);
                gain.gain.setValueAtTime(0.25, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
            } else {
                // Plasma electric hum
                osc.type = 'square';
                osc.frequency.setValueAtTime(180, t);
                osc.frequency.exponentialRampToValueAtTime(60, t + 0.25);
                gain.gain.setValueAtTime(0.35, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
            }

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.30);
        }

        playAnnihilationZap() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(3200, t);
            osc.frequency.exponentialRampToValueAtTime(600, t + 0.06);

            gain.gain.setValueAtTime(0.22, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.07);
        }

        playBondStretchPing() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, t);
            osc.frequency.exponentialRampToValueAtTime(780, t + 0.05);

            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.06);
        }

        playBondReleaseSnap() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(940, t);
            osc.frequency.exponentialRampToValueAtTime(320, t + 0.08);

            gain.gain.setValueAtTime(0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.09);
        }

        playScramAlarm() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.setValueAtTime(400, t + 0.15);

            gain.gain.setValueAtTime(0.42, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.33);
        }

        playMissionCompleteChime() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const t = this.ctx.currentTime;
            // Celebratory major chord chime: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const noteTime = t + idx * 0.08;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, noteTime);
                gain.gain.setValueAtTime(0.28, noteTime);
                gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(noteTime);
                osc.stop(noteTime + 0.36);
            });
        }
    }

    /**
     * Master Simulation Playback & Game Loop Controller
     */
    class SimulationPlaybackController {
        constructor() {
            this.isPlaying = true;
            this.timeScale = 1.0;
            this.activeTab = 'chain_reaction';
            this.animationFrameId = null;
            this.lastTime = performance.now();
            this.initialized = false;
        }

        setActiveTab(tabName) {
            this.activeTab = tabName;
            this.stepFrame();
        }

        setPlaying(isPlaying) {
            this.isPlaying = !!isPlaying;
            if (this.isPlaying && !this.animationFrameId) {
                this.lastTime = performance.now();
                this.loop();
            }
        }

        setTimeScale(scale) {
            this.timeScale = Math.max(0.05, Math.min(10.0, scale));
        }

        start() {
            this.isPlaying = true;
            const btn = document.getElementById('sim-btn-playpause');
            if (btn) btn.innerHTML = '⏸️';
            if (!this.animationFrameId) {
                this.lastTime = performance.now();
                this.loop();
            }
        }

        pause() {
            this.isPlaying = false;
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            const btn = document.getElementById('sim-btn-playpause');
            if (btn) btn.innerHTML = '▶️';
        }

        stop() {
            this.pause();
        }

        stepFrame() {
            const dt = 0.016;
            this.tick(dt, true);
        }

        tick(dt, forceRender = false) {
            const targetView = document.getElementById('view-simulations');
            if (!targetView || !targetView.classList.contains('active')) {
                return;
            }

            if (this.activeTab === 'chain_reaction') {
                const canvas = document.getElementById('chain-sim-canvas');
                if (window.chainReactionEngine && canvas) {
                    if (this.isPlaying || forceRender) {
                        window.chainReactionEngine.update(dt);
                    }
                    window.chainReactionEngine.render(canvas);
                }
            } else if (this.activeTab === 'decay') {
                const canvas = document.getElementById('decay-sim-canvas');
                if (window.nuclearDecayEngine && canvas) {
                    if (this.isPlaying || forceRender) {
                        window.nuclearDecayEngine.update(dt);
                    }
                    window.nuclearDecayEngine.render(canvas);
                }
            } else if (this.activeTab === 'molecule') {
                const canvas = document.getElementById('molecule-sim-canvas');
                if (window.molecularDynamicsEngine && canvas) {
                    if (this.isPlaying || forceRender) {
                        window.molecularDynamicsEngine.update(dt);
                    }
                    window.molecularDynamicsEngine.render(canvas);
                }
            } else if (this.activeTab === 'environment') {
                const canvas = document.getElementById('env-phase-canvas');
                if (window.envSimulationEngine && canvas) {
                    window.envSimulationEngine.renderPhaseDiagram(canvas);
                }
            }
        }

        loop() {
            this.animationFrameId = requestAnimationFrame((now) => {
                const rawDt = Math.min(0.05, (now - this.lastTime) / 1000);
                this.lastTime = now;

                if (this.isPlaying) {
                    const dt = rawDt * this.timeScale;
                    this.tick(dt);
                }

                const targetView = document.getElementById('view-simulations');
                if (targetView && targetView.classList.contains('active')) {
                    this.loop();
                } else {
                    this.animationFrameId = null;
                }
            });
        }

        initUI() {
            if (!this.initialized) {
                this.initialized = true;
                if (typeof setupCanvasInteractions === 'function') {
                    setupCanvasInteractions();
                }
            }
            switchSimTab(this.activeTab || 'chain_reaction');
            this.start();
        }
    }

    /**
     * UI Coordinator & Event Handler Functions
     */
    function switchSimTab(tabName) {
        if (!window.simPlaybackController) return;
        window.simPlaybackController.setActiveTab(tabName);

        // Update Tab Buttons
        document.querySelectorAll('.sim-tab-btn').forEach(btn => {
            if (btn.getAttribute('data-sim') === tabName) {
                btn.classList.add('active');
                if (typeof btn.scrollIntoView === 'function') {
                    btn.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
                }
            } else {
                btn.classList.remove('active');
            }
        });

        // Switch Visible Canvases
        const canvases = {
            'chain_reaction': document.getElementById('chain-sim-canvas'),
            'decay': document.getElementById('decay-sim-canvas'),
            'molecule': document.getElementById('molecule-sim-canvas'),
            'environment': document.getElementById('env-phase-canvas')
        };

        for (const [key, c] of Object.entries(canvases)) {
            if (c) c.style.display = (key === tabName) ? 'block' : 'none';
        }

        // Update dynamic status narrator pill for the active tab
        const msgEl = document.getElementById('sim-narrator-msg');
        if (msgEl) {
            if (tabName === 'chain_reaction') {
                const engine = window.chainReactionEngine;
                if (engine && engine.reactionNarrative) {
                    msgEl.textContent = engine.reactionNarrative;
                } else {
                    msgEl.textContent = '🎯 Aim neutron emitter & tap "FIRE NEUTRON" (or tap nucleus) to start!';
                }
            } else if (tabName === 'decay') {
                msgEl.textContent = '☢️ Quantum tunneling triggers spontaneous transmutation! Tap TRANSMUTE or tap nucleus.';
            } else if (tabName === 'molecule') {
                msgEl.textContent = '🧬 Touch & drag atoms to stretch harmonic bonds; tap THERMAL JOLT to stimulate vibrations.';
            } else if (tabName === 'environment') {
                msgEl.textContent = '🌡️ Explore phase boundaries: Heat to melt/boil, cool to crystallize, or compress into dense metal.';
            }
        }

        renderGameDeck(tabName);
    }

    function toggleSimPlayback() {
        if (!window.simPlaybackController) return;
        const next = !window.simPlaybackController.isPlaying;
        window.simPlaybackController.setPlaying(next);
        const btn = document.getElementById('sim-btn-playpause');
        if (btn) btn.innerHTML = next ? '⏸️' : '▶️';
    }

    function stepSimFrame() {
        if (!window.simPlaybackController) return;
        window.simPlaybackController.setPlaying(false);
        const btn = document.getElementById('sim-btn-playpause');
        if (btn) btn.innerHTML = '▶️';
        window.simPlaybackController.stepFrame();
    }

    function changeSimSpeed(val) {
        if (window.simPlaybackController) {
            window.simPlaybackController.setTimeScale(parseFloat(val) || 1.0);
        }
    }

    function resetActiveSim() {
        const tab = window.simPlaybackController ? window.simPlaybackController.activeTab : 'chain_reaction';
        if (tab === 'chain_reaction' && window.chainReactionEngine) {
            window.chainReactionEngine.initChamber();
        } else if (tab === 'decay' && window.nuclearDecayEngine) {
            window.nuclearDecayEngine.particles = [];
            window.nuclearDecayEngine.droplets = [];
            window.nuclearDecayEngine.resetTransmutation();
        } else if (tab === 'molecule' && window.molecularDynamicsEngine) {
            window.molecularDynamicsEngine.loadPreset(window.molecularDynamicsEngine.currentKey);
        } else if (tab === 'environment' && window.envSimulationEngine) {
            window.envSimulationEngine.setPreset('earth_stp');
        }
        renderGameDeck(tab);
    }

    function toggleSimAudio() {
        if (!window.physicsAudio) return;
        window.physicsAudio.muted = !window.physicsAudio.muted;
        const btn = document.getElementById('sim-btn-sound');
        if (btn) btn.innerHTML = window.physicsAudio.muted ? '🔇' : '🔊';
    }

    /**
     * Render Bottom Game Controller Deck (PhET / Brilliant.org Mobile First)
     */
    function renderGameDeck(tabName) {
        const deck = document.getElementById('sim-game-deck');
        if (!deck) return;

        if (tabName === 'chain_reaction') {
            const engine = window.chainReactionEngine;
            const curScenario = engine ? engine.currentScenario : 'single_fission';

            let rightControls = '';
            if (curScenario === 'single_fission') {
                rightControls = `
                    <button class="sim-deck-hero-btn primary" onclick="window.chainReactionEngine.fireSingleAtomNeutron()">
                        <span>🚀</span> FIRE NEUTRON
                    </button>
                    <button class="sim-deck-tool-btn" onclick="window.chainReactionEngine.initChamber()" title="Reset Nucleus">
                        <span>🔄</span> Reset
                    </button>
                `;
            } else if (curScenario === 'chain_sandbox') {
                rightControls = `
                    <div class="sim-deck-slider-group">
                        <span class="sim-deck-slider-label">Atoms: <b id="deck-density-val">${engine ? engine.atomDensity : 45}</b></span>
                        <input type="range" class="sim-deck-slider" min="15" max="85" value="${engine ? engine.atomDensity : 45}" oninput="document.getElementById('deck-density-val').textContent=this.value; window.chainReactionEngine.setAtomDensity(this.value);">
                    </div>
                    <select class="sim-deck-select" onchange="window.chainReactionEngine.setFuel(this.value)">
                        <option value="U235" ${engine && engine.fuelType === 'U235' ? 'selected' : ''}>²³⁵U Enriched</option>
                        <option value="PU239" ${engine && engine.fuelType === 'PU239' ? 'selected' : ''}>²³⁹Pu Fast</option>
                        <option value="U238" ${engine && engine.fuelType === 'U238' ? 'selected' : ''}>²³⁸U Depleted</option>
                    </select>
                    <button class="sim-deck-hero-btn primary" onclick="window.chainReactionEngine.injectNeutron()">
                        <span>🚀</span> FIRE
                    </button>
                    <button class="sim-deck-tool-btn" onclick="window.chainReactionEngine.initChamber()" title="Clear Cascade">
                        <span>🔄</span> Clear
                    </button>
                `;
            } else {
                rightControls = `
                    <div class="sim-deck-slider-group">
                        <span class="sim-deck-slider-label">Rods: <b id="deck-rod-val">${((engine ? engine.controlRodInsertion : 0.35) * 100).toFixed(0)}%</b></span>
                        <input type="range" class="sim-deck-slider" min="0" max="100" value="${((engine ? engine.controlRodInsertion : 0.35) * 100).toFixed(0)}" oninput="document.getElementById('deck-rod-val').textContent=this.value+'%'; window.chainReactionEngine.setControlRods(this.value/100);">
                    </div>
                    <select class="sim-deck-select" onchange="window.chainReactionEngine.setModerator(this.value)">
                        <option value="light_water" ${engine && engine.moderatorType === 'light_water' ? 'selected' : ''}>Light Water H₂O</option>
                        <option value="heavy_water" ${engine && engine.moderatorType === 'heavy_water' ? 'selected' : ''}>Heavy Water D₂O</option>
                        <option value="graphite" ${engine && engine.moderatorType === 'graphite' ? 'selected' : ''}>Graphite C</option>
                    </select>
                    <button class="sim-deck-hero-btn danger" onclick="window.chainReactionEngine.triggerSCRAM()">
                        <span>🚨</span> SCRAM
                    </button>
                    <button class="sim-deck-hero-btn primary" onclick="window.chainReactionEngine.injectNeutron()">
                        <span>🚀</span> FIRE
                    </button>
                `;
            }

            deck.innerHTML = `
                <div class="sim-deck-left">
                    <button class="sim-deck-chip ${curScenario === 'single_fission' ? 'active' : ''}" onclick="window.chainReactionEngine.setScenario('single_fission')">
                        🎯 1. Single Atom
                    </button>
                    <button class="sim-deck-chip ${curScenario === 'chain_sandbox' ? 'active' : ''}" onclick="window.chainReactionEngine.setScenario('chain_sandbox')">
                        ⚡ 2. Sandbox
                    </button>
                    <button class="sim-deck-chip ${curScenario === 'reactor_core' ? 'active' : ''}" onclick="window.chainReactionEngine.setScenario('reactor_core')">
                        🔋 3. Reactor Core
                    </button>
                </div>
                <div class="sim-deck-right">
                    ${rightControls}
                </div>
            `;
        } else if (tabName === 'decay') {
            const engine = window.nuclearDecayEngine;
            const curMode = engine ? engine.currentMode : 'transmutation';
            const nuclides = window.DECAY_NUCLIDES || [];
            const bField = (engine && typeof engine.magneticFieldTesla === 'number') ? engine.magneticFieldTesla : 1.0;

            let rightControls = '';
            if (curMode === 'transmutation') {
                rightControls = `
                    <select class="sim-deck-select" onchange="window.nuclearDecayEngine.setPreset(this.value)">
                        ${nuclides.map(d => `<option value="${d.id}" ${engine && engine.currentPresetId === d.id ? 'selected' : ''}>${d.name} (${d.particle})</option>`).join('')}
                    </select>
                    <button class="sim-deck-hero-btn primary" onclick="window.nuclearDecayEngine.triggerTransmutation()">
                        <span>💥</span> TRANSMUTE
                    </button>
                    <button class="sim-deck-tool-btn" onclick="window.nuclearDecayEngine.resetTransmutation()" title="Reset Parent Atom">
                        <span>🔄</span> Reset
                    </button>
                `;
            } else if (curMode === 'halflife') {
                rightControls = `
                    <select class="sim-deck-select" onchange="window.nuclearDecayEngine.setPreset(this.value)">
                        ${nuclides.map(d => `<option value="${d.id}" ${engine && engine.currentPresetId === d.id ? 'selected' : ''}>${d.name} (${d.halfLifeStr})</option>`).join('')}
                    </select>
                    <button class="sim-deck-hero-btn primary" onclick="window.nuclearDecayEngine.halfLifeRunning = !window.nuclearDecayEngine.halfLifeRunning; renderGameDeck('decay');">
                        <span>${engine && engine.halfLifeRunning ? '⏸️ PAUSE' : '▶️ START'}</span> CLOCK
                    </button>
                    <button class="sim-deck-tool-btn" onclick="window.nuclearDecayEngine.initHalfLifePopulation()" title="Repopulate 100 Atoms">
                        <span>🔄</span> 100 Atoms
                    </button>
                `;
            } else if (curMode === 'shielding') {
                rightControls = `
                    <div class="sim-deck-toggles">
                        <button class="sim-deck-chip small ${engine && engine.shieldingBarriers.paper ? 'active' : ''}" onclick="window.nuclearDecayEngine.toggleBarrier('paper'); renderGameDeck('decay');">
                            📄 Paper ${engine && engine.shieldingBarriers.paper ? 'ON' : 'OFF'}
                        </button>
                        <button class="sim-deck-chip small ${engine && engine.shieldingBarriers.aluminum ? 'active' : ''}" onclick="window.nuclearDecayEngine.toggleBarrier('aluminum'); renderGameDeck('decay');">
                            🛡️ Alum ${engine && engine.shieldingBarriers.aluminum ? 'ON' : 'OFF'}
                        </button>
                        <button class="sim-deck-chip small ${engine && engine.shieldingBarriers.lead ? 'active' : ''}" onclick="window.nuclearDecayEngine.toggleBarrier('lead'); renderGameDeck('decay');">
                            🧱 Lead ${engine && engine.shieldingBarriers.lead ? 'ON' : 'OFF'}
                        </button>
                    </div>
                    <button class="sim-deck-hero-btn primary" onclick="window.nuclearDecayEngine.triggerTransmutation()">
                        <span>⚡</span> FIRE BEAM
                    </button>
                `;
            } else {
                rightControls = `
                    <div class="sim-deck-slider-group">
                        <span class="sim-deck-slider-label">B: <b id="deck-b-val">${bField.toFixed(1)} T</b></span>
                        <input type="range" class="sim-deck-slider" min="-30" max="30" value="${(bField * 10).toFixed(0)}" oninput="document.getElementById('deck-b-val').textContent=(this.value/10).toFixed(1)+' T'; window.nuclearDecayEngine.setMagneticField(this.value/10);">
                    </div>
                    <button class="sim-deck-hero-btn primary" onclick="window.nuclearDecayEngine.triggerDecay()">
                        <span>⚡</span> EMIT
                    </button>
                    <button class="sim-deck-tool-btn" onclick="window.nuclearDecayEngine.droplets=[]; window.nuclearDecayEngine.particles=[];" title="Clear Vapor Tracks">
                        <span>🔄</span> Clear
                    </button>
                `;
            }

            deck.innerHTML = `
                <div class="sim-deck-left">
                    <button class="sim-deck-chip ${curMode === 'transmutation' ? 'active' : ''}" onclick="window.nuclearDecayEngine.setMode('transmutation')">
                        💥 Transmute
                    </button>
                    <button class="sim-deck-chip ${curMode === 'halflife' ? 'active' : ''}" onclick="window.nuclearDecayEngine.setMode('halflife')">
                        ⏱️ Half-Life
                    </button>
                    <button class="sim-deck-chip ${curMode === 'shielding' ? 'active' : ''}" onclick="window.nuclearDecayEngine.setMode('shielding')">
                        🛡️ Shielding
                    </button>
                    <button class="sim-deck-chip ${curMode === 'chamber' ? 'active' : ''}" onclick="window.nuclearDecayEngine.setMode('chamber')">
                        🧲 Cloud B
                    </button>
                </div>
                <div class="sim-deck-right">
                    ${rightControls}
                </div>
            `;
        } else if (tabName === 'molecule') {
            const engine = window.molecularDynamicsEngine;
            const curKey = engine ? engine.currentKey : 'H2O';
            const temp = (engine && typeof engine.temperatureK === 'number') ? engine.temperatureK : 298;

            deck.innerHTML = `
                <div class="sim-deck-left">
                    <button class="sim-deck-chip ${curKey === 'H2O' ? 'active' : ''}" onclick="window.molecularDynamicsEngine.loadPreset('H2O')">
                        💧 H₂O Water
                    </button>
                    <button class="sim-deck-chip ${curKey === 'CO2' ? 'active' : ''}" onclick="window.molecularDynamicsEngine.loadPreset('CO2')">
                        🫧 CO₂ Carbon
                    </button>
                    <button class="sim-deck-chip ${curKey === 'CH4' ? 'active' : ''}" onclick="window.molecularDynamicsEngine.loadPreset('CH4')">
                        🔥 CH₄ Methane
                    </button>
                    <button class="sim-deck-chip ${curKey === 'C6H6' ? 'active' : ''}" onclick="window.molecularDynamicsEngine.loadPreset('C6H6')">
                        ⬡ Benzene
                    </button>
                </div>
                <div class="sim-deck-right">
                    <div class="sim-deck-slider-group">
                        <span class="sim-deck-slider-label">Temp: <b id="deck-temp-val">${temp.toFixed(0)} K</b></span>
                        <input type="range" class="sim-deck-slider" min="10" max="1000" value="${temp}" oninput="document.getElementById('deck-temp-val').textContent=this.value+' K'; window.molecularDynamicsEngine.setTemperature(this.value);">
                    </div>
                    <button class="sim-deck-hero-btn warn" onclick="window.molecularDynamicsEngine.applyImpulse(0, 0, -320)">
                        <span>💥</span> JOLT
                    </button>
                    <button class="sim-deck-tool-btn" onclick="window.molecularDynamicsEngine.loadPreset(window.molecularDynamicsEngine.currentKey)" title="Reset Rest Shape">
                        <span>🔄</span> Reset
                    </button>
                </div>
            `;
        } else if (tabName === 'environment') {
            const engine = window.envSimulationEngine;
            const activeZ = engine ? engine.activeElementId : 6;

            deck.innerHTML = `
                <div class="sim-deck-left">
                    <button class="sim-deck-chip ${activeZ === 6 ? 'active' : ''}" onclick="window.envSimulationEngine.setElement(6)">
                        6 C Carbon
                    </button>
                    <button class="sim-deck-chip ${activeZ === 26 ? 'active' : ''}" onclick="window.envSimulationEngine.setElement(26)">
                        26 Fe Iron
                    </button>
                    <button class="sim-deck-chip ${activeZ === 79 ? 'active' : ''}" onclick="window.envSimulationEngine.setElement(79)">
                        79 Au Gold
                    </button>
                    <button class="sim-deck-chip ${activeZ === 1 ? 'active' : ''}" onclick="window.envSimulationEngine.setElement(1)">
                        1 H Hydrogen
                    </button>
                    <button class="sim-deck-chip ${activeZ === 8 ? 'active' : ''}" onclick="window.envSimulationEngine.setElement(8)">
                        8 O Oxygen
                    </button>
                </div>
                <div class="sim-deck-right">
                    <div class="sim-deck-toggles">
                        <button class="sim-deck-chip small" onclick="window.envSimulationEngine.quickJumpPhase('solid'); renderGameDeck('environment');">🧊 Solid</button>
                        <button class="sim-deck-chip small" onclick="window.envSimulationEngine.quickJumpPhase('liquid'); renderGameDeck('environment');">💧 Liquid</button>
                        <button class="sim-deck-chip small" onclick="window.envSimulationEngine.quickJumpPhase('gas'); renderGameDeck('environment');">💨 Gas</button>
                        <button class="sim-deck-chip small" onclick="window.envSimulationEngine.quickJumpPhase('plasma'); renderGameDeck('environment');">⚡ Plasma</button>
                    </div>
                    <button class="sim-deck-hero-btn warn" onclick="window.envSimulationEngine.heat(200); renderGameDeck('environment');">
                        <span>🔥</span> +200K
                    </button>
                    <button class="sim-deck-hero-btn cool" onclick="window.envSimulationEngine.cool(200); renderGameDeck('environment');">
                        <span>❄️</span> -200K
                    </button>
                    <button class="sim-deck-tool-btn" onclick="window.envSimulationEngine.setPreset('earth_stp'); renderGameDeck('environment');" title="Earth Standard STP">
                        <span>🌍</span> STP
                    </button>
                </div>
            `;
        }
    }

    function renderTuningPanel(tabName) {
        renderGameDeck(tabName);
    }

    /**
     * Pedagogical Educational Guide Modal Controller
     */
    function openSimGuideModal() {
        const modal = document.getElementById('sim-guide-modal');
        const iconEl = document.getElementById('sim-guide-modal-icon');
        const headEl = document.getElementById('sim-guide-modal-heading');
        const bodyEl = document.getElementById('sim-guide-modal-content');
        if (!modal || !bodyEl) return;

        const tab = window.simPlaybackController ? window.simPlaybackController.activeTab : 'chain_reaction';

        if (tab === 'chain_reaction') {
            if (iconEl) iconEl.textContent = '⚛️';
            if (headEl) headEl.textContent = 'Nuclear Fission & Chain Reaction Lab';
            bodyEl.innerHTML = `
                <div class="sim-guide-card">
                    <h4>🎯 1. What is Nuclear Fission?</h4>
                    <p>When a slow (thermal) neutron enters a heavy, fissile nucleus like <strong>²³⁵U (Uranium-235)</strong>, the nucleus absorbs it, momentarily becoming excited <strong>²³⁶U*</strong>.</p>
                </div>
                <div class="sim-guide-card">
                    <h4>💧 2. Bohr-Wheeler Liquid Drop Model</h4>
                    <p>The absorbed neutron causes the nuclear liquid droplet to oscillate wildly. When surface tension is overcome by Coulomb repulsion between 92 protons, the nucleus pinches into a dumbbell and snaps into two smaller fragments (e.g. <strong>⁹²Kr</strong> and <strong>¹⁴¹Ba</strong>).</p>
                </div>
                <div class="sim-guide-card">
                    <h4>💥 3. Mass Defect & Energy (E = mc²)</h4>
                    <p>The daughter fragments weigh slightly less than the starting parent. This missing mass converts directly into <strong>~200 MeV</strong> of raw kinetic energy and gamma rays!</p>
                </div>
                <div class="sim-guide-card">
                    <h4>🔄 4. 3-Neutron Chain Cascade & Reactor Control</h4>
                    <p>Each split ejects <strong>2 to 3 fast prompt neutrons</strong>. In dense fuel, these neutrons trigger secondary splits—an exponential chain reaction! In reactors, <strong>Boron Control Rods</strong> absorb excess neutrons to maintain steady critical balance.</p>
                </div>
            `;
        } else if (tab === 'decay') {
            if (iconEl) iconEl.textContent = '☢️';
            if (headEl) headEl.textContent = 'Radioactivity, Transmutation & Half-Life Lab';
            bodyEl.innerHTML = `
                <div class="sim-guide-card">
                    <h4>💥 1. Radioactive Transmutation</h4>
                    <p>An unstable parent nucleus quantum-tunnels a particle out, altering its proton count and transforming into a completely new chemical element (e.g. ²³⁸U → ²³⁴Th + α or ¹⁴C → ¹⁴N + β⁻).</p>
                </div>
                <div class="sim-guide-card">
                    <h4>⏱️ 2. The Law of Radioactive Half-Life</h4>
                    <p>Half-life (t½) is the time needed for 50% of parent atoms to decay. Following <strong>N(t) = N₀ · (½)^(t/t½)</strong>, 100 atoms decay to 50, then 25, then 12.5. Individual decays are quantum random, but large ensembles are mathematically exact!</p>
                </div>
                <div class="sim-guide-card">
                    <h4>🛡️ 3. Shielding & Radiation Types</h4>
                    <p>• <strong>Alpha (α):</strong> Heavy ⁴He nucleus (+2 charge). High ionization, stopped by a single sheet of paper!<br>
                    • <strong>Beta (β):</strong> Fast electron/positron (-1 or +1). Passes paper, stopped by aluminum.<br>
                    • <strong>Gamma (γ):</strong> Ultra-high-energy photon. Highly penetrating, requires dense lead!</p>
                </div>
                <div class="sim-guide-card">
                    <h4>🧲 4. Lorentz Force in Cloud Chambers</h4>
                    <p>In a magnetic field, the Lorentz force <strong>F = q(v × B)</strong> curves charged particles. Positives (alpha) curve up, electrons (beta) spiral down, and neutral gammas fly straight!</p>
                </div>
            `;
        } else if (tab === 'molecule') {
            if (iconEl) iconEl.textContent = '🧬';
            if (headEl) headEl.textContent = 'Molecular Dynamics & Bond Physics';
            bodyEl.innerHTML = `
                <div class="sim-guide-card">
                    <h4>🌊 1. Harmonic Chemical Bonds</h4>
                    <p>Covalent bonds between atoms behave like quantum mechanical springs. Atoms constantly vibrate around their equilibrium bond lengths and bond angles.</p>
                </div>
                <div class="sim-guide-card">
                    <h4>🔥 2. Thermal Kinetic Motion (E ~ kBT)</h4>
                    <p>Temperature is simply the average kinetic energy of molecular vibration and rotation. Higher temperatures cause atoms to jiggle faster and with larger amplitudes.</p>
                </div>
                <div class="sim-guide-card">
                    <h4>👆 3. Interactive Touch Strain</h4>
                    <p>Drag any atom with your finger to stretch or bend its bonds. When you let go, watch the restoring forces oscillate the molecule back to its lowest energy geometry!</p>
                </div>
            `;
        } else if (tab === 'environment') {
            if (iconEl) iconEl.textContent = '🌡️';
            if (headEl) headEl.textContent = 'States of Matter & Thermodynamic Extremes';
            bodyEl.innerHTML = `
                <div class="sim-guide-card">
                    <h4>🧊 1. Solid (Crystalline Lattice)</h4>
                    <p>At low temperatures, interatomic bonds lock atoms into rigid, repeating crystal geometries. Atoms only vibrate around fixed lattice coordinates.</p>
                </div>
                <div class="sim-guide-card">
                    <h4>💧 2. Liquid (Fluid Flow)</h4>
                    <p>As temperature exceeds the melting point, thermal vibration breaks lattice rigidity. Atoms flow smoothly past one another while retaining cohesive intermolecular contact.</p>
                </div>
                <div class="sim-guide-card">
                    <h4>💨 3. Gas & ⚡ Plasma</h4>
                    <p>Above the boiling point, atoms break completely free, flying across the chamber and colliding with the piston to generate pressure. Above 10,000 K, electrons strip away, forming an ionized glowing plasma!</p>
                </div>
                <div class="sim-guide-card">
                    <h4>🌍 4. Pressure Effects (Clausius-Clapeyron)</h4>
                    <p>Extreme pressures force atoms closer together, raising melting points and compressing matter into high-pressure metallic phases (like metallic hydrogen in Jupiter's core).</p>
                </div>
            `;
        }

        modal.style.display = 'flex';
    }

    function closeSimGuideModal() {
        const modal = document.getElementById('sim-guide-modal');
        if (modal) modal.style.display = 'none';
    }

    // Attach Modal Functions Globally
    window.openSimGuideModal = openSimGuideModal;
    window.closeSimGuideModal = closeSimGuideModal;

    /**
     * Setup Direct Pointer/Touch Listeners on Canvases (Zero drawer obstruction)
     */
    function setupCanvasInteractions() {
        // 1. Chain Reaction Canvas
        const chainCanvas = document.getElementById('chain-sim-canvas');
        if (chainCanvas) {
            chainCanvas.addEventListener('pointerdown', (e) => {
                const rect = chainCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                if (window.chainReactionEngine) {
                    window.chainReactionEngine.aimAndFire(x, y);
                }
            });
        }

        // 2. Radioactive Decay Lab Canvas
        const decayCanvas = document.getElementById('decay-sim-canvas');
        if (decayCanvas) {
            decayCanvas.addEventListener('pointerdown', (e) => {
                const engine = window.nuclearDecayEngine;
                if (!engine) return;

                if (engine.currentMode === 'transmutation') {
                    engine.triggerTransmutation();
                } else if (engine.currentMode === 'halflife') {
                    engine.halfLifeRunning = !engine.halfLifeRunning;
                    renderGameDeck('decay');
                } else if (engine.currentMode === 'shielding') {
                    const rect = decayCanvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const w = rect.width;
                    if (Math.abs(x - w * 0.32) < 30) engine.toggleBarrier('paper');
                    else if (Math.abs(x - w * 0.52) < 30) engine.toggleBarrier('aluminum');
                    else if (Math.abs(x - w * 0.72) < 30) engine.toggleBarrier('lead');
                    renderGameDeck('decay');
                } else if (engine.currentMode === 'chamber') {
                    const rect = decayCanvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    engine.triggerDecay(x, y);
                }
            });
        }

        // 3. Environment Phase Chamber Canvas
        const envCanvas = document.getElementById('env-phase-canvas');
        if (envCanvas) {
            envCanvas.addEventListener('pointerdown', (e) => {
                const rect = envCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // View mode HUD switcher pills at top left
                if (y <= 38 && window.envSimulationEngine) {
                    if (x >= 14 && x <= 110) {
                        window.envSimulationEngine.setViewMode('split');
                        return;
                    } else if (x > 110 && x <= 230) {
                        window.envSimulationEngine.setViewMode('chamber');
                        return;
                    } else if (x > 230 && x <= 340) {
                        window.envSimulationEngine.setViewMode('diagram');
                        return;
                    }
                }
            });
        }

        // 4. Molecule Dynamics Canvas Drag/Touch
        const molCanvas = document.getElementById('molecule-sim-canvas');
        if (molCanvas) {
            molCanvas.addEventListener('pointerdown', (e) => {
                const rect = molCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                if (window.molecularDynamicsEngine) {
                    window.molecularDynamicsEngine.startDrag(x, y);
                }
            });

            molCanvas.addEventListener('pointermove', (e) => {
                const rect = molCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                if (window.molecularDynamicsEngine && window.molecularDynamicsEngine.draggedAtom) {
                    window.molecularDynamicsEngine.dragMove(x, y);
                }
            });

            window.addEventListener('pointerup', () => {
                if (window.molecularDynamicsEngine && window.molecularDynamicsEngine.draggedAtom) {
                    window.molecularDynamicsEngine.endDrag();
                }
            });
        }
    }

    // Initialize UI on DOM Ready
    window.addEventListener('DOMContentLoaded', () => {
        setupCanvasInteractions();
        renderGameDeck('chain_reaction');
    });

    // Attach Functions Globally
    window.switchSimTab = switchSimTab;
    window.toggleSimPlayback = toggleSimPlayback;
    window.stepSimFrame = stepSimFrame;
    window.changeSimSpeed = changeSimSpeed;
    window.resetActiveSim = resetActiveSim;
    window.toggleSimAudio = toggleSimAudio;
    window.renderGameDeck = renderGameDeck;
    window.renderTuningPanel = renderTuningPanel;

    // Attach to Global Scope
    window.PhysicsAudioSynthesizer = PhysicsAudioSynthesizer;
    window.SimulationPlaybackController = SimulationPlaybackController;
    window.physicsAudio = new PhysicsAudioSynthesizer();
    window.simPlaybackController = new SimulationPlaybackController();

})();
