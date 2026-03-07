import os
print(">>> LOADED:", os.path.abspath(__file__))
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from plan_logic import fetch_arxiv_articles, generate_prompt, run_llm
import re, json
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserRequest(BaseModel):
    topic: str
    preferences: dict
  
class SaveRequest(BaseModel):
    userId: str
    plan: dict

@app.post("/api/plan/save")
async def save_plan(data: SaveRequest):
    plan_id = str(uuid.uuid4())
    saved_plans[plan_id] = {
        "user_id": data.userId,
        "content": data.plan,
        "created_at": datetime.now()
    }

    return {"message": "Plan saved successfully", "planId": plan_id}
    prompt = generate_prompt(data.topic, articles, data.preferences)

    # Append prompt instruction for output format
    full_prompt = prompt + """
Please return a 2-week study plan with 7 days each week in **JSON** format like this:
{
  "study_plan": [
    {
      "week": "Week 1",
      "days": [
        {
          "day": "Day 1",
          "topic": "Intro to topic",
          "activity": "Watch a video/read",
          "resources": "URL or article name"
        }
      ]
    }
  ]
}
Return only valid JSON, no explanation.
"""

    result = run_llm(full_prompt)

    try:
        match = re.search(r'\{[\s\S]*\}', result.content)
        parsed = json.loads(match.group(0))
        return parsed if "study_plan" in parsed else {"study_plan": parsed}
    except Exception as e:
        return {"error": str(e), "raw_output": result.content}

@app.get("/api/debug")
def debug_route():
    return {"status": "Backend running and generate-plan endpoint is live."}


saved_plans = {}    
@app.post("/api/plan/save")
async def save_plan(request: Request):
    payload = await request.json()
    user_id = payload.get("userId")
    plan = payload.get("plan")

    if not user_id or not plan:
        return {"error": "Missing userId or plan."}

    plan_id = str(uuid.uuid4())
    saved_plans[plan_id] = {
        "user_id": user_id,
        "content": plan,
        "created_at": datetime.now()
    }

    return {"message": "Plan saved successfully", "planId": plan_id}