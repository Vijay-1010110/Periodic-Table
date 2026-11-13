/**

 * Periodica 3D - Pro Billing, Gating & Engagement Engine (v4.5.0)

 * Handles:

 * 1. Google Play In-App Billing (Play Billing Library v8.0.0) Integration

 * 2. Feature Gating (Free: Properties View, Pro: Orbitals, Isotopes, Compounds, Reactions, Crystals, Compare, Quiz, Heatmaps)

 * 3. Paywall Modal & Redirect on Close

 * 4. Tier Badges (Top Nav & Mobile Sidebar)

 * 5. Frequently Scheduled Chemistry Reminder Notifications

 * 6. In-App Review & Rating Prompt Triggers

 */



(function () {

    'use strict';



    const PRO_STORAGE_KEY = 'periodica_is_pro';

    const PRO_PRODUCT_ID = 'periodica_pro_lifetime';



    // 1. Pro Status State

    function isProUser() {

        return localStorage.getItem(PRO_STORAGE_KEY) === 'true';

    }



    function setProUser(status, notify = true) {

        localStorage.setItem(PRO_STORAGE_KEY, status ? 'true' : 'false');

        if (status) {

            document.body.classList.add('is-pro-user');

        } else {

            document.body.classList.remove('is-pro-user');

        }

        updateTierUI();



        if (status && notify) {

            if (window.NativeServices?.Haptics?.notification) {

                window.NativeServices.Haptics.notification('SUCCESS');

            }

            const modal = document.getElementById('pro-paywall-modal');

            if (modal) modal.style.display = 'none';

            if (typeof window.syncNativeSliderVisibility === 'function') {

                window.syncNativeSliderVisibility();

            }

        }

    }



    // 2. UI Updates (Badges & Settings)

    function updateTierUI() {

        const isPro = isProUser();



        // Top Nav Badge

        const topBadge = document.getElementById('top-tier-badge');

        if (topBadge) {

            if (isPro) {

                topBadge.className = 'tier-badge-pill pro';

                topBadge.textContent = '👑 PRO';

                topBadge.title = 'Periodica 3D Pro (Lifetime Active)';

            } else {

                topBadge.className = 'tier-badge-pill free';

                topBadge.textContent = 'FREE';

                topBadge.title = 'Free Version - Click to Upgrade to Pro';

            }

        }



        // Sidebar Widget

        const sideWidget = document.getElementById('sidebar-tier-widget');

        if (sideWidget) {

            if (isPro) {

                sideWidget.className = 'sidebar-tier-widget pro';

                const icon = sideWidget.querySelector('.sidebar-tier-icon');

                const name = sideWidget.querySelector('.sidebar-tier-name');

                const sub = sideWidget.querySelector('.sidebar-tier-sub');

                if (icon) icon.textContent = '👑';

                if (name) name.textContent = 'Pro Member';

                if (sub) sub.textContent = 'Lifetime Active';

            } else {

                sideWidget.className = 'sidebar-tier-widget free';

                const icon = sideWidget.querySelector('.sidebar-tier-icon');

                const name = sideWidget.querySelector('.sidebar-tier-name');

                const sub = sideWidget.querySelector('.sidebar-tier-sub');

                if (icon) icon.textContent = '⭐';

                if (name) name.textContent = 'Free Plan';

                if (sub) sub.textContent = 'Tap to Unlock Pro ➔';

            }

        }



        // Logo PRO badge (shown on logo for paid users, hidden for free users)

        const logoProBadge = document.getElementById('sidebar-logo-pro-badge');

        if (logoProBadge) {

            logoProBadge.style.display = isPro ? 'flex' : 'none';

        }



        // Settings Modal License Field

        const licenseBadge = document.getElementById('settings-license-badge');

        if (licenseBadge) {

            licenseBadge.textContent = isPro ? '👑 Periodica 3D Pro (Lifetime)' : 'Free Plan';

            licenseBadge.style.color = isPro ? '#fbbf24' : '#94a3b8';

        }

    }



    // 3. Pro Paywall Modal

    function openProPaywallModal(featureSource = null) {

        if (isProUser()) return;



        const modal = document.getElementById('pro-paywall-modal');

        if (!modal) return;

        window._lastPaywallOpenTime = Date.now();



        // Hide native slider over paywall

        if (window.PeriodicaNativeSlider && window.PeriodicaNativeSlider.setVisibility) {

            window.PeriodicaNativeSlider.setVisibility(false);

        }

        modal.style.display = 'flex';

        if (typeof window.syncNativeSliderVisibility === 'function') {

            window.syncNativeSliderVisibility();

        }



        // Customise callout based on triggered feature

        const calloutEl = document.getElementById('pro-modal-callout-text');

        if (calloutEl) {

            const featureNames = {

                'electrons': '3D Quantum Orbitals & Aufbau Subshells',

                'isotopes': '3,000+ Nuclear Isotopes & Radioactive Decay Chamber',

                'compounds': '3D Molecular Compounds & Chemical Structures',

                'reactions': 'Chemical Reactions Balancer & Stoichiometry Engine',

                'crystals': '3D Crystal Lattices & Bravais Unit Cells',

                'compare': 'Element Comparison Radar & Trend Analytics',

                'quiz': 'Chemistry Quiz Challenge & Mastery Tracking',

                'simulations': 'Simulation Lab (Nuclear Chain Reactions, Decays & Molecular Dynamics)',

                'electronegativity': 'Electronegativity Periodic Heatmap',

                'ionizationEnergy': 'Multi-Tier Ionization Energy Heatmap',

                'atomicRadius': 'Empirical Atomic Radius Heatmap',

                'electronAffinity': 'Electron Affinity Energy Heatmap',

                'meltingPoint': 'Thermodynamic Melting Point Gradient',

                'boilingPoint': 'Thermodynamic Boiling Point Gradient',

                'density': 'STP Density Distribution Heatmap',

                'block': 'Subshell Orbital Block Classification'

            };



            const featureName = featureNames[featureSource];

            if (featureName) {

                calloutEl.innerHTML = `You discovered <strong>${featureName}</strong>! Unlock this and all advanced visualizers with Periodica 3D Pro.`;

            } else {

                calloutEl.innerHTML = `Unlock 3D Quantum Orbitals, Nuclear Isotopes, Reactions Balancer, 3D Crystals, and all 12+ periodic heatmaps!`;

            }

        }



        if (window.PeriodicaNativeBilling && typeof window.PeriodicaNativeBilling.getProductPrice === 'function') {

            const livePrice = window.PeriodicaNativeBilling.getProductPrice();

            if (livePrice && typeof window.onNativeProductPrice === 'function') {

                window.onNativeProductPrice(livePrice);

            }

        }



        modal.style.display = 'flex';

    }



    function closeProPaywallModal(force = false) {

        if (!force && (Date.now() - (window._lastPaywallOpenTime || 0) < 600)) {
            console.log('[Paywall] Ignored premature close within 600ms of open');
            return;
        }

        const modal = document.getElementById('pro-paywall-modal');

        if (modal) modal.style.display = 'none';



        // Requirement: When user clicks close on the premium paywall, redirect to the free view (Property Interface / Standard Category)

        if (!isProUser()) {

            if (typeof window.switchView === 'function') {

                window.switchView('main', true, false);

            }

            if (typeof window.setTableProperty === 'function') {

                window.setTableProperty('category');

            }

        }



        if (typeof window.syncNativeSliderVisibility === 'function') {

            window.syncNativeSliderVisibility();

        }

    }



    function handleTierBadgeClick(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (isProUser()) {
            alert('👑 Periodica 3D Pro is active on your device! All features and visualizers are permanently unlocked.');
        } else {
            openProPaywallModal('badge');
        }
    }



    // 4. In-App Purchase Execution

    function purchasePro() {

        if (window.PeriodicaNativeBilling && typeof window.PeriodicaNativeBilling.launchPurchaseFlow === 'function') {

            window.PeriodicaNativeBilling.launchPurchaseFlow(PRO_PRODUCT_ID);

        } else {

            // Web / browser test fallback

            const simulate = confirm('Unlock Periodica 3D Pro lifetime access on this device?');

            if (simulate) {

                setProUser(true, true);

                alert('🎉 Congratulations! Periodica 3D Pro has been unlocked on your device.');

            }

        }

    }



    function restorePurchases() {

        if (window.PeriodicaNativeBilling && typeof window.PeriodicaNativeBilling.restorePurchases === 'function') {

            window.PeriodicaNativeBilling.restorePurchases();

        } else {

            if (isProUser()) {

                alert('✅ Pro status is already active on this device.');

            } else {

                alert('ℹ️ No active Google Play purchase found for this account.');

            }

        }

    }



    // 5. Native Callbacks from MainActivity

    window.onNativeProStatus = function (isPro) {

        setProUser(!!isPro, false);

    };



    window.onNativePurchasesRestored = function (foundPro) {

        if (foundPro) {

            setProUser(true, true);

            alert('🎉 Purchases restored successfully! Periodica 3D Pro is now active.');

        } else {

            setProUser(false, false);

            alert('ℹ️ No previous Google Play purchase was found for your logged-in Google account.');

        }

    };



    window.onNativeBillingEvent = function (status, msg, isPro) {

        if (status === 'success' || isPro) {

            setProUser(true, true);

            alert('🎉 Thank you for supporting Periodica 3D! Pro features are permanently unlocked.');

        } else if (status === 'pending') {

            alert('⏳ ' + (msg || 'Payment is pending confirmation from Google Play. Pro will unlock automatically once confirmed.'));

        } else if (status === 'cancelled') {

            // User cancelled Google Play purchase sheet

        } else if (status === 'error') {

            console.warn('[Billing Error]', msg);

            alert('⚠️ Purchase could not be completed: ' + (msg || 'Please verify your Google Play connection and try again.'));

        }

    };



    window.onNativeProductPrice = function (priceStr) {

        if (!priceStr) return;

        const priceEl = document.getElementById('pro-pricing-display');

        if (priceEl) priceEl.textContent = priceStr;

        const buyBtn = document.querySelector('.pro-btn-buy');

        if (buyBtn) {

            buyBtn.innerHTML = `<span>⭐</span> Unlock Lifetime Pro (${priceStr})`;

        }

    };



    // 6. Frequently Scheduled Reminder Notifications

    async function scheduleFrequentChemistryReminders() {

        try {

            if (!window.Capacitor?.isNativePlatform()) return;

            const LocalNotifications = window.Capacitor?.Plugins?.LocalNotifications;

            if (!LocalNotifications) return;



            const perm = await LocalNotifications.checkPermissions();

            if (perm.display !== 'granted') {

                const req = await LocalNotifications.requestPermissions();

                if (req.display !== 'granted') return;

            }



            // Create notification channel

            await LocalNotifications.createChannel({

                id: 'periodica_reminders',

                name: 'Chemistry Reminders & Study Alerts',

                description: 'Periodic fascinating element facts and interactive chemistry reminders',

                importance: 4,

                visibility: 1

            });



            // Rotating engaging facts

            const chemistryReminders = [

                {

                    title: '⚛️ Periodica 3D Fact of the Day',

                    body: 'Did you know Tungsten has the highest melting point of any element at 3,695 K? Explore thermal transitions now!'

                },

                {

                    title: '🧪 Nuclear Science Alert',

                    body: 'Carbon-14 has a half-life of 5,730 years! Inspect radioactive decay chains in the Isotopes Chamber.'

                },

                {

                    title: '🌌 Quantum Chemistry Reminder',

                    body: 'Examine d-orbital cloverleaf wavefunctions in 3D Orbitals today on Periodica 3D.'

                },

                {

                    title: '⚡ Periodic Trend Challenge',

                    body: 'Fluorine is the most electronegative element with a Pauling value of 3.98. Check the trends heatmap!'

                },

                {

                    title: '🧠 Daily Chemistry Quiz',

                    body: 'Ready to test your knowledge of the elements? Try today\'s quick 10-question Chemistry Quiz!'

                }

            ];



            // Pick a fact based on the current day

            const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

            const selectedReminder = chemistryReminders[dayOfYear % chemistryReminders.length];



            // Cancel old reminder id 105

            await LocalNotifications.cancel({ notifications: [{ id: 105 }] });



            const targetTime = new Date();

            targetTime.setHours(18); // 6:00 PM daily reminder

            targetTime.setMinutes(30);

            targetTime.setSeconds(0);

            if (targetTime <= new Date()) {

                targetTime.setDate(targetTime.getDate() + 1);

            }



            await LocalNotifications.schedule({

                notifications: [

                    {

                        id: 105,

                        title: selectedReminder.title,

                        body: selectedReminder.body,

                        schedule: {

                            at: targetTime,

                            repeats: true,

                            every: 'day'

                        },

                        channelId: 'periodica_reminders',

                        smallIcon: 'ic_stat_icon',

                        iconColor: '#00d4ff'

                    }

                ]

            });

        } catch (e) {

            console.warn('[Notifications] Frequent reminder notice:', e);

        }

    }



    // 7. Rating Prompt & Engagement Tracker

    function trackSessionAndCheckRatingPrompt() {

        try {

            // PRO users are never prompted

            if (isProUser()) return;



            const hasRated = localStorage.getItem('periodica_rated') === 'true';

            if (hasRated) return;



            const neverShow = localStorage.getItem('periodica_rate_never') === 'true';

            if (neverShow) return;



            const laterTs = parseInt(localStorage.getItem('periodica_rate_later_timestamp') || '0', 10);

            if (laterTs && Date.now() - laterTs < 3 * 24 * 60 * 60 * 1000) {

                // Remind later set within last 3 days

                return;

            }



            let sessions = parseInt(localStorage.getItem('periodica_sessions_count') || '0', 10) + 1;

            localStorage.setItem('periodica_sessions_count', sessions.toString());



            // Trigger prompt on 2nd session after a pleasant 8-second delay

            if (sessions >= 2) {

                setTimeout(() => {

                    if (typeof window.openRateUsModal === 'function') {

                        window.openRateUsModal();

                    }

                }, 8000);

            }

        } catch (e) {}

    }



    // 8. Element Inspection Tracker

    function trackElementInspection() {

        try {

            // PRO users are never prompted

            if (isProUser()) return;



            if (localStorage.getItem('periodica_rated') === 'true') return;

            if (localStorage.getItem('periodica_rate_never') === 'true') return;



            let viewed = parseInt(localStorage.getItem('periodica_elements_viewed') || '0', 10) + 1;

            localStorage.setItem('periodica_elements_viewed', viewed.toString());



            if (viewed === 6) {

                setTimeout(() => {

                    if (typeof window.openRateUsModal === 'function') {

                        window.openRateUsModal();

                    }

                }, 2000);

            }

        } catch (e) {}

    }



    // Initialize on DOM load

    document.addEventListener('DOMContentLoaded', () => {

        if (isProUser()) {

            document.body.classList.add('is-pro-user');

        }

        updateTierUI();



        // Check native billing pro status if bridge is available

        if (window.PeriodicaNativeBilling && typeof window.PeriodicaNativeBilling.checkProStatus === 'function') {

            window.PeriodicaNativeBilling.checkProStatus();

        }



        // Schedule periodic notifications

        setTimeout(scheduleFrequentChemistryReminders, 2500);



        // Check rating prompt eligibility

        setTimeout(trackSessionAndCheckRatingPrompt, 3500);

    });



    // Exports

    window.isProUser = isProUser;

    window.setProUser = setProUser;

    window.openProPaywallModal = openProPaywallModal;

    window.closeProPaywallModal = closeProPaywallModal;

    window.handleTierBadgeClick = handleTierBadgeClick;

    window.purchasePro = purchasePro;

    window.restorePurchases = restorePurchases;

    window.trackElementInspection = trackElementInspection;

})();

