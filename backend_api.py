from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from arxiv_rag_test import fetch_arxiv_articles, generate_prompt
from langchain_openai import ChatOpenAI
import os
import re
import json

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserRequest(BaseModel):
    topic: str
    expertise_level: str
    time_commitment: str
    learning_style: str
    output_format: str

@app.post("/generate-plan/")
def generate_study_plan(data: UserRequest):
    preferences = {
        "expertise_level": data.expertise_level,
        "time_commitment": data.time_commitment,
        "learning_style": data.learning_style,
        "output_format": data.output_format
    }

    articles = fetch_arxiv_articles(data.topic)
    if not articles:
        return {"message": "No articles found."}

    prompt = generate_prompt(data.topic, articles, preferences)
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
        },
        ...
      ]
    },
    {
      "week": "Week 2",
      "days": [
        ...
      ]
    }
  ]
}

⚠️ Return ONLY valid JSON, no explanation or extra text.
"""

    llm = ChatOpenAI(api_key=os.getenv("OPENAI_API_KEY"), temperature=0)
    result = llm.invoke(full_prompt)

    print("\n=== Prompt Sent ===\n", full_prompt)
    print("\n=== LLM Raw Output ===\n", result.content)

    try:
        match = re.search(r'\{[\s\S]*\}', result.content)
        if not match:
            raise ValueError("No valid JSON found in LLM output.")
        parsed = json.loads(match.group(0))

        # Ensure the output is nested under "study_plan"
        if "study_plan" in parsed:
            response = parsed
        else:
            response = { "study_plan": parsed }

        print("✅ Final JSON to return:\n", json.dumps(response, indent=2))
        return response

    except Exception as e:
        print("❌ Error parsing JSON:", str(e))
        return {
            "error": str(e),
            "raw_output": result.content
        }