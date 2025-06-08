# Bikes-upload

This repository includes a simple Chrome Extension named **Bike Catalog Assistant**. The extension helps extracting data from the bike upload page and querying an API for recommended values.

## Loading the extension

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `extension` folder in this repository.
4. The extension requires access to `https://api.openai.com/*`, granted via
   `host_permissions` in `manifest.json`.

## Usage

1. Visit the bike upload page in your backoffice.
2. A side panel titled **Bike Assistant** will appear.
3. Click **Analyze** to gather the current page values. The collected data is
   shown as an "Input CSV" in the side panel and is sent to the API.
4. The API response (an "Output CSV") is displayed below the input. Use
   **Fill Form** to populate the page fields or **Download CSV** to save the
   output locally.

The actual API call is left as a placeholder. Replace the endpoint and authorization token in `content.js` with your own service.
