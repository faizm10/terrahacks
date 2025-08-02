from fastapi import FastAPI
from api.routes import openai
import uvicorn

app = FastAPI(title="TerraHacks Backend API")

app.include_router(openai.router, prefix="/api/openai", tags=["OpenAI"])

@app.get("/")
def read_root():
    return {"message": "Welcome to TerraHacks Backend API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
