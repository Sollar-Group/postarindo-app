# Submitting PostaRindo to App Store and Play Store

This document explains the step-by-step process for generating a production build of PostaRindo for both iOS and Android using Expo Application Services (EAS).

## Prerequisites

1.  **Install EAS CLI:**
    You need to have the EAS CLI installed globally to run the build commands.
    ```bash
    npm install -g eas-cli
    ```

2.  **Login to your Expo account:**
    ```bash
    eas login
    ```

3.  **Configure EAS project:**
    Initialize EAS for the project if you haven't already. This will create an `eas.json` file.
    ```bash
    eas build:configure
    ```
    During configuration, choose the default profiles or customize them as needed in `eas.json`.

4.  **Apple and Google Developer Accounts:**
    *   **iOS:** Ensure you have an active Apple Developer account and are logged in with the necessary permissions. EAS will prompt you to log into your Apple account during the build process to manage provisioning profiles and certificates automatically.
    *   **Android:** Ensure you have a Google Play Developer account.

## Generating the Production Build

We will generate production builds which can be submitted to the stores.

### iOS (App Store)

To build the iOS app for store submission:

1.  Run the following command:
    ```bash
    eas build --platform ios --profile production
    ```
2.  EAS CLI will prompt you to log in to your Apple Developer account if needed.
3.  EAS will handle the creation of App IDs, Provisioning Profiles, and Distribution Certificates automatically.
4.  Once the build is complete, EAS will provide a link to the `.ipa` file (if you download it manually) or you can use `eas submit` to send it directly to App Store Connect.

### Android (Google Play Store)

To build the Android app for store submission (generates an App Bundle `.aab`):

1.  Run the following command:
    ```bash
    eas build --platform android --profile production
    ```
2.  EAS CLI will handle creating or using an existing Android Keystore to sign the app. It will securely store these credentials for you.
3.  Once the build is complete, EAS will provide a link to download the `.aab` file, which is required for the Play Store.

## Submitting to Stores

Expo provides a command to directly submit your successfully built apps to the respective stores using `eas submit`.

### Submitting iOS Build to App Store Connect

1.  After a successful iOS production build, run:
    ```bash
    eas submit -p ios
    ```
2.  Select the latest build when prompted.
3.  Provide the necessary Apple App-Specific Password (you can generate this in your Apple ID account settings).
4.  Wait for the submission to process. It will then appear in App Store Connect under TestFlight or ready for submission.

### Submitting Android Build to Google Play Store

1.  First, ensure you have created a Service Account Key in Google Cloud Platform with the necessary permissions for Google Play Console, and download the JSON key file.
2.  After a successful Android production build, run:
    ```bash
    eas submit -p android
    ```
3.  EAS will prompt you for the path to your Google Play Service Account JSON key.
4.  It will also ask which track you want to submit to (e.g., `production`, `beta`, `internal`).
5.  Wait for the submission to complete. It will then be available in the Google Play Console.

## Environment Variables
Since PostaRindo uses Supabase, ensure that your production environment variables (`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`) are either:
1. Hardcoded (not recommended for keys).
2. Set in your EAS project dashboard as Secrets for the `production` profile, or
3. Added to an `.env.production` file if you configured it, so they are injected at build time.

## Store Assets Check
Before submitting the final review, ensure:
*   You have added `./assets/icon.png` (app icon).
*   You have added `./assets/splash.png` (splash screen).
*   You have high-resolution screenshots and metadata ready in App Store Connect and Google Play Console.
