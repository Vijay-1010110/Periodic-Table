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

        playComboPulse() {
            if (this.muted) return;
            this.initContext();
            if (!this.ctx) return;

            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, t);
            osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.14);
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

        // Update Tab Buttons and ensure active button is scrolled into view
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

        // Reaction Stepper is ONLY visible for Nuclear Chain Reaction!
        const stepper = document.getElementById('sim-reaction-stepper');
        if (stepper) {
            stepper.style.display = (tabName === 'chain_reaction') ? 'flex' : 'none';
        }

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
    let activeChainSubdeck = 'missions'; // 'missions' | 'controls'

    function setChainSubdeck(deck) {
        activeChainSubdeck = deck;
        renderTuningPanel('chain_reaction');
    }
    window.setChainSubdeck = setChainSubdeck;

    /**
     * Render Contextual Parameter Deck for Active Simulation
     */
    function renderTuningPanel(tabName) {
        const pane = document.getElementById('sim-tuning-pane');
        if (!pane) return;

        if (tabName === 'chain_reaction') {
            const engine = window.chainReactionEngine;
            const missions = engine ? engine.gameMissions : [];
            const completedCount = missions.filter(m => m.completed).length;

            pane.innerHTML = `
                <!-- Sub-deck Game vs Controls Mode Selector -->
                <div class="sim-subdeck-pills">
                    <button class="sim-subdeck-btn ${activeChainSubdeck === 'missions' ? 'active' : ''}" onclick="setChainSubdeck('missions')">
                        🎮 Game Missions (${completedCount}/${missions.length})
                    </button>
                    <button class="sim-subdeck-btn ${activeChainSubdeck === 'controls' ? 'active' : ''}" onclick="setChainSubdeck('controls')">
                        ⚙️ Reactor Controls
                    </button>
                </div>

                <!-- Always Visible Fast Action Arcade Buttons -->
                <div class="sim-arcade-actions-block" style="margin-top: 6px; margin-bottom: 10px;">
                    <button class="sim-action-btn primary large-arcade-btn" onclick="window.chainReactionEngine.injectNeutron()">
                        <span>🚀</span> FIRE NEUTRON (LAUNCH)
                    </button>
                    <button class="sim-action-btn danger large-arcade-btn" onclick="window.chainReactionEngine.triggerSCRAM();">
                        <span>🚨</span> EMERGENCY SCRAM (STOP)
                    </button>
                </div>

                ${activeChainSubdeck === 'missions' ? `
                    <!-- GAME MISSIONS PANEL -->
                    <div class="sim-missions-list">
                        ${missions.map(m => {
                            const pct = Math.min(100, Math.round((m.current / m.goal) * 100));
                            return `
                                <div class="sim-mission-card ${m.completed ? 'completed' : ''}">
                                    <div class="mission-header-row">
                                        <span class="mission-title">${m.title}</span>
                                        <span class="mission-status-badge ${m.completed ? 'done' : 'active'}">
                                            ${m.completed ? 'COMPLETED ✅' : 'IN PROGRESS ⏳'}
                                        </span>
                                    </div>
                                    <div class="mission-desc">${m.desc}</div>
                                    <div class="mission-progress-bar-wrap">
                                        <div class="mission-progress-bar" style="width: ${pct}%;"></div>
                                    </div>
                                    <div class="mission-footer-row">
                                        <span class="mission-progress-text">${typeof m.current === 'number' && m.current % 1 !== 0 ? m.current.toFixed(1) : m.current} / ${m.goal}</span>
                                        <span class="mission-reward-badge">${m.badge}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <p style="font-size:0.80rem; color:#94a3b8; line-height:1.4; margin:4px 0 0; text-align:center;">
                        🎯 <em>Tip: Tap anywhere on the reactor grid to aim & shoot a neutron directly at fuel atoms!</em>
                    </p>
                ` : `
                    <!-- REACTOR CONTROLS PANEL -->
                    <div class="sim-pane-section">
                        <div class="sim-pane-title"><span>⚛️</span> Reactor Core Parameters</div>
                        
                        <div class="sim-input-row">
                            <label class="sim-input-label"><span>Fissile Fuel Element:</span></label>
                            <select class="sim-speed-select large-sim-select" onchange="window.chainReactionEngine.setFuel(this.value)">
                                <option value="U235" ${engine && engine.fuelType === 'U235' ? 'selected' : ''}>²³⁵U Uranium-235 (Commercial Fissile)</option>
                                <option value="PU239" ${engine && engine.fuelType === 'PU239' ? 'selected' : ''}>²³⁹Pu Plutonium-239 (Fast Neutron)</option>
                                <option value="U238" ${engine && engine.fuelType === 'U238' ? 'selected' : ''}>²³⁸U Uranium-238 (Depleted Fertile)</option>
                            </select>
                        </div>

                        <div class="sim-input-row">
                            <label class="sim-input-label"><span>Moderator Medium:</span></label>
                            <select class="sim-speed-select large-sim-select" onchange="window.chainReactionEngine.setModerator(this.value)">
                                <option value="light_water" ${engine && engine.moderatorType === 'light_water' ? 'selected' : ''}>Light Water H₂O (Thermalizes Neutrons)</option>
                                <option value="heavy_water" ${engine && engine.moderatorType === 'heavy_water' ? 'selected' : ''}>Heavy Water D₂O (Low Absorption)</option>
                                <option value="graphite" ${engine && engine.moderatorType === 'graphite' ? 'selected' : ''}>Nuclear Graphite (Solid Core)</option>
                                <option value="vacuum" ${engine && engine.moderatorType === 'vacuum' ? 'selected' : ''}>Vacuum (Fast Reactor, No Slowing)</option>
                            </select>
                        </div>

                        <div class="sim-input-row">
                            <div class="sim-input-label">
                                <span>Control Rods (Absorption):</span>
                                <span id="rod-val-display" class="sim-val-badge">${((engine ? engine.controlRodInsertion : 0.35) * 100).toFixed(0)}%</span>
                            </div>
                            <input type="range" class="sim-range-slider" min="0" max="100" value="${((engine ? engine.controlRodInsertion : 0.35) * 100).toFixed(0)}" oninput="document.getElementById('rod-val-display').textContent=this.value+'%'; window.chainReactionEngine.setControlRods(this.value/100);">
                            <div class="slider-hint-row">
                                <span>⚡ Pull (More Power)</span>
                                <span>⬇️ Insert (Cool Down)</span>
                            </div>
                        </div>
                    </div>
                `}
            `;
        } else if (tabName === 'decay') {
            const engine = window.nuclearDecayEngine;
            pane.innerHTML = `
                <!-- Always Visible Fast Action Arcade Buttons at TOP -->
                <div class="sim-arcade-actions-block" style="margin-bottom: 10px;">
                    <button class="sim-action-btn primary large-arcade-btn" onclick="window.nuclearDecayEngine.triggerDecay()">
                        <span>⚡</span> EMIT RADIATION PULSE
                    </button>
                    <button class="sim-action-btn" style="background:rgba(255,255,255,0.08); color:#cbd5e1; border:1px solid rgba(255,255,255,0.18);" onclick="window.nuclearDecayEngine.droplets=[]; window.nuclearDecayEngine.particles=[];">
                        <span>🧹</span> CLEAR VAPOR TRACKS
                    </button>
                </div>

                <div class="sim-pane-section">
                    <div class="sim-pane-title"><span>☢️</span> Particle Cloud Chamber</div>
                    <div class="sim-input-row">
                        <label class="sim-input-label"><span>Nuclide Radiation Source:</span></label>
                        <select class="sim-speed-select large-sim-select" onchange="window.nuclearDecayEngine.setPreset(this.value)">
                            ${window.DECAY_PRESETS.map(p => `<option value="${p.id}" ${engine && engine.currentPresetId === p.id ? 'selected' : ''}>${p.name} (${p.particle})</option>`).join('')}
                        </select>
                    </div>
                    <div class="sim-input-row">
                        <div class="sim-input-label">
                            <span>Magnetic Field B:</span>
                            <span id="b-val-display" class="sim-val-badge">${engine ? engine.magneticFieldTesla.toFixed(1) : '1.0'} Tesla</span>
                        </div>
                        <input type="range" class="sim-range-slider" min="-30" max="30" value="${(engine ? engine.magneticFieldTesla : 1.0) * 10}" oninput="const b=this.value/10; document.getElementById('b-val-display').textContent=(b>0?'+':'')+b.toFixed(1)+' Tesla'; window.nuclearDecayEngine.setMagneticField(b);">
                        <div class="slider-hint-row">
                            <span>⊗ Inward (-B)</span>
                            <span>⊙ Outward (+B)</span>
                        </div>
                    </div>
                    <div class="sim-input-row">
                        <label class="sim-input-label"><span>Emission Mode:</span></label>
                        <select class="sim-speed-select large-sim-select" onchange="window.nuclearDecayEngine.autoTrigger=(this.value==='auto')">
                            <option value="auto" ${engine && engine.autoTrigger ? 'selected' : ''}>Continuous Radiation Beam</option>
                            <option value="manual" ${engine && !engine.autoTrigger ? 'selected' : ''}>Manual Pulses Only</option>
                        </select>
                    </div>
                </div>

                <p style="font-size:0.78rem; color:#94a3b8; line-height:1.4; margin:4px 0 0; text-align:center;">
                    💡 <strong>Lorentz Force:</strong> Positively charged α curves gently; negatively charged β⁻ curls tightly opposite!
                </p>
            `;
        } else if (tabName === 'molecule') {
            const engine = window.molecularDynamicsEngine;
            pane.innerHTML = `
                <!-- Always Visible Fast Action Arcade Buttons at TOP -->
                <div class="sim-arcade-actions-block" style="margin-bottom: 10px;">
                    <button class="sim-action-btn primary large-arcade-btn" onclick="window.molecularDynamicsEngine.loadPreset(window.molecularDynamicsEngine.currentKey)">
                        <span>🔄</span> RESET REST GEOMETRY
                    </button>
                    <button class="sim-action-btn" style="background:rgba(168,85,247,0.18); color:#d8b4fe; border:1px solid rgba(168,85,247,0.4);" onclick="if(window.molecularDynamicsEngine){window.molecularDynamicsEngine.atoms.forEach(a=>{a.vx+=(Math.random()-0.5)*200;a.vy+=(Math.random()-0.5)*200;}); if(window.physicsAudio)window.physicsAudio.playBondReleaseSnap();}">
                        <span>⚡</span> JOLT THERMAL VIBRATION
                    </button>
                </div>

                <div class="sim-pane-section">
                    <div class="sim-pane-title"><span>🧬</span> Molecule Topology & Physics</div>
                    <div class="sim-input-row">
                        <label class="sim-input-label"><span>Chemical Molecule:</span></label>
                        <select class="sim-speed-select large-sim-select" onchange="window.molecularDynamicsEngine.loadPreset(this.value)">
                            <option value="H2O" ${engine && engine.currentKey === 'H2O' ? 'selected' : ''}>Water (H₂O - Polar Covalent)</option>
                            <option value="CO2" ${engine && engine.currentKey === 'CO2' ? 'selected' : ''}>Carbon Dioxide (CO₂ - Linear Double Bond)</option>
                            <option value="CH4" ${engine && engine.currentKey === 'CH4' ? 'selected' : ''}>Methane (CH₄ - Tetrahedral Hydrocarbon)</option>
                            <option value="C6H6" ${engine && engine.currentKey === 'C6H6' ? 'selected' : ''}>Benzene (C₆H₆ - Aromatic Ring)</option>
                        </select>
                    </div>
                    <div class="sim-input-row">
                        <div class="sim-input-label">
                            <span>Thermal Temperature:</span>
                            <span id="mol-temp-display" class="sim-val-badge">${engine ? engine.temperatureK.toFixed(0) : '300'} K</span>
                        </div>
                        <input type="range" class="sim-range-slider" min="1" max="2500" value="${engine ? engine.temperatureK : 300}" oninput="document.getElementById('mol-temp-display').textContent=this.value+' K'; window.molecularDynamicsEngine.setTemperature(this.value);">
                        <div class="slider-hint-row">
                            <span>❄️ Absolute Zero (1 K)</span>
                            <span>🔥 Extreme Agitation (2500 K)</span>
                        </div>
                    </div>
                </div>

                <p style="font-size:0.78rem; color:#00d4ff; font-weight:600; line-height:1.4; margin:4px 0 0; text-align:center;">
                    🎮 <strong>Touch Gameplay:</strong> Drag any atom on screen with your finger to stretch chemical bonds like quantum springs!
                </p>
            `;
        } else if (tabName === 'environment') {
            const engine = window.envSimulationEngine;
            const allElements = (typeof elementsData !== 'undefined' ? elementsData : (window.elementsData || []));
            const elData = allElements.find(e => e.atomicNumber === (engine ? engine.activeElementId : 6));
            const phase = engine ? engine.calculatePhase(elData) : { badge: '🧊 SOLID', color: '#00d4ff', details: 'Rigid crystalline lattice.' };

            pane.innerHTML = `
                <!-- Always Visible Fast Action Presets at TOP -->
                <div class="sim-arcade-actions-block" style="margin-bottom: 10px;">
                    <div style="display:flex; gap:6px;">
                        <button class="sim-action-btn" style="flex:1; padding:8px 6px; font-size:0.78rem; background:rgba(0,212,255,0.18); border:1px solid rgba(0,212,255,0.4); color:#00d4ff;" onclick="window.envSimulationEngine.setPreset('earth_stp'); renderTuningPanel('environment');">
                            🌍 Earth STP
                        </button>
                        <button class="sim-action-btn" style="flex:1; padding:8px 6px; font-size:0.78rem; background:rgba(59,130,246,0.18); border:1px solid rgba(59,130,246,0.4); color:#93c5fd;" onclick="window.envSimulationEngine.setPreset('deep_space'); renderTuningPanel('environment');">
                            ❄️ Cryo Deep
                        </button>
                        <button class="sim-action-btn" style="flex:1; padding:8px 6px; font-size:0.78rem; background:rgba(239,68,68,0.18); border:1px solid rgba(239,68,68,0.4); color:#fca5a5;" onclick="window.envSimulationEngine.setPreset('sun_core'); renderTuningPanel('environment');">
                            ☀️ Solar Core
                        </button>
                    </div>
                </div>

                <div class="sim-pane-section">
                    <div class="sim-pane-title"><span>🌍</span> Extreme Cosmic Environments</div>
                    <div class="sim-input-row">
                        <label class="sim-input-label"><span>Cosmic / Planetary Preset:</span></label>
                        <select class="sim-speed-select large-sim-select" onchange="window.envSimulationEngine.setPreset(this.value); renderTuningPanel('environment');">
                            ${window.ENVIRONMENT_PRESETS.map(p => `<option value="${p.id}" ${engine && engine.currentPresetId === p.id ? 'selected' : ''}>${p.icon} ${p.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="sim-input-row">
                        <div class="sim-input-label">
                            <span>Temperature:</span>
                            <span id="env-temp-display" class="sim-val-badge">${engine ? (engine.temperatureK < 10 ? engine.temperatureK.toFixed(2) : engine.temperatureK.toFixed(0)) : '298'} K</span>
                        </div>
                        <input type="range" class="sim-range-slider" min="0" max="6000" value="${engine ? Math.min(6000, engine.temperatureK) : 298}" oninput="document.getElementById('env-temp-display').textContent=this.value+' K'; window.envSimulationEngine.setTemperature(this.value); renderTuningPanel('environment');">
                    </div>
                    <div class="sim-input-row">
                        <div class="sim-input-label">
                            <span>Pressure:</span>
                            <span id="env-press-display" class="sim-val-badge">${engine ? (engine.pressureAtm < 0.01 ? engine.pressureAtm.toExponential(2) : (engine.pressureAtm > 1e4 ? engine.pressureAtm.toExponential(2) : engine.pressureAtm.toFixed(2))) : '1.0'} atm</span>
                        </div>
                        <input type="range" class="sim-range-slider" min="-12" max="9" step="0.2" value="${engine ? Math.log10(Math.max(1e-12, engine.pressureAtm)) : 0}" oninput="const p=Math.pow(10, parseFloat(this.value)); window.envSimulationEngine.setPressure(p); renderTuningPanel('environment');">
                    </div>
                </div>

                <div class="sim-pane-section">
                    <div class="sim-pane-title"><span>📊</span> Phase State</div>
                    <div style="display:inline-block; padding:6px 12px; border-radius:8px; font-weight:800; font-family:var(--font-mono); font-size:0.95rem; background:rgba(0,0,0,0.4); border:1px solid ${phase.color || '#00d4ff'}; color:${phase.color || '#00d4ff'}; margin-bottom:8px;">
                        ${phase.badge || '🧊 SOLID'}
                    </div>
                    <p style="font-size:0.78rem; color:#cbd5e1; line-height:1.4; margin:0;">
                        ${phase.details || 'Rigid crystalline lattice.'}
                    </p>
                </div>
            `;
        }
    }

    /**
     * Setup Interactive Touch/Pointer Listeners on Canvases (CSS Pixel Space)
     */
    function setupCanvasInteractions() {
        // 1. Chain Reaction Canvas Click/Tap (Aims & Fires neutron toward tap)
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

        // 2. Decay Chamber Click/Tap (Triggers localized decay pulse)
        const decayCanvas = document.getElementById('decay-sim-canvas');
        if (decayCanvas) {
            decayCanvas.addEventListener('pointerdown', (e) => {
                const rect = decayCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
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
