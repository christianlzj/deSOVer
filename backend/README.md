# deSOVer – Local Development

## Backend (FastAPI)

1. Navigate to the repository root.
2. Create a virtual environment and install dependencies:

```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

3. Run the server:

```bash
uvicorn backend.main:app --reload --port 8000
```

API available at `http://localhost:8000`; docs at `http://localhost:8000/docs`.

---

## Frontend (React)

1. Open a new terminal and navigate to the `frontend` folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```


The frontend will open at `http://localhost:5173` (Vite) or `http://localhost:3000` (CRA).

---

> **Note:** Make sure the backend is running before accessing the frontend.
