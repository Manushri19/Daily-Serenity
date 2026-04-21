import json
from dotenv import load_dotenv
import time
from google import genai
from google.genai import types

load_dotenv()

# The modern SDK automatically detects GEMINI_API_KEY from the environment variables.
client = genai.Client()

SYSTEM_PROMPT = """
You are a compassionate, professional Cognitive Behavioral Therapist (CBT).
You follow evidence-based CBT techniques strictly.

Your responsibilities:
- Ask one focused, open-ended CBT question at a time
- Identify cognitive distortions gently (catastrophizing, black-and-white thinking etc.)
- Guide the user through thought challenging and reframing
- Never diagnose. Never prescribe. Always recommend professional help for crises.
- Keep responses concise (3-5 sentences max unless explaining a technique)
- Be warm, non-judgmental, and encouraging

You will be given:
1. Relevant CBT knowledge context
2. User's behavioural summary (their patterns and history)
3. Conversation history
4. User's current message

Always ground your response in the provided CBT context.
"""

def build_prompt(message: str, cbt_context: str, behavioural_summary: str,
                 conversation_history: list) -> str:
    # Safely extracting standard dictionaries
    history_text = "\n".join(
        [f"{m['role'].upper()}: {m['content']}" for m in conversation_history[-3:]]
    )

    full_prompt = f"""
{SYSTEM_PROMPT}

--- CBT KNOWLEDGE CONTEXT ---
{cbt_context}

--- USER BEHAVIOURAL SUMMARY ---
{behavioural_summary}

--- CONVERSATION HISTORY ---
{history_text}

--- USER MESSAGE ---
{message}

--- YOUR RESPONSE ---
"""
    return full_prompt


def safe_generate(model: str, contents: str, config=None, fallback="gemini-1.5-flash") -> any:
    try:
        return client.models.generate_content(model=model, contents=contents, config=config)
    except Exception as e:
        error_str = str(e)
        if "503" in error_str or "UNAVAILABLE" in error_str:
            print(f"[{model}] High demand spike. Retrying in 2 seconds...")
            time.sleep(2)
            try:
                return client.models.generate_content(model=model, contents=contents, config=config)
            except Exception:
                print(f"[{model}] Still failing. Falling back to {fallback}")
                return client.models.generate_content(model=fallback, contents=contents, config=config)
        else:
            raise e

def generate_reply(prompt: str, concerns: list[str]) -> dict:
    # Modern generate_content call using safe fallback
    response = safe_generate(
        model="gemini-2.5-flash-lite",
        contents=prompt
    )
    reply = response.text

    summary_prompt = f"""
Based on this therapy conversation excerpt, write a 4-5 sentence behavioural summary
of the user's current patterns, tendencies, and emotional state.
Also suggest 3-4 relevant tags from: anxiety, depression, stress, panic, sleep, 
anger, grief, self-esteem, relationships, meditation, mindfulness, happy, satisfied, optimistic.

Conversation context:
{prompt}
"""
    
    # Enforce strict JSON output using modern configuration
    try:
        summary_response = safe_generate(
            model="gemini-2.5-flash",
            contents=summary_prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        summary_data = json.loads(summary_response.text)
    except json.JSONDecodeError:
        # Fallback in case of unexpected structural failure
        summary_data = {
            "summaryText": "",
            "suggestedTags": concerns
        }

    return {
        "reply": reply,
        "updatedSummary": summary_data.get("summaryText", ""),
        "suggestedTags": summary_data.get("suggestedTags", concerns)
    }