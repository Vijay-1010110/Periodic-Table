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
