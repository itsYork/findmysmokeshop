# Agent Instructions

This project is a simple static website with a small Flask backend located in the `backend/` directory.

## Workflow Guidelines

- Make small, focused commits with descriptive messages.
- After modifying any Python code, run the following syntax check from the repo root:

  ```bash
  python -m py_compile backend/app.py backend/wsgi.py
  ```

  Add any new Python files to this command as needed.
- See `backend/AGENTS.md` for backend-specific details.

## Navigation Tips

- HTML, CSS and JavaScript files live in the repository root.
- The Flask API code is under `backend/`.
- `README.md` explains how to run the backend server and the static site.
