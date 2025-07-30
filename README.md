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
session data secure. `backend/app.py` falls back to a default if this variable
is missing.

## Docker

A `Dockerfile` under `backend/` can build a containerized version of the API.

Build the image from the project root:

```bash
docker build -t findmysmokeshop-backend ./backend
```

Run the container and expose port 5000:

```bash
docker run -p 5000:5000 findmysmokeshop-backend
```

The API will be available at `http://localhost:5000/`.

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

