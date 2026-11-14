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
    function openAndroidAppModal(featureKey) {
        const modal = document.getElementById('android-app-modal');
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
        const banner = document.getElementById('android-app-persistent-banner');
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
