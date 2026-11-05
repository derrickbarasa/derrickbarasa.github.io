# Arroscape early access

The portfolio serves `arroscape-0.3.5-early-access.apk` directly as a static file. Deploy this directory with the rest of the site. No Play Store listing or server-side install service is needed. Downloading on a computer saves an Android APK; installation happens on an Android device.

## Included build

- Source: release build from the app repository at commit a5fa8bf plus the 0.3.5+17 version bump (flattened single-blue home cards and result screen, on top of 0.3.4's extreme levels and campaign result screens)
- Version: 0.3.5 (17), package `com.nightcurrent.arrows`
- Release build, signed with the same test key as 0.3.2 to 0.3.4 so it updates in place (signer SHA-256 293b35b9...bb90). Verified with apksigner; installed over 0.3.4 on a Samsung SM-A165F
- Android 7.0 / API 24 minimum; ARM 32-bit and ARM 64-bit (phones only; the x86_64 emulator libraries were dropped to halve the download)
- Size: 36731192 bytes (the 0.3.4 profile build was 76817896)
- SHA-256: `467974e2aa02f2ccf1e9d77ea1af7f351d59b2b489241c578780c9908d0712e8`

Built with `flutter build apk --release --target-platform android-arm,android-arm64`. This is an early test distribution. Keep the signing key and package identity consistent for updates. A future Play Store release signed with a different key may require testers to uninstall this build, losing local progress.

## Updating

1. Obtain the next verified APK from the app's distribution directory. Use a higher version code and the same signing key to preserve in-place updates.
2. Copy it here with a versioned filename, verify its SHA-256, and update `SHA256SUMS.txt`.
3. Update the download URL, version, size, minimum Android version and any changed feature descriptions in `index.html`. Refresh screenshots if the app changes.
4. Run `npm run build` and deploy the APK, checksum, HTML, images and compiled CSS together.

There is no automatic updater. Visitors return to the portfolio for newer builds. Before a production release, set up the app's permanent release signing configuration in the app repository.

## Hosting future builds

This 37 MB APK is committed once and stays under GitHub's 100 MB file limit, but every new APK committed here adds roughly 37 MB to the repository history. For later versions, publish the APK as a GitHub Release asset (or another file host) instead of committing it, then point the download link in `index.html` at that URL and keep only `SHA256SUMS.txt` here.
