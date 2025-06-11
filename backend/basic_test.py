import os
from dotenv import load_dotenv
load_dotenv()
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

# 替换为你自己的 OpenAI API key
api_key = os.getenv("OPENAI_API_KEY")
llm = ChatOpenAI(api_key=api_key, temperature=0)

template = """
You are a personalized learning assistant.

Generate a {weeks}-week study plan for the topic: {topic}, 
with a weekly study commitment of about {hours} hours.
The user prefers the learning format: {format}.

Please break the plan into weekly goals with sub-topics and activities.
"""

prompt = PromptTemplate.from_template(template)

# 用户输入
topic = input("What topic do you want to learn? ")
weeks = input("How many weeks do you want to study? (e.g., 2) ")
hours = input("How many hours per week can you commit? (e.g., 5) ")
format = input("Preferred learning format? (e.g., bullet points, quiz, summary) ")

# 调用模型
final_prompt = prompt.format(topic=topic, weeks=weeks, hours=hours, format=format)
response = llm.invoke(final_prompt)

# 输出结果
print("\n✅ Generated Study Plan:\n")
print(response.content) 