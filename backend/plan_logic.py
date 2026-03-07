import os
from dotenv import load_dotenv
load_dotenv()
import requests
from langchain_openai import ChatOpenAI

openai_api_key = os.getenv("OPENAI_API_KEY")
llm = ChatOpenAI(api_key=openai_api_key, temperature=0)

def fetch_arxiv_articles(query, limit=10):
    url = f"http://export.arxiv.org/api/query?search_query=all:{query}&start=0&max_results={limit}"
    response = requests.get(url)
    if response.status_code != 200:
        print("Error:", response.status_code)
        return []
    import xml.etree.ElementTree as ET
    root = ET.fromstring(response.content)
    articles = []
    for entry in root.findall("{http://www.w3.org/2005/Atom}entry"):
        title = entry.find("{http://www.w3.org/2005/Atom}title").text.strip()
        summary = entry.find("{http://www.w3.org/2005/Atom}summary").text.strip()
        link = entry.find("{http://www.w3.org/2005/Atom}id").text.strip()
        articles.append({"title": title, "summary": summary, "link": link})
    return articles

def generate_prompt(topic, articles, preferences):
    expertise = preferences.get('expertise_level', 'beginner')
    learning_style = preferences.get('learning_style', 'general')
    time_commitment = preferences.get('time_commitment', '1 hour per day')
    output_format = preferences.get('output_format', 'text')

    pref_text = (
        f"The learner is a {expertise} interested in {learning_style} content. "
        f"They have about {time_commitment} to study. "
        f"Their preferred output format is {output_format}."
    )
 
    prompt = (
        f"{pref_text}\n\n"
        f"You are an expert tutor. You have access to the following 10 arXiv articles about '{topic}'. "
        f"Please read and understand all the articles below, and then, based on your understanding, "
        f"generate a detailed, step-by-step 2-week study plan for the learner. "
        f"**Do NOT just recommend articles for the learner to read.** Instead, for each day, "
        f"write the lesson content in bullet points. Each bullet point should include a key concept followed by a short explanation. Avoid large paragraphs. content suitable for a {expertise} learner and their preferred time commitment ({time_commitment}), "
        f"and matching their learning style ({learning_style}).\n\n"
        f"For each day, include:\n"
        f"- The day's topic\n"
        f"- A detailed explanation or lesson (not just a reading assignment)\n"
        f"- Add 2–3 short quiz or reflection questions and answers (Q&A) at the end of each day’s lesson.\n\n"
        f"Here are the articles you should learn from:\n"
    )

    for idx, art in enumerate(articles):
        prompt += (
            f"Article {idx+1}: {art['title']}\n"
            f"Abstract: {art['summary']}\n"
            f"URL: {art['link']}\n\n"
        )

    prompt += (
    "Now, generate a 2-week study plan as a JSON object with the following strict format:\n"
    "{\n"
    '  "study_plan": [\n'
    '    {\n'
    '      "week": "Week 1",\n'
    '      "days": [\n'
    '        {\n'
    '          "day": "Day 1",\n'
    '          "topic": "Topic for the day",\n'
    '          "keywords": ["keyword1", "keyword2", "keyword3"],\n'
    '          "lesson": [\n'
    '            "Key Concept: Concept 1. Explanation: Brief explanation of Concept 1.",\n'
    '            "Key Concept: Concept 2. Explanation: Brief explanation of Concept 2."\n'
    '          ],\n'
    '          "quiz": ["Question 1", "Question 2"],\n'
    '          "resources": [\n'
    '            {\n'
    '              "title": "Resource Title 1",\n'
    '              "url": "https://example.com/resource1"\n'
    '            },\n'
    '            {\n'
    '              "title": "Resource Title 2",\n'
    '              "url": "https://example.com/resource2"\n'
    '            }\n'
    '          ]\n'
    '        },\n'
    '        // repeat Day 2 to Day 5\n'
    '      ]\n'
    '    },\n'
    '    {\n'
    '      "week": "Week 2",\n'
    '      "days": [\n'
    '        {\n'
    '          "day": "Day 6",\n'
    '          "topic": "Topic for the day",\n'
    '          "keywords": ["keyword1", "keyword2"],\n'
    '          "lesson": [\n'
    '            "Concept: Concept. Explanation: Explanation here.",\n'
    '            "Concept: Another Concept. Explanation: Explanation here."\n'
    '          ],\n'
    '          "quiz": ["Question 1", "Question 2"],\n'
    '          "resources": [\n'
    '            {\n'
    '              "title": "Resource Title",\n'
    '              "url": "https://example.com/resource"\n'
    '            }\n'
    '          ]\n'
    '        }\n'
    '        // repeat Day 7 to Day 10\n'
    '      ]\n'
    '    }\n'
    '  ]\n'
    '}\n\n'
    " Requirements:\n"
    "- Include 2 full weeks, 5 days per week (10 days total).\n"
    "- Each day MUST include: `topic`, `keywords` (3–5 items), `lesson` (2+ items, each in 'Concept: … Explanation: …' format), `quiz` (2 Qs), `resources` (1–2).\n"
    "- The JSON MUST be valid and complete.\n"
    "- DO NOT include explanations, notes, or markdown outside the JSON."
    )
    return prompt

def run_llm(prompt):
    result = llm.invoke(prompt)
    return result
