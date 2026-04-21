from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
import urllib.parse
from dotenv import load_dotenv
import httpx
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Assuming rag.py exists and exports this
from rag import retrieve_context 
from gemini import build_prompt, generate_reply

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGIN", "*")],
    allow_methods=["POST", "GET"],
    allow_headers=["*"]
)

class Message(BaseModel):
    role: str
    content: str

class QueryRequest(BaseModel):
    message: str
    behavioural_summary: str
    concerns: List[str]
    conversation_history: List[Message]

@app.get("/api/ping")
def ping():
    return {"status": "ok"}

@app.get("/api/youtube-search")
async def youtube_search(q: str):
    youtube_api_key = os.getenv("YOUTUBE_API_KEY")
    if not youtube_api_key:
        raise HTTPException(status_code=500, detail="YOUTUBE_API_KEY not configured on server. Please add it to Secrets.")
    
    url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q={urllib.parse.quote(q)}&type=video&key={youtube_api_key}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail="Failed to connect to YouTube API")

@app.post("/api/query")
def query(req: QueryRequest):
    try:
        cbt_context = retrieve_context(req.message, req.concerns)

        # Replaced deprecated .dict() with .model_dump() for Pydantic V2 compatibility
        history = [m.model_dump() for m in req.conversation_history]
        
        prompt = build_prompt(
            message=req.message,
            cbt_context=cbt_context,
            behavioural_summary=req.behavioural_summary,
            conversation_history=history
        )

        result = generate_reply(prompt, req.concerns)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# SPA Fallback and Static Files Mount
if os.path.isdir("dist") and os.path.isdir("dist/assets"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    path = os.path.join("dist", full_path)
    
    # Return requested static file if it exists
    if os.path.isfile(path) and full_path != "":
        return FileResponse(path)
        
    # Otherwise return the index.html for client-side routing
    index = os.path.join("dist", "index.html")
    if os.path.isfile(index):
        return FileResponse(index)
        
    return {"message": "CBT Therapy API is running. (No static frontend found in /dist)"}