# Bikes-upload

This repository includes a simple Chrome Extension named **Bike Catalog Assistant**. The extension helps extract data from the bike upload page and export it as CSV.

## Loading the extension

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `extension` folder in this repository.

## Usage

1. Visit the bike upload page in your backoffice.
2. A side panel titled **Bike Assistant** will appear.
3. Click **Generate CSV** to collect the current page values. The result is
   displayed in the panel and can be downloaded using **Download CSV**.

The exported file follows the format `field, certainty, suggestion, source, details`. Values are read from the page with a certainty of `100` and the source marked as `page`.
