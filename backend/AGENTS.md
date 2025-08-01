# Backend Agent Instructions

This directory contains the Flask API used by the site.

## Key Files

- `app.py` – main Flask application.
- `wsgi.py` – entry point for WSGI servers.
- `requirements.txt` – Python dependencies.

## Development Tips

- Use Python 3.11 or later.
- To run the server locally:

  ```bash
  flask --app app run
  ```

- Before committing any changes in this directory, run:

  ```bash
  python -m py_compile app.py wsgi.py
  ```

  Add any new modules to this command to ensure they compile.

- The SQLite database `app.db` will be created automatically on first run.
