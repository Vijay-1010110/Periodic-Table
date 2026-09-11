/**
 * PlatformManager - Detects the runtime environment for PeriodicaX Web
 * Standalone Web Version (with optional PWA standalone detection)
 */

window.Platform = (function() {
    // Check PWA Standalone Mode
    const isPWA = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;

    // Detect OS
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isAndroid = /android/i.test(userAgent);

    const platform = {
        isNative: false,
        isWeb: true,
        isPWA: isPWA,
        isIOS: isIOS,
        isAndroid: isAndroid,
        os: isIOS ? 'ios' : (isAndroid ? 'android' : 'web'),

        init: function() {
            const body = document.body;
            if (!body) return;

            body.classList.add('is-web');

            if (this.isPWA) {
                body.classList.add('is-pwa');
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => platform.init());
    } else {
        platform.init();
    }

    return platform;
})();
