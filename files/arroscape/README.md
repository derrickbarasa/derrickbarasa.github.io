# Arroscape early access

The portfolio serves `arroscape-0.3.2-early-access.apk` directly as a static file. Deploy this directory with the rest of the site. No Play Store listing or server-side install service is needed. Downloading on a computer saves an Android APK; installation happens on an Android device.

## Included build

- Source: `C:\Users\USER\Desktop\apps\arrows\dist\arroscape-android-test.apk`
- Version: 0.3.2 (14), package `com.nightcurrent.arrows`
- Existing profile test build, signed with the app's current test key
- Android 7.0 / API 24 minimum; ARM 32-bit, ARM 64-bit and x86_64
- Size: 76,595,912 bytes
- SHA-256: `7d013e358756c796d37490fded810a60285e53f810971b3ff041fc645d0193a8`

The binary was copied unchanged and matched the source distribution checksum and byte count. This is an early test distribution, not a newly built production release. Keep the signing key and package identity consistent for updates. A future Play Store release signed with a different key may require testers to uninstall this build, losing local progress.

## Updating

1. Obtain the next verified APK from the app's distribution directory. Use a higher version code and the same signing key to preserve in-place updates.
2. Copy it here with a versioned filename, verify its SHA-256, and update `SHA256SUMS.txt`.
3. Update the download URL, version, size, minimum Android version and any changed feature descriptions in `index.html`. Refresh screenshots if the app changes.
4. Run `npm run build` and deploy the APK, checksum, HTML, images and compiled CSS together.

There is no automatic updater. Visitors return to the portfolio for newer builds. Before a production release, set up the app's permanent release signing configuration in the app repository.
