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
        } else if (tab === 'environment' && window.envSimulationEngine) {
            window.envSimulationEngine.setPreset('earth_stp');
        }
    }

    function toggleSimAudio() {
        if (!window.physicsAudio) return;
        window.physicsAudio.muted = !window.physicsAudio.muted;
        const btn = document.getElementById('sim-btn-sound');
        if (btn) btn.innerHTML = window.physicsAudio.muted ? '🔇' : '🔊';
    }

    // Collapsible Drawer / Bottom Sheet Controller
    function toggleSimDrawer(forceState) {
        const pane = document.getElementById('sim-tuning-pane');
        const toggleBtn = document.getElementById('sim-drawer-toggle');
        const arrow = document.getElementById('sim-drawer-arrow');
        if (!pane) return;

        if (typeof forceState === 'boolean') {
            if (forceState) {
                pane.classList.remove('sim-drawer-collapsed');
            } else {
                pane.classList.add('sim-drawer-collapsed');
            }
        } else {
            pane.classList.toggle('sim-drawer-collapsed');
        }

        const isCollapsed = pane.classList.contains('sim-drawer-collapsed');
        if (arrow) {
            arrow.textContent = isCollapsed ? '▲' : '▼';
        }
        if (toggleBtn) {
            toggleBtn.classList.toggle('drawer-open', !isCollapsed);
        }
    }
    window.toggleSimDrawer = toggleSimDrawer;

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
            const curScenario = engine ? engine.currentScenario : 'single_fission';
            const missions = engine ? engine.gameMissions : [];
            const completedCount = missions.filter(m => m.completed).length;

            pane.innerHTML = `
                <div class="sim-drawer-header">
                    <div class="sim-drawer-title">
                        <span>⚛️</span>
                        <span>Fission &amp; Missions</span>
                    </div>
                    <button class="sim-drawer-close-btn" onclick="toggleSimDrawer(false)" title="Close controls">✕</button>
                </div>

                <!-- Scenario Selector Pills (PhET / Brilliant.org Progression) -->
                <div class="sim-scenario-pills">
                    <button class="sim-scenario-btn ${curScenario === 'single_fission' ? 'active' : ''}" onclick="window.chainReactionEngine.setScenario('single_fission')">
                        🎯 1. Single Atom
                    </button>
                    <button class="sim-scenario-btn ${curScenario === 'chain_sandbox' ? 'active' : ''}" onclick="window.chainReactionEngine.setScenario('chain_sandbox')">
                        ⚡ 2. Sandbox
                    </button>
                    <button class="sim-scenario-btn ${curScenario === 'reactor_core' ? 'active' : ''}" onclick="window.chainReactionEngine.setScenario('reactor_core')">
                        🔋 3. Reactor Core
                    </button>
                </div>

                <!-- Thumb-Zone Fast Actions -->
                <div class="sim-arcade-actions-block" style="margin-top: 2px; margin-bottom: 8px;">
                    <button class="sim-action-btn primary large-arcade-btn" onclick="window.chainReactionEngine.injectNeutron()">
                        <span>🚀</span> ${curScenario === 'single_fission' ? 'FIRE THERMAL NEUTRON' : 'FIRE NEUTRON (LAUNCH)'}
                    </button>
                    ${curScenario === 'reactor_core' ? `
                        <button class="sim-action-btn danger large-arcade-btn" onclick="window.chainReactionEngine.triggerSCRAM()">
                            <span>🚨</span> EMERGENCY SCRAM (STOP)
                        </button>
                    ` : `
                        <button class="sim-action-btn" style="background:rgba(255,255,255,0.08); color:#cbd5e1; border:1px solid rgba(255,255,255,0.18);" onclick="window.chainReactionEngine.initChamber()">
                            <span>🔄</span> RESET ${curScenario === 'single_fission' ? 'NUCLEUS' : 'CORE'}
                        </button>
                    `}
                </div>

                ${curScenario === 'single_fission' ? `
                    <!-- SCENARIO 1 TUTORIAL GUIDE -->
                    <div class="sim-pane-section">
                        <div class="sim-pane-title"><span>🔬</span> Fission Mechanics Guide</div>
                        <p style="font-size:0.80rem; color:#cbd5e1; line-height:1.45; margin:0 0 10px;">
                            <strong>Bohr-Wheeler Liquid Drop Model:</strong>
                        </p>
                        <ul style="font-size:0.77rem; color:#94a3b8; padding-left:18px; line-height:1.4; margin:0 0 10px;">
                            <li><strong>Step 1:</strong> Incoming thermal neutron (+0.025 eV) absorbs into ²³⁵U.</li>
                            <li><strong>Step 2:</strong> ²³⁶U* compound nucleus wobbles & elongates into a dumbbell.</li>
                            <li><strong>Step 3:</strong> Coulomb repulsion overcomes strong force: scission split into ⁹²Kr + ¹⁴¹Ba.</li>
                            <li><strong>Step 4:</strong> 3 prompt fast neutrons eject, ready to multiply!</li>
                        </ul>
                        <div style="background:rgba(0,212,255,0.08); border:1px solid rgba(0,212,255,0.25); border-radius:8px; padding:8px 10px; font-size:0.76rem; color:#38bdf8;">
                            🎯 <em>Tap "FIRE THERMAL NEUTRON" or tap the nucleus to watch automatic slow motion!</em>
                        </div>
                    </div>
                ` : curScenario === 'chain_sandbox' ? `
                    <!-- SCENARIO 2 SANDBOX & MISSIONS -->
                    <div class="sim-subdeck-pills">
                        <button class="sim-subdeck-btn ${activeChainSubdeck === 'missions' ? 'active' : ''}" onclick="setChainSubdeck('missions')">
                            🎮 Missions (${completedCount}/${missions.length})
                        </button>
                        <button class="sim-subdeck-btn ${activeChainSubdeck === 'controls' ? 'active' : ''}" onclick="setChainSubdeck('controls')">
                            ⚙️ Atom Density
                        </button>
                    </div>

                    ${activeChainSubdeck === 'missions' ? `
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
                    ` : `
                        <div class="sim-pane-section">
                            <div class="sim-pane-title"><span>⚛️</span> Fuel Cluster Density</div>
                            <div class="sim-input-row">
                                <div class="sim-input-label">
                                    <span>Fuel Atom Count:</span>
                                    <span id="density-val-display" class="sim-val-badge">${engine ? engine.atomDensity : 45}</span>
                                </div>
                                <input type="range" class="sim-range-slider" min="15" max="100" value="${engine ? engine.atomDensity : 45}" oninput="document.getElementById('density-val-display').textContent=this.value; window.chainReactionEngine.setAtomDensity(this.value);">
                                <div class="slider-hint-row">
                                    <span>Sparse (Controlled)</span>
                                    <span>Dense (Critical Cascade)</span>
                                </div>
                            </div>
                            <div class="sim-input-row">
                                <label class="sim-input-label"><span>Fissile Fuel:</span></label>
                                <select class="sim-speed-select large-sim-select" onchange="window.chainReactionEngine.setFuel(this.value)">
                                    <option value="U235" ${engine && engine.fuelType === 'U235' ? 'selected' : ''}>²³⁵U Uranium-235 (Enriched)</option>
                                    <option value="PU239" ${engine && engine.fuelType === 'PU239' ? 'selected' : ''}>²³⁹Pu Plutonium-239 (Fast)</option>
                                    <option value="U238" ${engine && engine.fuelType === 'U238' ? 'selected' : ''}>²³⁸U Depleted (Fertile)</option>
                                </select>
                            </div>
                        </div>
                    `}
                ` : `
                    <!-- SCENARIO 3 REACTOR CORE -->
                    <div class="sim-pane-section">
                        <div class="sim-pane-title"><span>🔋</span> Reactor Power Balancing</div>
                        <div class="sim-input-row">
                            <div class="sim-input-label">
                                <span>Control Rods (Absorption):</span>
                                <span id="rod-val-display" class="sim-val-badge">${((engine ? engine.controlRodInsertion : 0.35) * 100).toFixed(0)}%</span>
                            </div>
                            <input type="range" class="sim-range-slider" min="0" max="100" value="${((engine ? engine.controlRodInsertion : 0.35) * 100).toFixed(0)}" oninput="document.getElementById('rod-val-display').textContent=this.value+'%'; window.chainReactionEngine.setControlRods(this.value/100);">
                            <div class="slider-hint-row">
                                <span>⚡ Withdraw (More MW)</span>
                                <span>⬇️ Insert (Cool Core)</span>
                            </div>
                        </div>
                        <div class="sim-input-row">
                            <label class="sim-input-label"><span>Moderator Medium:</span></label>
                            <select class="sim-speed-select large-sim-select" onchange="window.chainReactionEngine.setModerator(this.value)">
                                <option value="light_water" ${engine && engine.moderatorType === 'light_water' ? 'selected' : ''}>Light Water H₂O (Thermalizes)</option>
                                <option value="heavy_water" ${engine && engine.moderatorType === 'heavy_water' ? 'selected' : ''}>Heavy Water D₂O (Low Loss)</option>
                                <option value="graphite" ${engine && engine.moderatorType === 'graphite' ? 'selected' : ''}>Nuclear Graphite (Solid)</option>
                                <option value="vacuum" ${engine && engine.moderatorType === 'vacuum' ? 'selected' : ''}>Vacuum (Fast Core)</option>
                            </select>
                        </div>
                    </div>
                `}
            `;
        } else if (tabName === 'decay') {
            const engine = window.nuclearDecayEngine;
            const bField = (engine && typeof engine.magneticFieldTesla === 'number') ? engine.magneticFieldTesla : (engine && typeof engine.bFieldTesla === 'number' ? engine.bFieldTesla : 1.0);
            const bVal = (bField * 10).toFixed(0);

            pane.innerHTML = `
                <div class="sim-drawer-header">
                    <div class="sim-drawer-title">
                        <span>☢️</span>
                        <span>Particle Decay Chamber</span>
                    </div>
                    <button class="sim-drawer-close-btn" onclick="toggleSimDrawer(false)" title="Close controls">✕</button>
                </div>

                <div class="sim-arcade-actions-block" style="margin-bottom: 8px;">
                    <button class="sim-action-btn primary large-arcade-btn" onclick="window.nuclearDecayEngine.triggerDecay()">
                        <span>⚡</span> EMIT RADIATION PULSE
                    </button>
                    <button class="sim-action-btn" style="background:rgba(255,255,255,0.08); color:#cbd5e1; border:1px solid rgba(255,255,255,0.18);" onclick="window.nuclearDecayEngine.droplets=[]; window.nuclearDecayEngine.particles=[];">
                        <span>🔄</span> CLEAR VAPOR TRACKS
                    </button>
                </div>

                <div class="sim-pane-section">
                    <div class="sim-pane-title"><span>☢️</span> Radioactive Source</div>
                    <div class="sim-input-row">
                        <label class="sim-input-label"><span>Radioactive Isotope:</span></label>
                        <select class="sim-speed-select large-sim-select" onchange="window.nuclearDecayEngine.setPreset(this.value)">
                            ${(window.DECAY_PRESETS || []).map(d => `<option value="${d.id}" ${engine && engine.currentPresetId === d.id ? 'selected' : ''}>${d.name} (${d.particle})</option>`).join('')}
                        </select>
                    </div>
                    <div class="sim-input-row">
                        <div class="sim-input-label">
                            <span>Magnetic Field B:</span>
                            <span id="b-field-display" class="sim-val-badge">${bField.toFixed(1)} T</span>
                        </div>
                        <input type="range" class="sim-range-slider" min="-30" max="30" value="${bVal}" oninput="document.getElementById('b-field-display').textContent=(this.value/10).toFixed(1)+' T'; window.nuclearDecayEngine.setMagneticField(this.value/10);">
                        <div class="slider-hint-row">
                            <span>-3.0 T (Left Curve)</span>
                            <span>+3.0 T (Right Curve)</span>
                        </div>
                    </div>
                </div>
            `;
        } else if (tabName === 'molecule') {
            const engine = window.molecularDynamicsEngine;
            const temp = (engine && typeof engine.temperatureK === 'number') ? engine.temperatureK : 298;

            pane.innerHTML = `
                <div class="sim-drawer-header">
                    <div class="sim-drawer-title">
                        <span>🧬</span>
                        <span>Molecule Dynamics</span>
                    </div>
                    <button class="sim-drawer-close-btn" onclick="toggleSimDrawer(false)" title="Close controls">✕</button>
                </div>

                <div class="sim-arcade-actions-block" style="margin-bottom: 8px;">
                    <button class="sim-action-btn primary large-arcade-btn" onclick="window.molecularDynamicsEngine.loadPreset(window.molecularDynamicsEngine.currentKey)">
                        <span>🔄</span> RESET REST GEOMETRY
                    </button>
                    <button class="sim-action-btn" style="background:rgba(239,68,68,0.2); color:#fca5a5; border:1px solid rgba(239,68,68,0.4);" onclick="window.molecularDynamicsEngine.applyImpulse(0, 0, -320)">
                        <span>💥</span> THERMAL IMPULSE
                    </button>
                </div>

                <div class="sim-pane-section">
                    <div class="sim-pane-title"><span>🧬</span> Molecular Geometry</div>
                    <div class="sim-input-row">
                        <label class="sim-input-label"><span>Molecule Species:</span></label>
                        <select class="sim-speed-select large-sim-select" onchange="window.molecularDynamicsEngine.loadPreset(this.value)">
                            <option value="H2O" ${engine && engine.currentKey === 'H2O' ? 'selected' : ''}>Water H₂O (Bent 104.5°)</option>
                            <option value="CO2" ${engine && engine.currentKey === 'CO2' ? 'selected' : ''}>Carbon Dioxide CO₂ (Linear)</option>
                            <option value="CH4" ${engine && engine.currentKey === 'CH4' ? 'selected' : ''}>Methane CH₄ (Tetrahedral)</option>
                            <option value="C6H6" ${engine && engine.currentKey === 'C6H6' ? 'selected' : ''}>Benzene C₆H₆ (Aromatic Ring)</option>
                        </select>
                    </div>
                    <div class="sim-input-row">
                        <div class="sim-input-label">
                            <span>Thermal Temperature:</span>
                            <span id="mol-temp-display" class="sim-val-badge">${temp.toFixed(0)} K</span>
                        </div>
                        <input type="range" class="sim-range-slider" min="10" max="1200" value="${temp}" oninput="document.getElementById('mol-temp-display').textContent=this.value+' K'; window.molecularDynamicsEngine.setTemperature(this.value);">
                    </div>
                </div>
            `;
        } else if (tabName === 'environment') {
            const engine = window.envSimulationEngine;
            const allElements = (typeof elementsData !== 'undefined' ? elementsData : (window.elementsData || []));
            const elData = allElements.find(e => e.atomicNumber === (engine ? engine.activeElementId : 6)) || { name: 'Carbon' };
            const phase = engine ? engine.calculatePhase(elData) : { badge: '🧊 SOLID', color: '#00d4ff', details: 'Rigid crystalline lattice.' };

            pane.innerHTML = `
                <div class="sim-drawer-header">
                    <div class="sim-drawer-title">
                        <span>🌍</span>
                        <span>Extreme Thermodynamics</span>
                    </div>
                    <button class="sim-drawer-close-btn" onclick="toggleSimDrawer(false)" title="Close controls">✕</button>
                </div>

                <!-- Quick Phase Jump Thumb Buttons -->
                <div class="sim-arcade-actions-block" style="margin-bottom: 8px;">
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px;">
                        <button class="sim-action-btn" style="padding:7px 5px; font-size:0.75rem; background:rgba(0,212,255,0.18); border:1px solid rgba(0,212,255,0.4); color:#00d4ff;" onclick="window.envSimulationEngine.quickJumpPhase('solid'); renderTuningPanel('environment');">
                            🧊 Solid (Freeze)
                        </button>
                        <button class="sim-action-btn" style="padding:7px 5px; font-size:0.75rem; background:rgba(16,185,129,0.18); border:1px solid rgba(16,185,129,0.4); color:#4ade80;" onclick="window.envSimulationEngine.quickJumpPhase('liquid'); renderTuningPanel('environment');">
                            💧 Liquid (Melt)
                        </button>
                        <button class="sim-action-btn" style="padding:7px 5px; font-size:0.75rem; background:rgba(249,115,22,0.18); border:1px solid rgba(249,115,22,0.4); color:#fb923c;" onclick="window.envSimulationEngine.quickJumpPhase('gas'); renderTuningPanel('environment');">
                            💨 Gas (Boil)
                        </button>
                        <button class="sim-action-btn" style="padding:7px 5px; font-size:0.75rem; background:rgba(244,63,94,0.18); border:1px solid rgba(244,63,94,0.4); color:#fda4af;" onclick="window.envSimulationEngine.quickJumpPhase('plasma'); renderTuningPanel('environment');">
                            ⚡ Plasma (Ionize)
                        </button>
                    </div>
                </div>

                <div class="sim-pane-section">
                    <div class="sim-pane-title"><span>🌍</span> P-T Thermodynamics</div>
                    <div class="sim-input-row">
                        <label class="sim-input-label"><span>Cosmic / Planetary Preset:</span></label>
                        <select class="sim-speed-select large-sim-select" onchange="window.envSimulationEngine.setPreset(this.value); renderTuningPanel('environment');">
                            ${window.ENVIRONMENT_PRESETS ? window.ENVIRONMENT_PRESETS.map(p => `<option value="${p.id}" ${engine && engine.currentPresetId === p.id ? 'selected' : ''}>${p.icon} ${p.name}</option>`).join('') : ''}
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
                            <span>Pressure (Hydraulic Piston):</span>
                            <span id="env-press-display" class="sim-val-badge">${engine ? (engine.pressureAtm < 0.01 ? engine.pressureAtm.toExponential(2) : (engine.pressureAtm > 1e4 ? engine.pressureAtm.toExponential(2) : engine.pressureAtm.toFixed(2))) : '1.0'} atm</span>
                        </div>
                        <input type="range" class="sim-range-slider" min="-12" max="9" step="0.2" value="${engine ? Math.log10(Math.max(1e-12, engine.pressureAtm)) : 0}" oninput="const p=Math.pow(10, parseFloat(this.value)); window.envSimulationEngine.setPressure(p); renderTuningPanel('environment');">
                    </div>
                </div>

                <div class="sim-pane-section">
                    <div class="sim-pane-title"><span>📊</span> Phase State</div>
                    <div style="display:inline-block; padding:5px 10px; border-radius:7px; font-weight:800; font-family:var(--font-mono); font-size:0.90rem; background:rgba(0,0,0,0.4); border:1px solid ${phase.color || '#00d4ff'}; color:${phase.color || '#00d4ff'}; margin-bottom:6px;">
                        ${phase.badge || '🧊 SOLID'}
                    </div>
                    <p style="font-size:0.77rem; color:#cbd5e1; line-height:1.4; margin:0;">
                        ${phase.details || 'Rigid crystalline lattice.'}
                    </p>
                </div>
            `;
        }
    }

    /**
     * Setup Interactive Pointer/Touch Listeners on Canvases (CSS Pixel Space)
     */
    function setupCanvasInteractions() {
        // Tap stage/canvas outside drawer on mobile automatically closes drawer
        const stage = document.querySelector('.sim-viewport-stage');
        if (stage) {
            stage.addEventListener('pointerdown', (e) => {
                const pane = document.getElementById('sim-tuning-pane');
                if (pane && !pane.classList.contains('sim-drawer-collapsed') && window.innerWidth <= 1024) {
                    if (e.target.closest('#sim-drawer-toggle')) return;
                    toggleSimDrawer(false);
                }
            });
        }

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

        // 2. Environment Phase Chamber Canvas
        const envCanvas = document.getElementById('env-phase-canvas');
        if (envCanvas) {
            envCanvas.addEventListener('pointerdown', (e) => {
                const rect = envCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Check view mode HUD switcher pills
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

        // 3. Decay Chamber Click/Tap
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
