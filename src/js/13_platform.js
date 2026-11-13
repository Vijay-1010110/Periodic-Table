/**
 * PlatformManager - Detects the runtime environment for PeriodicaX
 * Used for feature flags and platform-specific behaviors (Web vs Native App)
 */

window.Platform = (function() {
    // Check if Capacitor is available and running natively
    const isCapacitorNative = typeof window.Capacitor !== 'undefined' && window.Capacitor.isNativePlatform();
    
    // Check PWA Standalone Mode
    const isPWA = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;

    // Detect OS
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isAndroid = /android/i.test(userAgent);

    const platform = {
        isNative: isCapacitorNative,
        isWeb: !isCapacitorNative,
        isPWA: isPWA,
        isIOS: isIOS,
        isAndroid: isAndroid,
        os: isIOS ? 'ios' : (isAndroid ? 'android' : 'web'),

        init: function() {
            // Apply CSS classes to the body for purely CSS-driven feature toggles
            const body = document.body;
            if (!body) return;

            if (this.isNative) {
                body.classList.add('is-native');
            } else {
                body.classList.add('is-web');
            }

            if (this.isPWA) {
                body.classList.add('is-pwa');
            }

            if (this.isIOS) body.classList.add('is-ios');
            if (this.isAndroid) body.classList.add('is-android');
        }
    };

    // Run initialization on DOM load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => platform.init());
    } else {
        platform.init();
    }

    return platform;
})();

/**
 * NavigationManager - Universal Hardware/Gesture Back Button Stack for Android & Web
 * Closes modals, drawers, and navigates back through tab history seamlessly.
 */
window.NavigationManager = (function() {
    const viewHistory = ['main'];
    let lastBackPressTime = 0;

    function pushView(viewId) {
        if (viewId === 'properties') viewId = 'main';
        if (viewHistory.length > 0 && viewHistory[viewHistory.length - 1] === viewId) return;
        viewHistory.push(viewId);
    }

    function handleBackButton() {
        // 0. Check App Update Modal (Mandatory updates strictly trap back button)
        const updateModal = document.getElementById('app-update-modal');
        if (updateModal && updateModal.style.display !== 'none' && updateModal.style.display !== '') {
            if (window.isAppUpdateMandatory) {
                showToast("⚠️ Update required to continue using Periodica 3D");
                return true; // Strictly block dismissal on mandatory update
            } else {
                if (typeof window.closeAppUpdateModal === 'function') {
                    window.closeAppUpdateModal();
                } else {
                    updateModal.style.display = 'none';
                }
                return true;
            }
        }

        // 1. Check and close open modals
        // 1-env. Environmental Pressure Modal
        const envModal = document.getElementById('env-pressure-modal');
        if (envModal && envModal.style.display !== 'none' && envModal.style.display !== '') {
            if (typeof window.closeEnvPressureModal === 'function') {
                window.closeEnvPressureModal();
            } else {
                envModal.style.display = 'none';
            }
            if (typeof window.syncNativeSliderVisibility === 'function') window.syncNativeSliderVisibility();
            return true;
        }

        // 1-rate. Rate Us Modal
        const rateModal = document.getElementById('rate-us-modal');
        if (rateModal && rateModal.style.display !== 'none' && rateModal.style.display !== '') {
            if (typeof window.closeRateUsModal === 'function') {
                window.closeRateUsModal();
            } else {
                rateModal.style.display = 'none';
            }
            if (typeof window.syncNativeSliderVisibility === 'function') window.syncNativeSliderVisibility();
            return true;
        }

        // 1-card. Card Anatomy Modal
        const anatomyModal = document.getElementById('card-anatomy-modal');
        if (anatomyModal && anatomyModal.style.display !== 'none' && anatomyModal.style.display !== '') {
            if (typeof window.closeCardAnatomyModal === 'function') {
                window.closeCardAnatomyModal();
            } else {
                anatomyModal.style.display = 'none';
            }
            if (typeof window.syncNativeSliderVisibility === 'function') window.syncNativeSliderVisibility();
            return true;
        }

        // 1-temp. Temp Converter Modal
        const tempConvModal = document.getElementById('temp-converter-modal');
        if (tempConvModal && tempConvModal.style.display !== 'none' && tempConvModal.style.display !== '') {
            if (typeof window.closeTempConverterModal === 'function') {
                window.closeTempConverterModal();
            } else {
                tempConvModal.style.display = 'none';
            }
            if (typeof window.syncNativeSliderVisibility === 'function') window.syncNativeSliderVisibility();
            return true;
        }

        // 1-pro. Pro Paywall Modal
        const proModal = document.getElementById('pro-paywall-modal');
        if (proModal && proModal.style.display !== 'none' && proModal.style.display !== '') {
            // Guard against edge-swipe accidental back gestures immediately upon opening
            if (Date.now() - (window._lastPaywallOpenTime || 0) < 800) {
                console.log('[Paywall] Ignored back gesture within 800ms dwell window');
                return true;
            }
            if (typeof window.closeProPaywallModal === 'function') {
                window.closeProPaywallModal(true);
            } else {
                proModal.style.display = 'none';
            }
            if (typeof window.syncNativeSliderVisibility === 'function') window.syncNativeSliderVisibility();
            return true;
        }

        // 1-table. Table Type Modal
        const tableTypeModal = document.getElementById('table-type-modal');
        if (tableTypeModal && tableTypeModal.style.display !== 'none' && tableTypeModal.style.display !== '') {
            if (typeof window.closeTableTypeModal === 'function') {
                window.closeTableTypeModal();
            } else {
                tableTypeModal.style.display = 'none';
            }
            if (typeof window.syncNativeSliderVisibility === 'function') window.syncNativeSliderVisibility();
            return true;
        }

        // 1-legend. Legend Concept Inspector Modal
        const legendModal = document.getElementById('legend-concept-modal');
        if (legendModal && legendModal.style.display !== 'none' && legendModal.style.display !== '') {
            if (typeof window.closeLegendConceptModal === 'function') {
                window.closeLegendConceptModal();
            } else {
                legendModal.style.display = 'none';
            }
            if (typeof window.syncNativeSliderVisibility === 'function') window.syncNativeSliderVisibility();
            return true;
        }

        // 1a. Settings Modal
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal && settingsModal.style.display !== 'none' && settingsModal.style.display !== '') {
            settingsModal.style.display = 'none';
            if (typeof window.syncNativeSliderVisibility === 'function') window.syncNativeSliderVisibility();
            return true;
        }

        // 1b. Legal Doc Modal
        const legalModal = document.getElementById('legal-doc-modal');
        if (legalModal && legalModal.style.display !== 'none' && legalModal.style.display !== '') {
            legalModal.style.display = 'none';
            if (typeof window.syncNativeSliderVisibility === 'function') window.syncNativeSliderVisibility();
            return true;
        }

        // 1c. Wiki Modal
        const wikiModal = document.getElementById('wiki-modal');
        if (wikiModal && wikiModal.style.display !== 'none' && wikiModal.style.display !== '') {
            wikiModal.style.display = 'none';
            if (typeof window.syncNativeSliderVisibility === 'function') window.syncNativeSliderVisibility();
            return true;
        }

        // 1d. Isotope Modal
        const isoOverlay = document.getElementById('isotope-modal-overlay');
        if (isoOverlay && !isoOverlay.classList.contains('hidden') && isoOverlay.style.display !== 'none') {
            if (typeof window.closeIsotopeModal === 'function') {
                window.closeIsotopeModal();
            } else {
                isoOverlay.classList.add('hidden');
                isoOverlay.style.display = 'none';
            }
            if (typeof window.syncNativeSliderVisibility === 'function') window.syncNativeSliderVisibility();
            return true;
        }

        // 2. Check and dismiss active mobile sidebar
        const activeSidebar = document.querySelector('.view-mode.active .view-right.mobile-active, .view-mode.active .view-right.open');
        if (activeSidebar) {
            if (typeof window.closeMobileSidebar === 'function') {
                window.closeMobileSidebar();
            } else {
                activeSidebar.classList.remove('mobile-active', 'open');
            }
            return true;
        }

        // 3. View History Navigation (Previous Tab)
        if (viewHistory.length > 1) {
            viewHistory.pop(); // Pop current view
            const prevView = viewHistory[viewHistory.length - 1] || 'main';
            if (typeof window.switchView === 'function') {
                window.switchView(prevView, true, false); // false for pushHistory
            }
            return true;
        }

        // 4. On root view ('main'): Prompt to exit or exit
        const now = Date.now();
        if (now - lastBackPressTime < 2000) {
            if (window.Capacitor?.Plugins?.App) {
                window.Capacitor.Plugins.App.exitApp();
            }
            return false;
        }
        lastBackPressTime = now;
        showToast("Press back again to exit");
        return true;
    }

    function showToast(msg) {
        let toast = document.getElementById('nav-back-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'nav-back-toast';
            toast.style.cssText = 'position:fixed; bottom:25px; left:50%; transform:translateX(-50%); background:rgba(15,23,42,0.95); border:1px solid rgba(0,212,255,0.4); color:#e2e8f0; font-family:var(--font-ui); font-size:0.85rem; padding:8px 18px; border-radius:20px; z-index:999999; box-shadow:0 4px 20px rgba(0,0,0,0.8); pointer-events:none; transition:opacity 0.3s; opacity:0;';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.opacity = '1';
        setTimeout(() => { if (toast) toast.style.opacity = '0'; }, 1800);
    }

    function init() {
        if (window.Capacitor?.Plugins?.App) {
            window.Capacitor.Plugins.App.addListener('backButton', () => {
                handleBackButton();
            });
        }
        window.addEventListener('popstate', () => {
            handleBackButton();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        pushView: pushView,
        handleBackButton: handleBackButton
    };
})();
