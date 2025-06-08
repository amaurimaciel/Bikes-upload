# Bikes-upload

This repository includes a simple Chrome Extension named **Bike Catalog Assistant**. The extension helps extracting data from the bike upload page and querying an API for recommended values.

## Loading the extension

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `extension` folder in this repository.

## Usage

1. Visit the bike upload page in your backoffice.
2. A side panel titled **Bike Assistant** will appear.
3. Click **Analyze** to gather the current page values and send them to a remote API (OpenAI example endpoint). The API should return a CSV with columns `field, certainty, suggestion, source, details`.
4. The CSV is displayed in the panel. Use **Fill Form** to populate the form fields with the suggested values, or **Download CSV** to save it locally.

The actual API call is left as a placeholder. Replace the endpoint and authorization token in `content.js` with your own service.
