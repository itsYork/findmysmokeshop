# FindMySmokeShop

A simple static website for locating smoke shops and browsing popular smoke‑shop brands. The project contains only HTML, CSS and a small amount of JavaScript for interactive features and for calling the Foursquare Places API.

## Serving the site locally

Since the project consists solely of static files, you can serve it locally with any static file server. If you have Python installed, run the following from the project root:

```bash
python3 -m http.server
```

Then open `http://localhost:8000` in your browser and navigate to the HTML pages.

## Foursquare API key

The store locator in `locator.html` fetches nearby shops using the Foursquare Places API. The key is defined in [`script.js`](script.js) as the constant `FSQ_API_KEY`:

```javascript
const FSQ_API_KEY = 'YOUR_FOURSQUARE_API_KEY';
```

Replace the placeholder value with your actual API key before using the locator page.

