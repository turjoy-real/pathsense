from fastapi import FastAPI, Body
from pydantic import BaseModel
from typing import List, Dict, Optional
from db import init_db, get_connection
from dotenv import load_dotenv
import os
from openai import AsyncOpenAI
import openai
import asyncio
import json
from fastapi.responses import JSONResponse
import re
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# ------------------ Async OpenAI Client ------------------
client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

async def extract_entities_with_chatgpt(prompts, agent=""):
    try:
        messages = [
            {"role": "system", "content": "You are a helpful assistant that extracts structured data. " + agent},
            {"role": "user", "content": prompts}
        ]

        response = await client.beta.chat.completions.create(
            model="gpt-4o-2024-08-06",  
            messages=messages,
            temperature=0.7,
            max_tokens=4000
        )

        return response.choices[0].message.content

    except openai.APIConnectionError as e:
        return {"error": str(e)}

# ------------------ JSONIFY ------------------

def jsonify(response):
    match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
    if match:
        json_string = match.group(1)
        json_data = json.loads(json_string)
        return json_data
    return response

# ------------------ FastAPI App ------------------
app = FastAPI(title="PathSense – Career Clarity & Learning API")
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins like ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

init_db()

# ------------------ Models ------------------

class CurrentSkills(BaseModel):
    programming_languages: Dict[str, int] = {}
    frameworks: List[str] = []
    mathematics: Dict[str, int] = {}
    data_skills: List[str] = []

class Traits(BaseModel):
    problem_solving: int
    creative_thinking: int
    communication: int
    interest_area: str
    learning_style: str

class ExplorationPreferences(BaseModel):
    test_subskills: bool = False
    provide_links_for_assessment: bool = False
    suggest_alternative_roles: bool = False

class ExploreRequestV2(BaseModel):
    goal: str
    current_skills: CurrentSkills
    traits: Traits
    exploration_preferences: ExplorationPreferences

class Topic(BaseModel):
    title: str
    description: str
    completed: bool = False
    resources: Optional[List[str]] = []

class Module(BaseModel):
    title: str
    description: str
    duration: str
    completed: bool = False
    topics: List[Topic] = []

class SetCareerRequestV3(BaseModel):
    user: str
    goal: str
    chosen_role: str
    roadmap: List[Module]

class ConceptRequest(BaseModel):
    topic: str

class QuizRequest(BaseModel):
    topic: str
    level: str = "beginner"

# ------------------ Routes ------------------

@app.get("/")
def root():
    return {"message": "Welcome to PathSense API 🚀"}

# ------------------ Explore Career ------------------
@app.post("/explore-career")
async def explore_career(data: ExploreRequestV2):
    prompt = f"""
    The user wants to become: "{data.goal}"
    Current Skills: {data.current_skills}
    Traits: {data.traits}
    Exploration Preferences: {data.exploration_preferences}

    Generate 3 possible career paths.
    For each career path, include:
    - role (string)
    - overview (string)
    - fit_reason (why this role fits the user's background)
    - key_skills_to_learn (list of strings)
    - roadmap (ordered list of modules)
        - module_title
        - description
        - duration
        - topics (each with title, description, resources)
    - estimated_timeline (string)

    Respond ONLY in valid JSON. Do NOT include extra text, explanations, or markdown.
    """

    llm_response = await extract_entities_with_chatgpt(prompt, agent="")
    print(llm_response)
    return {"career_paths": jsonify(llm_response)}

# ------------------ Set Career ------------------
@app.post("/set-career")
async def set_career(data: SetCareerRequestV3):
    conn = get_connection()
    cur = conn.cursor()
    roadmap_json = json.dumps([module.dict() for module in data.roadmap])
    cur.execute(
        "INSERT INTO career_path (user, goal, chosen_role, roadmap) VALUES (?, ?, ?, ?)",
        (data.user, data.goal, data.chosen_role, roadmap_json)
    )
    conn.commit()
    conn.close()
    return {"message": f"Career path saved for {data.user}!"}

# ------------------ Concept Explanation ------------------
@app.post("/concepts")
async def get_concept(data: ConceptRequest):
    prompt = f"Explain the concept of '{data.topic}' in simple, structured language with examples and key points."
    result = await extract_entities_with_chatgpt(prompt, agent="")
    return {"concept_explanation": jsonify(result)}

# ------------------ Quiz ------------------
@app.post("/quiz")
async def get_quiz(data: QuizRequest):
    prompt = f"""
    Generate 5 multiple choice questions for the topic '{data.topic}' 
    suitable for {data.level} learners. Include options, correct answers, and explanations.
    Respond strictly in JSON.
    """
    result = await extract_entities_with_chatgpt(prompt, agent="")
    return {"quiz": jsonify(result)}