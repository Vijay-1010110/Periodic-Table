/**
 * Periodica Mobile Configuration (00_config.js)
 * Centralized settings for Native Mobile Features (Android & iOS)
 * 
 * NOTE: Default IDs below are official Google AdMob Test IDs.
 * Replace with clean production IDs when publishing.
 */

window.hexToRgba = function(color, alpha) {
    if (!color) return `rgba(100,116,139,${alpha})`;
    if (typeof color === 'string' && color.startsWith('rgb(')) {
        const m = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
        if (m) return `rgba(${m[1]},${m[2]},${m[3]},${alpha})`;
    } else if (typeof color === 'string' && color.startsWith('rgba(')) {
        return color.replace(/rgba\((\d+,\s*\d+,\s*\d+,)\s*[^)]+\)/, `rgba($1 ${alpha})`);
    } else if (typeof color === 'string' && color.startsWith('#')) {
        let hex = color.slice(1);
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        if (hex.length === 6) {
            const num = parseInt(hex, 16);
            return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
        }
    }
    return `rgba(100,116,139,${alpha})`;
};

window.escapeHtml = function(str) {
    if (!str || typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

window.AppConfig = {
    app: {
        name: "Periodica 3D",
        playStoreTitle: "Periodica 3D: Periodic Table",
        version: "4.5.2",
        bundleId: "com.periodica.app",
        developerName: "Vijay-1010110",
        contactEmail: "periodicax.support@gmail.com",
        privacyPolicyUrl: "https://periodica-3d.web.app/privacy-policy"
    },

    // Feature Flags (Toggle features on/off instantly)
    features: {
        enableAds: false, // 100% Ad-Free Experience
        enableSubscriptions: false,
        enableLocalNotifications: true,
        enableHaptics: false, // Vibrations completely disabled
        enableShareSheet: true,
        enableSmartOrientation: true, // Locks narrow phones to landscape; unlocks foldables & tablets
        enableAppUpdates: false // In-App & Push update notifications
    },

    // Smart Screen Orientation (Adaptive handling for Phones vs Foldables & Tablets)
    orientation: {
        autoLandscapeForPhones: true,
        minWidthForPortrait: 600, // Devices with shortest screen dimension >= 600px (Tablets, Foldables inner screen) allow all orientations
        lockType: 'landscape' // 'landscape' locks standard phones to either landscape-primary or landscape-secondary
    },

    // Google Mobile Ads (AdMob)
    // Disabled by default for 100% sterile and ad-free experience
    admob: {
        isTesting: true,
        
        android: {
            appId: "",
            bannerId: "",
            interstitialId: "",
            rewardedId: ""
        },

        ios: {
            appId: "",
            bannerId: "",
            interstitialId: "",
            rewardedId: ""
        },

        interstitialIntervalClicks: 12
    },

    // In-App Purchases & Subscriptions
    subscriptions: {
        revenueCat: {
            apiKeyAndroid: "",
            apiKeyIos: "",
            entitlementId: "periodica_pro"
        },
        productIds: {
            proMonthly: "periodica_pro_monthly",
            proAnnual: "periodica_pro_annual",
            proLifetime: "periodica_pro_lifetime",
            removeAds: "periodica_remove_ads"
        }
    },

    // Local Push Notifications (Daily Element & Periodic Reminders)
    notifications: {
        dailyElementHour: 10, // 10:00 AM
        dailyElementMinute: 0,
        channelId: "periodica_daily",
        channelName: "Daily Element & Chemistry Facts"
    },

    // Remote Update Configuration
    updates: {
        checkOnStartup: false,
        startupCheckDelayMs: 2500,
        dismissedCooldownHours: 24,
        remoteVersionUrl: "",
        localFallbackUrl: "version.json",
        notificationChannelId: "periodica_updates",
        notificationChannelName: "Periodica Updates & Announcements"
    }
};
