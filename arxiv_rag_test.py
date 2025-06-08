import os
import requests
from langchain_openai import ChatOpenAI

# === 设置你的 API Key ===
openai_api_key = os.getenv("OPENAI_API_KEY")
llm = ChatOpenAI(api_key=openai_api_key, temperature=0)

# === 从 arXiv 获取文章 ===
def fetch_arxiv_articles(query, limit=5):
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

# === 生成 Prompt，包含个性化信息 ===
def generate_prompt(topic, articles, preferences):
    pref_text = (
        f"The learner is a {preferences['expertise_level']} interested in {preferences['learning_style']} content. "
        f"They have about {preferences['time_commitment']} to study. "
        f"Their preferred output format is {preferences['output_format']}.")

    prompt = pref_text + f"\n\nGenerate a 2-week study plan about '{topic}' using the following articles:\n\n"
    for idx, art in enumerate(articles):
        prompt += f"Article {idx+1}: {art['title']}\nAbstract: {art['summary']}\n\n"
    prompt += "Please organize the plan by day with bullet points and include quiz questions."
    return prompt

# === 主程序 ===
def main():
    topic = input("Enter your learning topic: ")
    print("\nPlease answer a few personalization questions:")
    expertise = input("What is your expertise level (beginner/intermediate/advanced)? ").strip()
    time_commitment = input("How many hours per week can you commit to study? ").strip()
    learning_style = input("Preferred learning style (visual/audio/text-based)? ").strip()
    output_format = input("Preferred output format (bullet points/summary/quiz)? ").strip()

    preferences = {
        "expertise_level": expertise,
        "time_commitment": time_commitment,
        "learning_style": learning_style,
        "output_format": output_format
    }

    articles = fetch_arxiv_articles(topic)
    if not articles:
        print("No articles found.")
        return

    prompt = generate_prompt(topic, articles, preferences)
    result = llm.invoke(prompt)
    print("\n✅ Generated Personalized Study Plan:\n")
    print(result.content)

if __name__ == "__main__":
    main()