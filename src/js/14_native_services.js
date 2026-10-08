/**
 * NativeServices Bridge (14_native_services.js)
 * High-performance, fault-tolerant native capabilities for Android & iOS:
 * - Google Mobile Ads (AdMob Banners, Interstitials, Rewarded Ads)
 * - In-App Purchases & Subscriptions (RevenueCat / Play Billing / App Store)
 * - Local Notifications (Daily Element of the Day, Challenge reminders)
 * - Tactile Haptics (Vibrations on cell taps, reactions, quiz results)
 * - Native Share Sheet & Status Bar Theme
 */

window.NativeServices = (function() {
    const config = window.AppConfig || {};
    let isProUser = localStorage.getItem('periodica_is_pro') === 'true';
    let clickCounter = 0;

    /* ==========================================================================
       1. HAPTIC FEEDBACK (Native Vibration)
       ========================================================================== */
    const Haptics = {
        async impact(style = 'LIGHT') {
            if (!config.features?.enableHaptics) return;
            try {
                if (window.Capacitor?.Plugins?.Haptics) {
                    const HapticsPlugin = window.Capacitor.Plugins.Haptics;
                    await HapticsPlugin.impact({ style: style });
                } else if ('vibrate' in navigator) {
                    navigator.vibrate(style === 'HEAVY' ? 35 : (style === 'MEDIUM' ? 20 : 10));
                }
            } catch (e) { /* ignore */ }
        },

        async selection() {
            if (!config.features?.enableHaptics) return;
            try {
                if (window.Capacitor?.Plugins?.Haptics) {
                    await window.Capacitor.Plugins.Haptics.selectionStart();
                } else if ('vibrate' in navigator) {
                    navigator.vibrate(8);
                }
            } catch (e) { /* ignore */ }
        },

        async notification(type = 'SUCCESS') {
            if (!config.features?.enableHaptics) return;
            try {
                if (window.Capacitor?.Plugins?.Haptics) {
                    await window.Capacitor.Plugins.Haptics.notification({ type: type });
                } else if ('vibrate' in navigator) {
                    navigator.vibrate(type === 'ERROR' ? [30, 40, 30] : [15, 30]);
                }
            } catch (e) { /* ignore */ }
        }
    };

    /* ==========================================================================
       2. GOOGLE MOBILE ADS (AdMob)
       ========================================================================== */
    const Ads = {
        isInitialized: false,
        bannerVisible: false,

        async init() {
            if (!config.features?.enableAds || isProUser) return;
            if (!window.Capacitor?.isNativePlatform()) return;

            try {
                const AdMob = window.Capacitor?.Plugins?.AdMob;
                if (!AdMob) return;

                await AdMob.initialize({
                    testingDevices: config.admob?.isTesting ? ['EMULATOR'] : [],
                    initializeForTesting: config.admob?.isTesting || false
                });

                this.isInitialized = true;
                console.log("[NativeAds] AdMob initialized successfully");

                // Auto-prepare interstitial
                await this.prepareInterstitial();
                
                // Show bottom banner
                await this.showBanner();
            } catch (err) {
                console.warn("[NativeAds] Initialization notice:", err);
            }
        },

        getAdUnitIds() {
            const isIOS = window.Capacitor?.getPlatform() === 'ios';
            return isIOS ? config.admob?.ios : config.admob?.android;
        },

        async showBanner() {
            if (isProUser || !config.features?.enableAds) return;
            try {
                const AdMob = window.Capacitor?.Plugins?.AdMob;
                if (!AdMob) return;

                const ids = this.getAdUnitIds();
                await AdMob.showBanner({
                    adId: ids.bannerId,
                    position: 'BOTTOM_CENTER',
                    margin: 0,
                    isTesting: config.admob?.isTesting || false
                });
                this.bannerVisible = true;
            } catch (e) {
                console.warn("[NativeAds] Banner error:", e);
            }
        },

        async hideBanner() {
            try {
                const AdMob = window.Capacitor?.Plugins?.AdMob;
                if (AdMob && this.bannerVisible) {
                    await AdMob.hideBanner();
                    this.bannerVisible = false;
                }
            } catch (e) { /* ignore */ }
        },

        async prepareInterstitial() {
            if (isProUser || !config.features?.enableAds) return;
            try {
                const AdMob = window.Capacitor?.Plugins?.AdMob;
                if (!AdMob) return;

                const ids = this.getAdUnitIds();
                await AdMob.prepareInterstitial({
                    adId: ids.interstitialId,
                    isTesting: config.admob?.isTesting || false
                });
            } catch (e) { /* ignore */ }
        },

        async showInterstitial(force = false) {
            if (isProUser || !config.features?.enableAds) return;
            clickCounter++;

            if (!force && (clickCounter % (config.admob?.interstitialIntervalClicks || 12) !== 0)) {
                return;
            }

            try {
                const AdMob = window.Capacitor?.Plugins?.AdMob;
                if (!AdMob) return;

                await AdMob.showInterstitial();
                // Preload next interstitial
                await this.prepareInterstitial();
            } catch (e) {
                // If not ready, prepare for next time
                await this.prepareInterstitial();
            }
        },

        async showRewarded(onRewardCallback) {
            try {
                const AdMob = window.Capacitor?.Plugins?.AdMob;
                if (!AdMob) {
                    if (typeof onRewardCallback === 'function') onRewardCallback();
                    return;
                }

                const ids = this.getAdUnitIds();
                await AdMob.prepareRewardVideoAd({
                    adId: ids.rewardedId,
                    isTesting: config.admob?.isTesting || false
                });

                const rewardItem = await AdMob.showRewardVideoAd();
                if (rewardItem && typeof onRewardCallback === 'function') {
                    onRewardCallback(rewardItem);
                }
            } catch (e) {
                console.warn("[NativeAds] Rewarded ad notice:", e);
            }
        }
    };

    /* ==========================================================================
       3. IN-APP PURCHASES & SUBSCRIPTIONS (RevenueCat / Play Billing)
       ========================================================================== */
    const Subscriptions = {
        isInitialized: false,

        async init() {
            if (!config.features?.enableSubscriptions) return;
            if (!window.Capacitor?.isNativePlatform()) return;

            try {
                const Purchases = window.Capacitor?.Plugins?.Purchases;
                if (!Purchases) return;

                const isIOS = window.Capacitor?.getPlatform() === 'ios';
                const apiKey = isIOS 
                    ? config.subscriptions?.revenueCat?.apiKeyIos 
                    : config.subscriptions?.revenueCat?.apiKeyAndroid;

                if (!apiKey || apiKey.includes('YOUR_CLEAN')) {
                    console.log("[Subscriptions] RevenueCat API key not configured yet.");
                    return;
                }

                await Purchases.configure({ apiKey: apiKey });
                this.isInitialized = true;
                
                // Check initial entitlement status
                await this.checkStatus();
            } catch (e) {
                console.warn("[Subscriptions] Notice:", e);
            }
        },

        async checkStatus() {
            try {
                const Purchases = window.Capacitor?.Plugins?.Purchases;
                if (!Purchases) return isProUser;

                const customerInfo = await Purchases.getCustomerInfo();
                const entitlement = config.subscriptions?.revenueCat?.entitlementId || 'periodica_pro';
                
                isProUser = !!(customerInfo?.customerInfo?.entitlements?.active[entitlement]);
                localStorage.setItem('periodica_is_pro', isProUser ? 'true' : 'false');
                
                if (isProUser) {
                    Ads.hideBanner();
                    document.body.classList.add('is-pro');
                }
                return isProUser;
            } catch (e) {
                return isProUser;
            }
        },

        async purchase(packageOrProductId) {
            try {
                const Purchases = window.Capacitor?.Plugins?.Purchases;
                if (!Purchases) {
                    alert("Purchases are available inside the native mobile app.");
                    return false;
                }

                const purchaseResult = await Purchases.purchasePackage({ aPackage: packageOrProductId });
                await this.checkStatus();
                return purchaseResult;
            } catch (e) {
                console.error("[Subscriptions] Purchase error:", e);
                return false;
            }
        },

        async restorePurchases() {
            try {
                const Purchases = window.Capacitor?.Plugins?.Purchases;
                if (!Purchases) return false;

                const result = await Purchases.restorePurchases();
                await this.checkStatus();
                return result;
            } catch (e) {
                console.error("[Subscriptions] Restore error:", e);
                return false;
            }
        },

        isPro() {
            return isProUser;
        }
    };

    /* ==========================================================================
       4. LOCAL NOTIFICATIONS (Daily Chemistry & System Update Alerts)
       ========================================================================== */
    const Notifications = {
        async init() {
            if (!config.features?.enableLocalNotifications) return;
            if (!window.Capacitor?.isNativePlatform()) return;

            try {
                const LocalNotifications = window.Capacitor?.Plugins?.LocalNotifications;
                if (!LocalNotifications) return;

                // 1. Channel for Daily Chemistry Facts
                await LocalNotifications.createChannel({
                    id: config.notifications?.channelId || 'periodica_daily',
                    name: config.notifications?.channelName || 'Daily Chemistry Facts',
                    description: 'Daily alerts for featured chemical elements and quantum facts',
                    importance: 4,
                    visibility: 1
                });

                // 2. High-Priority Channel for App Updates (Heads-Up)
                await LocalNotifications.createChannel({
                    id: config.updates?.notificationChannelId || 'periodica_updates',
                    name: config.updates?.notificationChannelName || 'Periodica Updates & Announcements',
                    description: 'Critical and recommended application update notifications',
                    importance: 5, // High / Heads-up
                    visibility: 1
                });

                // Request Permissions
                const status = await LocalNotifications.requestPermissions();
                if (status.display === 'granted') {
                    await this.scheduleDailyElementFact();
                }

                // Handle Notification Tap Event
                LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
                    console.log('[Notifications] Action performed:', action);
                    const extra = action?.notification?.extra;
                    if (extra && extra.action === 'open_update') {
                        if (typeof window.checkAppUpdates === 'function') {
                            window.checkAppUpdates(true);
                        }
                    }
                });
            } catch (e) {
                console.warn("[Notifications] Notice:", e);
            }
        },

        async scheduleDailyElementFact() {
            try {
                const LocalNotifications = window.Capacitor?.Plugins?.LocalNotifications;
                if (!LocalNotifications) return;

                // Cancel existing to prevent duplicates
                await LocalNotifications.cancel({ notifications: [{ id: 101 }] });

                const now = new Date();
                const targetTime = new Date();
                targetTime.setHours(config.notifications?.dailyElementHour || 10);
                targetTime.setMinutes(config.notifications?.dailyElementMinute || 0);
                targetTime.setSeconds(0);

                if (targetTime <= now) {
                    targetTime.setDate(targetTime.getDate() + 1);
                }

                await LocalNotifications.schedule({
                    notifications: [
                        {
                            id: 101,
                            title: '⚛️ Element of the Day',
                            body: 'Explore today\'s featured element, 3D electron orbitals, and nuclear properties on Periodica!',
                            schedule: {
                                at: targetTime,
                                repeats: true,
                                every: 'day'
                            },
                            channelId: config.notifications?.channelId || 'periodica_daily',
                            smallIcon: 'ic_stat_icon',
                            iconColor: '#00d4ff'
                        }
                    ]
                });
                console.log("[Notifications] Daily element reminder scheduled for 10:00 AM.");
            } catch (e) { /* ignore */ }
        },

        async sendUpdateNotification(updateInfo, isMandatory = false) {
            try {
                const title = isMandatory 
                    ? '🚨 Critical Update: Periodica 3D'
                    : `🚀 Update Available: Periodica 3D ${updateInfo.latestVersion || ''}`;
                
                const body = isMandatory
                    ? 'A mandatory update is required to continue using Periodica online services. Tap to install now.'
                    : (updateInfo.changelog?.[0] ? `${updateInfo.changelog[0]}. Tap to update!` : 'Exciting new chemistry features are ready to install.');

                if (window.Capacitor?.isNativePlatform()) {
                    const LocalNotifications = window.Capacitor?.Plugins?.LocalNotifications;
                    if (!LocalNotifications) return;

                    // Ensure permissions
                    let perm = await LocalNotifications.checkPermissions();
                    if (perm.display !== 'granted') {
                        perm = await LocalNotifications.requestPermissions();
                    }
                    if (perm.display !== 'granted') return;

                    // Clear previous update notification
                    await LocalNotifications.cancel({ notifications: [{ id: 202 }] });

                    await LocalNotifications.schedule({
                        notifications: [
                            {
                                id: 202,
                                title: title,
                                body: body,
                                schedule: { at: new Date(Date.now() + 800) },
                                channelId: config.updates?.notificationChannelId || 'periodica_updates',
                                smallIcon: 'ic_stat_icon',
                                iconColor: isMandatory ? '#ef4444' : '#00d4ff',
                                extra: {
                                    action: 'open_update',
                                    isMandatory: isMandatory,
                                    latestVersion: updateInfo.latestVersion
                                }
                            }
                        ]
                    });
                    console.log(`[Notifications] Sent ${isMandatory ? 'Mandatory' : 'Optional'} update notification.`);
                } else if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(title, {
                        body: body,
                        icon: 'icon-192.png'
                    });
                }
            } catch (err) {
                console.warn('[Notifications] sendUpdateNotification error:', err);
            }
        }
    };

    /* ==========================================================================
       5. NATIVE SHARING & UI
       ========================================================================== */
    const Share = {
        async shareElement(element) {
            if (!element) return;
            const text = `Explore ${element.name} (${element.symbol}, Atomic #${element.atomicNumber}) with interactive 3D electron orbitals on Periodica!`;
            
            try {
                if (window.Capacitor?.Plugins?.Share) {
                    await window.Capacitor.Plugins.Share.share({
                        title: `${element.name} - Periodica 3D`,
                        text: text,
                        dialogTitle: `Share ${element.name}`
                    });
                } else if (navigator.share) {
                    await navigator.share({
                        title: `${element.name} - Periodica 3D`,
                        text: text
                    });
                }
            } catch (e) { /* user cancelled or error */ }
        }
    };

    const UI = {
        async setupStatusBar() {
            try {
                const StatusBar = window.Capacitor?.Plugins?.StatusBar;
                if (StatusBar) {
                    await StatusBar.hide();
                }
            } catch (e) { /* ignore */ }
        },

        async hideSplashScreen() {
            try {
                const SplashScreen = window.Capacitor?.Plugins?.SplashScreen;
                if (SplashScreen) {
                    await SplashScreen.hide();
                }
            } catch (e) { /* ignore */ }
        }
    };

    /* ==========================================================================
       6. ADAPTIVE ORIENTATION (Rock-Solid Landscape for Phones, Free for Tablets/Foldables)
       ========================================================================== */
    const Orientation = {
        appliedState: null, // 'landscape_locked' | 'unlocked'

        async init() {
            if (!config.features?.enableSmartOrientation) return;
            if (!window.Capacitor?.isNativePlatform()) return;

            await this.applySmartOrientation();

            // Only re-evaluate on screen changes (e.g. folding/unfolding display size change)
            window.addEventListener('resize', () => {
                const screenSmallestDim = Math.min(window.screen.width, window.screen.height);
                const isTabletOrFoldable = screenSmallestDim >= (config.orientation?.minWidthForPortrait || 600);
                const desiredState = isTabletOrFoldable ? 'unlocked' : 'landscape_locked';

                if (this.appliedState !== desiredState) {
                    this.applySmartOrientation();
                }
            });
        },

        async applySmartOrientation() {
            try {
                const ScreenOrientation = window.Capacitor?.Plugins?.ScreenOrientation;
                if (!ScreenOrientation) return;

                const minWidthForPortrait = config.orientation?.minWidthForPortrait || 600;

                // CRITICAL: Must ONLY check physical screen dimensions (smallest width), NEVER window.innerWidth!
                const screenSmallestDim = Math.min(window.screen.width, window.screen.height);
                const isTabletOrFoldable = screenSmallestDim >= minWidthForPortrait;

                if (isTabletOrFoldable) {
                    // Foldable Inner Display / Large Tablet: Allow full free rotation
                    if (this.appliedState !== 'unlocked') {
                        await ScreenOrientation.unlock();
                        this.appliedState = 'unlocked';
                        document.body.classList.remove('is-phone-landscape-locked');
                        document.body.classList.add('is-tablet-or-foldable');
                        console.log("[Orientation] Large screen / Foldable detected: Free rotation active.");
                    }
                } else {
                    // Standard Smartphone: Lock strictly to Landscape (sensorLandscape allows both left & right landscape)
                    if (this.appliedState !== 'landscape_locked') {
                        await ScreenOrientation.lock({ orientation: 'landscape' });
                        this.appliedState = 'landscape_locked';
                        document.body.classList.add('is-phone-landscape-locked');
                        document.body.classList.remove('is-tablet-or-foldable');
                        console.log("[Orientation] Smartphone detected: Locked firmly to Landscape.");
                    }
                }
            } catch (e) {
                console.warn("[Orientation] ScreenOrientation notice:", e);
            }
        },

        async lockLandscape() {
            try {
                const ScreenOrientation = window.Capacitor?.Plugins?.ScreenOrientation;
                if (ScreenOrientation) {
                    await ScreenOrientation.lock({ orientation: 'landscape' });
                    this.appliedState = 'landscape_locked';
                }
            } catch (e) { /* ignore */ }
        },

        async unlock() {
            try {
                const ScreenOrientation = window.Capacitor?.Plugins?.ScreenOrientation;
                if (ScreenOrientation) {
                    await ScreenOrientation.unlock();
                    this.appliedState = 'unlocked';
                }
            } catch (e) { /* ignore */ }
        }
    };

    /* ==========================================================================
       INITIALIZATION
       ========================================================================== */
    const init = async () => {
        await UI.setupStatusBar();
        await Orientation.init();
        await Ads.init();
        await Subscriptions.init();
        await Notifications.init();
        
        // Hide splash screen after initialization
        setTimeout(() => UI.hideSplashScreen(), 800);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        Ads,
        Subscriptions,
        Notifications,
        Haptics,
        Share,
        Orientation,
        UI,
        isPro: () => isProUser
    };
})();
