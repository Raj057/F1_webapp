# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.race import router as race_router

app = FastAPI(title="FastF1 API Server")

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(race_router, prefix="/race")
from routes import circuit as circuit_router

app.include_router(circuit_router.router)


@app.get("/")
def root():
    return {"message": "Welcome to the Formula 1 FastF1 API!"}
