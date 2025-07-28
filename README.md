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

## Login credentials

Brand and retailer logins use credentials stored in the browser's
`localStorage`. This approach is meant only for demo/testing purposes and is
not secure for real accounts.



## Python backend

A simple Flask application is located in the `backend/` directory. It exposes API
endpoints for user registration, login and subscription management. The app uses
a SQLite database stored alongside the code.

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

- `POST /register` – body `{ "email": "user@example.com", "password": "..." }`.
- `POST /login` – authenticate the user.
- `POST /logout` – end the current session.
- `GET /me` – return the logged in user's email and subscription status.
- `POST /subscribe` – update subscription status with body `{ "status": "..." }`.

Set `SECRET_KEY` in `backend/app.py` to a strong value before deploying.

## Deploying with Git on Namecheap

Namecheap's cPanel includes a **Git Version Control** feature that can automatically pull your repository and run deployment commands.

1. Log in to cPanel and open **Git Version Control**.
2. Click **Create** and choose a repository path such as `~/repos/findmysmokeshop.git`. If your code is hosted elsewhere, provide the clone URL.
3. cPanel will display an SSH address. On your local machine, add it as a remote:

   ```bash
   git remote add namecheap ssh://USERNAME@HOSTNAME/home/USERNAME/repos/findmysmokeshop.git
   ```

   Replace `USERNAME` and `HOSTNAME` with your account details.

4. Push your code to Namecheap:

   ```bash
   git push namecheap main
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

