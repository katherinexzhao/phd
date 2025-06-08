from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from arxiv_rag_test import fetch_arxiv_articles, generate_prompt
from langchain_openai import ChatOpenAI
import os

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
    llm = ChatOpenAI(api_key=os.getenv("OPENAI_API_KEY"), temperature=0)
    result = llm.invoke(prompt)
    return {"study_plan": result.content}
