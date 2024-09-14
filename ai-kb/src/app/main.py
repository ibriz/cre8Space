import uvicorn
from config import Config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router

_config = Config()
WHITELIST_URL = _config.get_config()["WHITELIST_URL"]

app = FastAPI(title="KB-Walrus", description="AI service for KB-Walrus")

app.add_middleware(
    CORSMiddleware,
    allow_origins=WHITELIST_URL.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthcheck")
def healtcheck():
    return {"status": "ok"}


app.include_router(router=router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="info", reload=True)
