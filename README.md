# FindMySmokeShop

A simple static website for locating smoke shops and browsing popular smoke‑shop brands. The project contains only HTML, CSS and a small amount of JavaScript for interactive features and for calling a small Flask API.

## Serving the site locally

Since the project consists solely of static files, you can serve it locally with any static file server. If you have Python installed, run the following from the project root:

```bash
python3 -m http.server
```

Then open `http://localhost:8000` in your browser and navigate to the HTML pages.

## Google Maps API key

Store searches now proxy to the Google Maps Places API through the Flask backend. Set the `GOOGLE_MAPS_API_KEY` environment variable before running the server so your key isn't exposed to the browser.

## Login credentials

Brand and retailer logins use credentials stored in the browser's
`localStorage`. This approach is meant only for demo/testing purposes and is
not secure for real accounts.

Visitors can create an account from `signup.html`. New accounts are marked as
pending until you approve them in the SQLite database. Logging in before
approval will return an "Account pending approval" error.



## Python backend

A simple Flask application is located in the `backend/` directory. It exposes
API endpoints under the `/api/` path for user registration, login,
subscription management and store lookups. The app uses a SQLite database
stored alongside the code.

### Running locally

1. Create a virtual environment and install dependencies:

   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. Start the development server:

   ```bash
   flask --app app run
   ```

   The API will be available at `http://127.0.0.1:5000/`.

### API endpoints

- `POST /api/register` – body `{ "email": "user@example.com", "password": "..." }`.
- `POST /api/login` – authenticate the user.
- `POST /api/logout` – end the current session.
- `GET /api/me` – return the logged in user's email and subscription status.
- `POST /api/subscribe` – update subscription status with body `{ "status": "..." }`.
- `GET /api/stores` – proxy to the Google Maps Places API.
- `GET /api/static-map` – return a static map image for store results.

The brand and retail portals contain a small form that lets logged in users
update their subscription level using the `/api/subscribe` endpoint.

Set the `SECRET_KEY` environment variable before running the server to keep
session data secure. `backend/app.py` uses a default value of "change-me" only
when `SECRET_KEY` is unset or blank.

## Deploying with cPanel Git

cPanel includes a **Git Version Control** feature that can automatically pull your repository and run deployment commands.

1. Log in to cPanel and open **Git Version Control**.
2. Click **Create** and choose a repository path such as `~/repos/findmysmokeshop.git`. If your code is hosted elsewhere, provide the clone URL.
3. cPanel will display an SSH address. On your local machine, add it as a remote:

   ```bash
   git remote add cpanel ssh://USERNAME@HOSTNAME/home/USERNAME/repos/findmysmokeshop.git
   ```

   Replace `USERNAME` and `HOSTNAME` with your account details.

4. Push your code to cPanel:

   ```bash
   git push cpanel main
   ```

5. To deploy automatically, add a `.cpanel.yml` file with instructions:

   ```yaml
   deployment:
     tasks:
       - /bin/rsync -av --delete --exclude='.git' ./ ~/public_html/
   ```

   Adjust the destination path if your site lives elsewhere.

6. Enable deployment in cPanel's Git interface. Each push will run the commands from `.cpanel.yml`.

7. If using the Flask backend, create a Python app in cPanel's **Setup Python App** and set its project path to the `backend/` directory. Restart the app after updates.


## Image sources

The following Unsplash photos are referenced in the site:

| Use case | Direct Unsplash URL | Suggested alt text |
| -------- | ------------------- | ------------------ |
| Hero banner – street credibility | https://unsplash.com/photos/a-man-standing-outside-of-a-cigar-shop-1M1UfYNy21w | Person standing outside a classic cigar and smoke shop |
| Product shelf visual | https://unsplash.com/photos/a-bunch-of-cigars-that-are-on-a-shelf-arvkT97WUI4 | Rows of premium cigars neatly stacked on wood shelves |
| Urban mood break | https://unsplash.com/photos/red-cigars-neon-signage-hanging-decor-tb-u5Jqz15Q | Neon sign that reads cigars glowing red in a dark room |
| Hookah section header | https://unsplash.com/photos/a-hookah-with-smoke-coming-out-of-it-sitting-on-a-table-Sw7dClRfLk0 | Hookah on a table exhaling thick white smoke |
| Vape products tile | https://unsplash.com/photos/a-disposable-vape-pen-rests-on-a-concrete-surface-JODMH5e9rds | Disposable vape pen resting on concrete |
| Close-up vape detail | https://unsplash.com/photos/a-close-up-of-a-pen-PMf9FvSUMQg | Macro shot of a sleek vape pen cartridge |
| Abstract smoke background 1 | https://unsplash.com/photos/a-bunch-of-colorful-smoke-is-in-the-air-ItYcen4Yvlc | Colorful smoke swirling against black backdrop |
| Abstract smoke background 2 | https://unsplash.com/photos/a-multicolored-smoke-texture-on-a-black-background-CzllqUw_ecU | Multicolored smoke texture on dark background |
| Accent banner gradient | https://unsplash.com/photos/blue-and-orange-smoke-wQLAGv4_OYs | Blue and orange smoke blending together |
| Hookah lounge ambience | https://unsplash.com/photos/green-and-gray-hookah-_ynhWwRBKXk | Stylish green and gray hookah in low-light lounge |
