# 🚀 Goal Planner App

An AI-powered **career and goal planning app** built with **FastAPI** (backend) and **Next.js** (frontend).  
It helps users explore personalized career paths, learning roadmaps, and skill-building modules — all generated dynamically via OpenAI.

---

## 🧱 Tech Stack

| Layer         | Framework / Tool                   | Description                                                          |
| ------------- | ---------------------------------- | -------------------------------------------------------------------- |
| Frontend      | **Next.js (React + Tailwind CSS)** | UI for goal exploration and progress tracking                        |
| Backend       | **FastAPI (Python)**               | API server for AI career exploration, module storage, and user input |
| AI Engine     | **OpenAI GPT-4o**                  | Generates career paths, module details, and reasons for fit          |
| Database      | SQLite / PostgreSQL (optional)     | To persist users, goals, and modules                                 |
| Communication | REST (JSON)                        | Clean separation between frontend and backend                        |

---

## 🖥️ Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/goal-planner.git
cd goal-planner
```

### Setup Backend (FastAPI)

cd backend
python -m venv venv
source venv/bin/activate # macOS/Linux
venv\Scripts\activate # Windows

pip install -r requirements.txt

OPENAI_API_KEY=your_openai_key_here

uvicorn main:app --reload

### Setup Frontend (Next.js)

cd ../frontend
npm install

npm run dev

### Postman

https://www.postman.com/ofc111/workspace/turjoy-public/request/26495871-a17637f5-bda4-4f48-8fdf-f7da7d075b37?action=share&creator=26495871&ctx=documentation
