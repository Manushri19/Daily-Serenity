
## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies in the main dire:
   `npm install`
2. Set the `GEMINI_API_KEY` and 'YOUTUBE_API_KEY' in [.env](.env) to your Gemini API key and Youtube API V3 key
3. Run the backend in cbt-rag-service folder:
`uv run uvicorn main:app --reload`
4. Run the app in the main directory:
   `npm run dev`
