# Arroscape early access

The portfolio serves `arroscape-0.3.4-early-access.apk` directly as a static file. Deploy this directory with the rest of the site. No Play Store listing or server-side install service is needed. Downloading on a computer saves an Android APK; installation happens on an Android device.

## Included build

- Source: `app-profile.apk` built from the app repository at commit c7b85b2 (extreme levels with four lives, campaign result screens, plus burst arrows, per-level arrow colors and the indigo home redesign)
- Version: 0.3.4 (16), package `com.nightcurrent.arrows`
- Profile test build, signed with the same test key as 0.3.2 and 0.3.3 so it updates in place (signer SHA-256 293b35b9...bb90)
- Android 7.0 / API 24 minimum; ARM 32-bit, ARM 64-bit and x86_64
- Size: 76817896 bytes
- SHA-256: `803898b22cdeb9954f2d26832d58a1e4fcc95dff4609994f4c3f7e4397c69153`

The binary was copied unchanged from the build output; installed and launched on a Samsung SM-A165F. This is an early test distribution, not a newly built production release. Keep the signing key and package identity consistent for updates. A future Play Store release signed with a different key may require testers to uninstall this build, losing local progress.

## Updating

1. Obtain the next verified APK from the app's distribution directory. Use a higher version code and the same signing key to preserve in-place updates.
2. Copy it here with a versioned filename, verify its SHA-256, and update `SHA256SUMS.txt`.
3. Update the download URL, version, size, minimum Android version and any changed feature descriptions in `index.html`. Refresh screenshots if the app changes.
4. Run `npm run build` and deploy the APK, checksum, HTML, images and compiled CSS together.

There is no automatic updater. Visitors return to the portfolio for newer builds. Before a production release, set up the app's permanent release signing configuration in the app repository.

## Hosting future builds

This 76 MB APK is committed once and stays under GitHub's 100 MB file limit, but every new APK committed here adds roughly 76 MB to the repository history. For later versions, publish the APK as a GitHub Release asset (or another file host) instead of committing it, then point the download link in `index.html` at that URL and keep only `SHA256SUMS.txt` here.
