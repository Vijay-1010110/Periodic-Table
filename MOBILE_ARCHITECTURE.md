# PeriodicaX Mobile Architecture (Capacitor)

PeriodicaX uses a **Monorepo Architecture** to maintain 100% code parity between the web version (GitHub Pages/Firebase) and the Native Mobile App (iOS/Android).

## 1. How the Architecture Works
We use **Capacitor.js** as a native bridge.
1. The source code always lives in `src/`.
2. When you run `python build.py`, it compiles everything into the `public/` directory (for web deployment).
3. Capacitor is configured to look at the `public/` directory.
4. When `npx cap copy` is run, Capacitor physically copies the contents of `public/` into the native `android/` and `ios/` projects.

**Crucial Benefit:** You never have to write logic twice. Fix a bug in Three.js on the web, and it is instantly fixed on the mobile app.

## 2. Managing Platform Differences (Feature Flags)
Because the mobile app uses the exact same `index.html` and JavaScript files as the website, we use **Feature Flags** to toggle features that should only exist on one platform (e.g. hiding a "Download App" button if they are already in the app, or hiding AdSense on mobile to use AdMob instead).

### The `window.Platform` Object
We have built a `PlatformManager` (located in `src/js/13_platform.js`) that automatically detects the environment.

**In JavaScript:**
```javascript
if (window.Platform.isNative) {
    // We are running inside the iOS or Android app!
    // Initialize native AdMob plugins or Push Notifications here.
} else {
    // We are running in a regular web browser.
}
```

**In CSS:**
The `PlatformManager` automatically appends classes to the `<body>` tag based on the platform.
* `<body class="is-web">`
* `<body class="is-native is-android">`
* `<body class="is-native is-ios">`

You can use these CSS classes to completely hide or show UI elements without touching JavaScript!
```css
/* Show the "Download our App" banner only on the web */
.download-banner {
    display: block;
}

/* Hide it if they are already using the native app! */
.is-native .download-banner {
    display: none;
}
```

## 3. Building for Mobile
To update your mobile app after making changes to the code:
1. Run `python build.py` (This compiles the code and automatically runs `npx cap copy`).
2. Run `npx cap open android` to open Android Studio and generate an APK.
3. Run `npx cap open ios` to open Xcode and build for iPhone.
