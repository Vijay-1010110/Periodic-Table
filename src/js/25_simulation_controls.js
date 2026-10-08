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

            // Short burst 2.4 kHz click with random jitter
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(2200 + (Math.random() - 0.5) * 600, t);
            gain.gain.setValueAtTime(0.25, t);
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
            osc.frequency.setValueAtTime(880, t);
            osc.frequency.exponentialRampToValueAtTime(220, t + 0.08);

            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.09);
        }

        playFissionClick() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, t);
            osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

            gain.gain.setValueAtTime(0.45, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.15);
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

            gain.gain.setValueAtTime(0.2, t);
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

            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.32);
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
            if (btn.getAttribute('data-sim') === tabName) btn.classList.add('active');
            else btn.classList.remove('active');
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

        renderTuningPanel(tabName);
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
        } else if (tab === 'molecule' && window.molecularDynamicsEngine) {
            window.molecularDynamicsEngine.loadPreset(window.molecularDynamicsEngine.currentKey);
        }
    }

    function toggleSimAudio() {
        if (!window.physicsAudio) return;
        window.physicsAudio.muted = !window.physicsAudio.muted;
        const btn = document.getElementById('sim-btn-sound');
        if (btn) btn.innerHTML = window.physicsAudio.muted ? '🔇' : '🔊';
    }

    /**
     * Render Contextual Parameter Deck for Active Simulation
     */
    function renderTuningPanel(tabName) {
        const pane = document.getElementById('sim-tuning-pane');
        if (!pane) return;

        if (tabName === 'chain_reaction') {
            const engine = window.chainReactionEngine;
            pane.innerHTML = `
                <div class="sim-pane-section">
                    <div class="sim-pane-title"><span>⚛️</span> Reactor Parameters</div>
                    <div class="sim-input-row">
                        <label class="sim-input-label"><span>Fissile Fuel:</span></label>
                        <select class="sim-speed-select" style="width:100%;" onchange="window.chainReactionEngine.setFuel(this.value)">
                            <option value="U235" ${engine && engine.fuelType === 'U235' ? 'selected' : ''}>Uranium-235 (Thermal)</option>
                            <option value="PU239" ${engine && engine.fuelType === 'PU239' ? 'selected' : ''}>Plutonium-239 (Fast)</option>
                            <option value="U238" ${engine && engine.fuelType === 'U238' ? 'selected' : ''}>Uranium-238 (Depleted)</option>
                        </select>
                    </div>
                    <div class="sim-input-row">
                        <label class="sim-input-label"><span>Moderator Medium:</span></label>
                        <select class="sim-speed-select" style="width:100%;" onchange="window.chainReactionEngine.setModerator(this.value)">
                            <option value="light_water" ${engine && engine.moderatorType === 'light_water' ? 'selected' : ''}>Light Water (H₂O)</option>
                            <option value="heavy_water" ${engine && engine.moderatorType === 'heavy_water' ? 'selected' : ''}>Heavy Water (D₂O)</option>
                            <option value="graphite" ${engine && engine.moderatorType === 'graphite' ? 'selected' : ''}>Nuclear Graphite (C)</option>
                            <option value="vacuum" ${engine && engine.moderatorType === 'vacuum' ? 'selected' : ''}>Vacuum (Fast Core)</option>
                        </select>
                    </div>
                    <div class="sim-input-row">
                        <label class="sim-input-label"><span>Control Rods (Absorber):</span><span id="rod-val-display" class="sim-val-badge">${((engine ? engine.controlRodInsertion : 0.35) * 100).toFixed(0)}%</span></label>
                        <input type="range" class="sim-range-slider" min="0" max="100" value="${((engine ? engine.controlRodInsertion : 0.35) * 100).toFixed(0)}" oninput="document.getElementById('rod-val-display').textContent=this.value+'%'; window.chainReactionEngine.setControlRods(this.value/100);">
                    </div>
                </div>

                <div class="sim-pane-section" style="display:flex; flex-direction:column; gap:8px;">
                    <button class="sim-action-btn primary" onclick="window.chainReactionEngine.injectNeutron()">
                        <span>🚀</span> Inject Prompt Neutron
                    </button>
                    <button class="sim-action-btn danger" onclick="window.chainReactionEngine.triggerSCRAM(); document.getElementById('rod-val-display').textContent='100%';">
                        <span>🚨</span> EMERGENCY SCRAM
                    </button>
                </div>
                <p style="font-size:0.68rem; color:#64748b; line-height:1.4;">
                    💡 <em>Tip: Tap anywhere on the reactor viewport to launch a neutron in that direction!</em>
                </p>
            `;
        } else if (tabName === 'decay') {
            const engine = window.nuclearDecayEngine;
            pane.innerHTML = `
                <div class="sim-pane-section">
                    <div class="sim-pane-title"><span>☢️</span> Particle Chamber</div>
                    <div class="sim-input-row">
                        <label class="sim-input-label"><span>Nuclide Source:</span></label>
                        <select class="sim-speed-select" style="width:100%;" onchange="window.nuclearDecayEngine.setPreset(this.value)">
                            ${window.DECAY_PRESETS.map(p => `<option value="${p.id}" ${engine && engine.currentPresetId === p.id ? 'selected' : ''}>${p.name} (${p.particle})</option>`).join('')}
                        </select>
                    </div>
                    <div class="sim-input-row">
                        <label class="sim-input-label"><span>Magnetic Field B:</span><span id="b-val-display" class="sim-val-badge">${engine ? engine.magneticFieldTesla.toFixed(1) : '1.0'} T</span></label>
                        <input type="range" class="sim-range-slider" min="-30" max="30" value="${(engine ? engine.magneticFieldTesla : 1.0) * 10}" oninput="const b=this.value/10; document.getElementById('b-val-display').textContent=(b>0?'+':'')+b.toFixed(1)+' T'; window.nuclearDecayEngine.setMagneticField(b);">
                    </div>
                    <div class="sim-input-row">
                        <label class="sim-input-label"><span>Emission Mode:</span></label>
                        <select class="sim-speed-select" style="width:100%;" onchange="window.nuclearDecayEngine.autoTrigger=(this.value==='auto')">
                            <option value="auto" ${engine && engine.autoTrigger ? 'selected' : ''}>Continuous Emission</option>
                            <option value="manual" ${engine && !engine.autoTrigger ? 'selected' : ''}>Manual Pulses Only</option>
                        </select>
                    </div>
                </div>

                <div class="sim-pane-section" style="display:flex; flex-direction:column; gap:8px;">
                    <button class="sim-action-btn primary" onclick="window.nuclearDecayEngine.triggerDecay()">
                        <span>⚡</span> Emit Radiation Pulse
                    </button>
                    <button class="sim-action-btn" style="background:rgba(255,255,255,0.06); color:#cbd5e1;" onclick="window.nuclearDecayEngine.droplets=[]; window.nuclearDecayEngine.particles=[];">
                        <span>🧹</span> Clear Vapor Tracks
                    </button>
                </div>
                <p style="font-size:0.68rem; color:#64748b; line-height:1.4;">
                    Lorentz Force F = q(v × B) curves positively charged α particles gently and negatively charged β⁻ electrons into tight spirals!
                </p>
            `;
        } else if (tabName === 'molecule') {
            const engine = window.molecularDynamicsEngine;
            pane.innerHTML = `
                <div class="sim-pane-section">
                    <div class="sim-pane-title"><span>🧬</span> Molecule Topology</div>
                    <div class="sim-input-row">
                        <label class="sim-input-label"><span>Molecule:</span></label>
                        <select class="sim-speed-select" style="width:100%;" onchange="window.molecularDynamicsEngine.loadPreset(this.value)">
                            <option value="H2O" ${engine && engine.currentKey === 'H2O' ? 'selected' : ''}>Water (H₂O)</option>
                            <option value="CO2" ${engine && engine.currentKey === 'CO2' ? 'selected' : ''}>Carbon Dioxide (CO₂)</option>
                            <option value="CH4" ${engine && engine.currentKey === 'CH4' ? 'selected' : ''}>Methane (CH₄)</option>
                            <option value="C6H6" ${engine && engine.currentKey === 'C6H6' ? 'selected' : ''}>Benzene (C₆H₆)</option>
                        </select>
                    </div>
                    <div class="sim-input-row">
                        <label class="sim-input-label"><span>Thermal Temperature:</span><span id="mol-temp-display" class="sim-val-badge">${engine ? engine.temperatureK.toFixed(0) : '300'} K</span></label>
                        <input type="range" class="sim-range-slider" min="1" max="2500" value="${engine ? engine.temperatureK : 300}" oninput="document.getElementById('mol-temp-display').textContent=this.value+' K'; window.molecularDynamicsEngine.setTemperature(this.value);">
                    </div>
                </div>

                <div class="sim-pane-section" style="display:flex; flex-direction:column; gap:8px;">
                    <button class="sim-action-btn primary" onclick="window.molecularDynamicsEngine.loadPreset(window.molecularDynamicsEngine.currentKey)">
                        <span>🔄</span> Reset Rest Geometry
                    </button>
                </div>
                <p style="font-size:0.68rem; color:#00d4ff; font-weight:600; line-height:1.4;">
                    🎮 <strong>Tactile Interaction:</strong> Touch and drag any atom in the viewport to stretch chemical bonds like spring wires!
                </p>
            `;
        } else if (tabName === 'environment') {
            const engine = window.envSimulationEngine;
            const elData = window.elementsData ? window.elementsData.find(e => e.atomicNumber === (engine ? engine.activeElementId : 6)) : null;
            const phase = engine ? engine.calculatePhase(elData) : { badge: 'SOLID', color: '#00d4ff', details: '' };

            pane.innerHTML = `
                <div class="sim-pane-section">
                    <div class="sim-pane-title"><span>🌍</span> Extreme Environments</div>
                    <div class="sim-input-row">
                        <label class="sim-input-label"><span>Cosmic / Lab Preset:</span></label>
                        <select class="sim-speed-select" style="width:100%;" onchange="window.envSimulationEngine.setPreset(this.value); renderTuningPanel('environment');">
                            ${window.ENVIRONMENT_PRESETS.map(p => `<option value="${p.id}" ${engine && engine.currentPresetId === p.id ? 'selected' : ''}>${p.icon} ${p.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="sim-input-row">
                        <label class="sim-input-label"><span>Temperature:</span><span id="env-temp-display" class="sim-val-badge">${engine ? (engine.temperatureK < 10 ? engine.temperatureK.toFixed(2) : engine.temperatureK.toFixed(0)) : '298'} K</span></label>
                        <input type="range" class="sim-range-slider" min="0" max="6000" value="${engine ? Math.min(6000, engine.temperatureK) : 298}" oninput="document.getElementById('env-temp-display').textContent=this.value+' K'; window.envSimulationEngine.setTemperature(this.value); renderTuningPanel('environment');">
                    </div>
                    <div class="sim-input-row">
                        <label class="sim-input-label"><span>Pressure:</span><span id="env-press-display" class="sim-val-badge">${engine ? (engine.pressureAtm < 0.01 ? engine.pressureAtm.toExponential(2) : (engine.pressureAtm > 1e4 ? engine.pressureAtm.toExponential(2) : engine.pressureAtm.toFixed(2))) : '1.0'} atm</span></label>
                        <input type="range" class="sim-range-slider" min="-12" max="9" step="0.2" value="${engine ? Math.log10(Math.max(1e-12, engine.pressureAtm)) : 0}" oninput="const p=Math.pow(10, parseFloat(this.value)); window.envSimulationEngine.setPressure(p); renderTuningPanel('environment');">
                    </div>
                </div>

                <div class="sim-pane-section">
                    <div class="sim-pane-title"><span>📊</span> Phase Determination</div>
                    <div style="display:inline-block; padding:4px 8px; border-radius:6px; font-weight:800; font-family:var(--font-mono); font-size:0.75rem; background:rgba(0,0,0,0.4); border:1px solid ${phase.color}; color:${phase.color}; margin-bottom:6px;">
                        ${phase.badge}
                    </div>
                    <p style="font-size:0.70rem; color:#cbd5e1; line-height:1.4; margin:0;">
                        ${phase.details}
                    </p>
                </div>
            `;
        }
    }

    /**
     * Setup Interactive Touch/Pointer Listeners on Canvases
     */
    function setupCanvasInteractions() {
        // 1. Chain Reaction Canvas Click/Tap (Injects neutron at tap position)
        const chainCanvas = document.getElementById('chain-sim-canvas');
        if (chainCanvas) {
            chainCanvas.addEventListener('pointerdown', (e) => {
                const rect = chainCanvas.getBoundingClientRect();
                const scaleX = chainCanvas.width / rect.width;
                const scaleY = chainCanvas.height / rect.height;
                const x = (e.clientX - rect.left) * scaleX;
                const y = (e.clientY - rect.top) * scaleY;
                if (window.chainReactionEngine) {
                    window.chainReactionEngine.injectNeutron(x, y, (Math.random() - 0.5) * 6.28);
                }
            });
        }

        // 2. Decay Chamber Click/Tap (Triggers localized decay pulse)
        const decayCanvas = document.getElementById('decay-sim-canvas');
        if (decayCanvas) {
            decayCanvas.addEventListener('pointerdown', (e) => {
                const rect = decayCanvas.getBoundingClientRect();
                const scaleX = decayCanvas.width / rect.width;
                const scaleY = decayCanvas.height / rect.height;
                const x = (e.clientX - rect.left) * scaleX;
                const y = (e.clientY - rect.top) * scaleY;
                if (window.nuclearDecayEngine) {
                    window.nuclearDecayEngine.triggerDecay(x, y);
                }
            });
        }

        // 3. Molecule Dynamics Canvas Drag/Touch
        const molCanvas = document.getElementById('molecule-sim-canvas');
        if (molCanvas) {
            molCanvas.addEventListener('pointerdown', (e) => {
                const rect = molCanvas.getBoundingClientRect();
                const scaleX = molCanvas.width / rect.width;
                const scaleY = molCanvas.height / rect.height;
                const x = (e.clientX - rect.left) * scaleX;
                const y = (e.clientY - rect.top) * scaleY;
                if (window.molecularDynamicsEngine) {
                    window.molecularDynamicsEngine.startDrag(x, y);
                }
            });

            molCanvas.addEventListener('pointermove', (e) => {
                const rect = molCanvas.getBoundingClientRect();
                const scaleX = molCanvas.width / rect.width;
                const scaleY = molCanvas.height / rect.height;
                const x = (e.clientX - rect.left) * scaleX;
                const y = (e.clientY - rect.top) * scaleY;
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
        renderTuningPanel('chain_reaction');
    });

    // Attach Functions Globally
    window.switchSimTab = switchSimTab;
    window.toggleSimPlayback = toggleSimPlayback;
    window.stepSimFrame = stepSimFrame;
    window.changeSimSpeed = changeSimSpeed;
    window.resetActiveSim = resetActiveSim;
    window.toggleSimAudio = toggleSimAudio;
    window.renderTuningPanel = renderTuningPanel;

    // Attach to Global Scope
    window.PhysicsAudioSynthesizer = PhysicsAudioSynthesizer;
    window.SimulationPlaybackController = SimulationPlaybackController;
    window.physicsAudio = new PhysicsAudioSynthesizer();
    window.simPlaybackController = new SimulationPlaybackController();

})();
