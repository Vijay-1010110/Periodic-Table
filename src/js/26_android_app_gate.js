/**
 * Periodica 3D - Android Web App Gate & Play Store Conversion Engine
 *
 * Core Objectives:
 * 1. Restrict Android mobile web visitors strictly to the Property Interface ('main' / 'properties').
 * 2. Continuously display a persistent, non-intrusive Google Play installation banner at the top of the screen.
 * 3. Intercept all navigation attempts to other tabs (Orbitals, Isotopes, Compounds, Reactions,
 *    Crystals, Compare, Quiz, Sim Lab) and prompt the user with a targeted Android App Unlock Modal
 *    directly linking to: https://play.google.com/store/apps/details?id=com.periodica.app&hl=en_IN
 */

(function () {
    'use strict';

    const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.periodica.app&hl=en_IN';

    // Tailored messaging for each module
    const ANDROID_FEATURE_MAP = {
        'electrons': {
            title: '3D Quantum Orbitals & Wavefunctions',
            subtitle: 'Exclusive to Periodica 3D Android App',
            icon: '🌌',
            badge: 'QUANTUM PHYSICS',
            desc: 'Explore interactive 3D atomic wavefunctions, electron probability clouds, subshells (s, p, d, f blocks), nodal probability slicing, and real-time Aufbau diagrams on your Android phone.'
        },
        'isotopes': {
            title: '3,000+ Nuclear Isotopes & Decay',
            subtitle: 'Exclusive to Periodica 3D Android App',
            icon: '☢️',
            badge: 'NUCLEAR PHYSICS',
            desc: 'Simulate Alpha, Beta, and Positron decay with 3,000+ nuclides, live half-life particle chamber, decay energy spectrums, and nuclear stability charts in the Android app.'
        },
        'simulations': {
            title: '3D Simulation Lab (Sim Lab)',
            subtitle: 'Exclusive to Periodica 3D Android App',
            icon: '🪐',
            badge: 'STEM SIMULATIONS',
            desc: 'Experience hands-on Bohr-Wheeler nuclear fission, multi-atom supercritical cascades, live atom P-T phase chamber, and cloud chamber deflection physics.'
        },
        'compounds': {
            title: '3D Molecular Compounds',
            subtitle: 'Exclusive to Periodica 3D Android App',
            icon: '🧬',
            badge: 'MOLECULAR LAB',
            desc: 'Rotate, zoom, and inspect photorealistic 3D molecules, CPK element colors, dynamic spring-damping bonds, and stoichiometric mass percentages.'
        },
        'reactions': {
            title: 'Chemical Reactions & Stoichiometry',
            subtitle: 'Exclusive to Periodica 3D Android App',
            icon: '💥',
            badge: 'EQUATION BALANCER',
            desc: 'Balance chemical equations with Gaussian elimination, compute reaction enthalpy (ΔH), and inspect exothermic / endothermic thermodynamics.'
        },
        'crystals': {
            title: '3D Crystal Lattices & Unit Cells',
            subtitle: 'Exclusive to Periodica 3D Android App',
            icon: '🧊',
            badge: 'CRYSTALLOGRAPHY',
            desc: 'Inspect 3D Bravais unit cells (FCC, BCC, HCP, Diamond cubic), atomic packing factors, and Miller index crystal planes in full 3D.'
        },
        'compare': {
            title: 'Dual Element Comparator',
            subtitle: 'Exclusive to Periodica 3D Android App',
            icon: '⚖️',
            badge: 'COMPARATOR',
            desc: 'Compare any two elements side-by-side with atomic radii, electronegativity differential, ionization energies, and interactive phase diagrams.'
        },
        'quiz': {
            title: 'Periodic Table Mastery Quiz',
            subtitle: 'Exclusive to Periodica 3D Android App',
            icon: '🏆',
            badge: 'CHALLENGES',
            desc: 'Test your chemistry knowledge with adaptive question banks, timed challenges, high scores, and mastery badges.'
        },
        'general': {
            title: 'Download Periodica 3D for Android',
            subtitle: 'The Complete 3D Chemistry & Physics Suite',
            icon: '⚛️',
            badge: 'FULL SCIENCE SUITE',
            desc: 'Get the full offline experience with 3D Orbitals, Nuclear Sim Lab, 3D Molecules, Reactions Balancer, and all 118 elements on Google Play.'
        }
    };

    // Open Play Store directly
    function openPlayStore(source = 'general') {
        if (typeof window.trackEvent === 'function') {
            window.trackEvent('play_store_click', { source: source });
        }
        try {
            window.open(PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
        } catch (e) {
            window.location.href = PLAY_STORE_URL;
        }
    }
    window.openPlayStore = openPlayStore;

    window.trackAndroidAppInstallClick = function (source) {
        if (typeof window.trackEvent === 'function') {
            window.trackEvent('play_store_click', { source: source });
        }
    };

    // Open the targeted Android App Unlock Modal
    
    function injectStylesIfMissing() {
        if (document.getElementById('android-gate-styles')) return;
        const style = document.createElement('style');
        style.id = 'android-gate-styles';
        style.textContent = `
            .android-app-persistent-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 38px;
                background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%);
                border-bottom: 1.5px solid #00d4ff;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 12px;
                z-index: 99999;
                box-shadow: 0 2px 12px rgba(0,0,0,0.8);
                font-family: var(--font-ui, sans-serif);
            }
            .android-app-persistent-banner .banner-content {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #f1f5f9;
                font-size: 0.75rem;
                font-weight: 600;
            }
            .android-app-persistent-banner .banner-btn {
                background: linear-gradient(135deg, #00d4ff, #0284c7);
                color: #040914;
                font-weight: 800;
                font-size: 0.70rem;
                padding: 4px 10px;
                border-radius: 14px;
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            .android-app-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(4, 9, 20, 0.88);
                backdrop-filter: blur(6px);
                z-index: 100000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                box-sizing: border-box;
            }
            .android-app-modal-card {
                background: radial-gradient(circle at 50% 0%, #172554 0%, #090e1a 100%);
                border: 1.5px solid #00d4ff;
                border-radius: 18px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.95), 0 0 30px rgba(0,212,255,0.3);
                width: min(440px, 94vw);
                padding: 24px 20px 20px 20px;
                text-align: center;
                position: relative;
                box-sizing: border-box;
                font-family: var(--font-ui, sans-serif);
            }
            .android-modal-close-btn {
                position: absolute;
                top: 12px;
                right: 12px;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: rgba(255,255,255,0.08);
                border: 1px solid rgba(255,255,255,0.15);
                color: #94a3b8;
                font-size: 1rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .android-modal-icon-badge {
                font-size: 2.2rem;
                margin-bottom: 8px;
            }
            .android-modal-pill {
                display: inline-block;
                padding: 3px 10px;
                background: rgba(0, 212, 255, 0.15);
                border: 1px solid rgba(0, 212, 255, 0.4);
                color: #38bdf8;
                border-radius: 12px;
                font-size: 0.65rem;
                font-weight: 800;
                letter-spacing: 0.5px;
                margin-bottom: 10px;
            }
            .android-modal-title {
                color: #ffffff;
                font-size: 1.25rem;
                font-weight: 800;
                margin: 0 0 8px 0;
            }
            .android-modal-desc {
                color: #94a3b8;
                font-size: 0.82rem;
                line-height: 1.45;
                margin: 0 0 16px 0;
            }
            .android-modal-features-list {
                text-align: left;
                background: rgba(0,0,0,0.35);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 10px;
                padding: 10px 14px;
                margin-bottom: 18px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                font-size: 0.78rem;
                color: #cbd5e1;
            }
            .android-modal-feat-item {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .android-modal-actions {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .android-modal-install-btn {
                background: linear-gradient(135deg, #00d4ff, #0284c7);
                color: #040914;
                font-weight: 800;
                font-size: 0.92rem;
                padding: 12px 20px;
                border-radius: 12px;
                text-decoration: none;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                box-shadow: 0 4px 18px rgba(0, 212, 255, 0.4);
            }
            .android-modal-dismiss-btn {
                background: transparent;
                border: none;
                color: #64748b;
                font-size: 0.78rem;
                cursor: pointer;
                padding: 6px;
            }
        `;
        document.head.appendChild(style);
    }

    function ensureAndroidModal() {
        injectStylesIfMissing();
        let modal = document.getElementById('android-app-modal');
        if (modal) return modal;

        modal = document.createElement('div');
        modal.id = 'android-app-modal';
        modal.className = 'android-app-modal-overlay';
        modal.style.display = 'none';
        modal.onclick = (e) => {
            if (e.target === modal) closeAndroidAppModal();
        };

        modal.innerHTML = `
            <div class="android-app-modal-card">
                <button class="android-modal-close-btn" onclick="closeAndroidAppModal()">✕</button>
                <div class="android-modal-icon-badge" id="android-modal-feature-icon">⚛️</div>
                <div class="android-modal-pill" id="android-modal-feature-badge">EXCLUSIVELY IN ANDROID APP</div>
                <h2 id="android-modal-feature-title" class="android-modal-title">Download Periodica 3D</h2>
                <p id="android-modal-feature-desc" class="android-modal-desc">
                    This advanced module is available in the official Periodica 3D Android app on Google Play.
                </p>
                <div class="android-modal-features-list">
                    <div class="android-modal-feat-item">
                        <span>⚡</span> <span>Full offline access to all 118 elements & isotopes</span>
                    </div>
                    <div class="android-modal-feat-item">
                        <span>🌌</span> <span>Hardware-accelerated 3D Quantum Orbitals</span>
                    </div>
                    <div class="android-modal-feat-item">
                        <span>⚛️</span> <span>Bohr-Wheeler Nuclear Fission & Decay Simulator</span>
                    </div>
                </div>
                <div class="android-modal-actions">
                    <a href="${PLAY_STORE_URL}" target="_blank" rel="noopener noreferrer" class="android-modal-install-btn" onclick="trackAndroidAppInstallClick('modal')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3.609 1.814L13.792 12 3.61 22.186a2.036 2.036 0 0 1-.22-.924V2.738c0-.34.08-.654.22-.924zM15.207 13.414l2.585 2.586-11.8 6.743 9.215-9.329zm0-2.828L5.992 1.257l11.8 6.743-2.585 2.586zm1.414 1.414l3.185-1.82a1.867 1.867 0 0 1 0 3.226l-3.185-1.406z"/>
                        </svg>
                        Get on Google Play
                    </a>
                    <button class="android-modal-dismiss-btn" onclick="closeAndroidAppModal()">
                        Stay on Web (Properties Only)
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    function ensureAndroidBanner() {
        injectStylesIfMissing();
        let banner = document.getElementById('android-app-persistent-banner');
        if (banner) return banner;

        banner = document.createElement('div');
        banner.id = 'android-app-persistent-banner';
        banner.className = 'android-app-persistent-banner';
        banner.innerHTML = `
            <div class="banner-content">
                <span>📱</span>
                <span>Get Periodica 3D App for Android</span>
            </div>
            <a href="${PLAY_STORE_URL}" target="_blank" rel="noopener noreferrer" class="banner-btn" onclick="trackAndroidAppInstallClick('banner')">
                Install Free ➔
            </a>
        `;
        document.body.prepend(banner);
        return banner;
    }

    function openAndroidAppModal(featureKey) {
        const modal = ensureAndroidModal();
        if (!modal) return;

        const feat = ANDROID_FEATURE_MAP[featureKey] || ANDROID_FEATURE_MAP['general'];

        const titleEl = document.getElementById('android-modal-feature-title');
        const iconEl = document.getElementById('android-modal-feature-icon');
        const nameEl = document.getElementById('android-modal-feature-name');
        const descEl = document.getElementById('android-modal-feature-desc');
        const badgeEl = document.getElementById('android-modal-feature-badge');

        if (titleEl) titleEl.textContent = feat.title;
        if (iconEl) iconEl.textContent = feat.icon;
        if (nameEl) nameEl.textContent = feat.title;
        if (descEl) descEl.textContent = feat.desc;
        if (badgeEl) badgeEl.textContent = feat.badge;

        modal.style.display = 'flex';
        modal.classList.add('active');

        // Trigger native haptics if on supported touch device
        if (window.NativeServices?.Haptics?.selection) {
            window.NativeServices.Haptics.selection();
        }

        if (typeof window.syncNativeSliderVisibility === 'function') {
            window.syncNativeSliderVisibility();
        }
    }
    window.openAndroidAppModal = openAndroidAppModal;

    // Close the Android App Modal
    function closeAndroidAppModal() {
        const modal = document.getElementById('android-app-modal');
        if (!modal) return;

        modal.style.display = 'none';
        modal.classList.remove('active');

        if (typeof window.syncNativeSliderVisibility === 'function') {
            window.syncNativeSliderVisibility();
        }
    }
    window.closeAndroidAppModal = closeAndroidAppModal;
    window.AndroidAppGate = {
        openAppModal: openAndroidAppModal,
        closeAppModal: closeAndroidAppModal
    };

    // Subtle reminder toast that gently surfaces periodically without obstructing the table
    let lastToastTime = 0;
    function showAndroidReminderToast(text, ctaText = 'INSTALL') {
        const now = Date.now();
        if (now - lastToastTime < 50000) return; // At most once every 50 seconds
        lastToastTime = now;

        let toast = document.getElementById('android-nudge-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'android-nudge-toast';
            toast.className = 'android-nudge-toast';
            toast.onclick = () => openPlayStore('reminder_toast');
            document.body.appendChild(toast);
        }

        toast.innerHTML = `
            <div class="nudge-logo-wrap">
                <img src="icon-192.png" width="22" height="22" alt="App" onerror="this.src='favicon.svg'">
            </div>
            <div class="nudge-text">${text}</div>
            <div class="nudge-cta">${ctaText} ➔</div>
        `;
        toast.classList.add('visible');
        setTimeout(() => {
            if (toast) toast.classList.remove('visible');
        }, 5500);
    }

    // Initialize the Android Web Gate
    function initAndroidWebGate() {
        if (!window.isAndroidWeb) return;

        document.body.classList.add('is-android-web');

        // 1. Show Persistent Top Notification Banner
        const banner = ensureAndroidBanner();
        if (banner) {
            banner.style.display = 'flex';
        }

        // 2. Lock and badge all non-property tabs in the UI
        const lockTabs = ['electrons', 'isotopes', 'compounds', 'reactions', 'crystals', 'compare', 'quiz', 'simulations'];

        lockTabs.forEach(viewId => {
            // Update mobile left nav items
            document.querySelectorAll(`.mobile-nav-item[data-view="${viewId}"]`).forEach(btn => {
                btn.classList.add('android-locked-tab');
                const pill = btn.querySelector('.nav-pro-pill');
                if (pill) {
                    pill.textContent = '🔒 APP';
                    pill.title = 'Available in Periodica 3D Android App';
                }
            });

            // Update top nav buttons (if visible)
            document.querySelectorAll(`.nav-btn[data-view="${viewId}"]`).forEach(btn => {
                btn.classList.add('android-locked-tab');
                const pill = btn.querySelector('.nav-pro-pill');
                if (pill) {
                    pill.textContent = '🔒 APP';
                    pill.title = 'Available in Periodica 3D Android App';
                }
            });
        });

        // 3. Ensure we start strictly on 'main' (Property Interface)
        if (typeof window.switchView === 'function') {
            const currentV = window.currentView || 'main';
            if (currentV !== 'main' && currentV !== 'properties') {
                window.switchView('main', false, false);
            }
        }

        // 4. Subtle periodic reminder nudge
        setTimeout(() => {
            showAndroidReminderToast('⚡ Unlock 3D Quantum Orbitals & Sim Lab!', 'GET APP');
        }, 9000);

        setInterval(() => {
            showAndroidReminderToast('🪐 Discover Bohr Fission & 3D Molecules in Android App', 'INSTALL');
        }, 65000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAndroidWebGate);
    } else {
        initAndroidWebGate();
    }

})();
