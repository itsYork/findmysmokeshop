# Find My Smoke Shop

This project is a simple website for locating smoke shops.

## Setup

1. Install [Node.js](https://nodejs.org/) if it is not already installed.
2. Run `npm install` to install dependencies.
3. Set the environment variable `FSQ_API_KEY` with your Foursquare API key.
4. Start the application with `npm start` and visit `http://localhost:3000` in your browser.

The API key is provided to the frontend via the `/api/config` endpoint. If the key is not set, the locator will display an error message.
