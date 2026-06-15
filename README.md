# 🧴 Beauty Analytics Platform

## 🚀 Live Demo

- 🌐 Frontend: https://your-vercel-link.vercel.app  
- ⚡ Backend API: https://ayuayuaayu-sephora-api.hf.space  
- 📦 Dataset: https://huggingface.co/datasets/ayuayuaayu/sephora-data

---

## 📸 Project Screenshots

> Create a folder called `/screenshots` in your repo and add images

### Search View
<img width="1920" height="1143" alt="image" src="https://github.com/user-attachments/assets/b0d23731-4866-4155-93e5-2a4560cb296e" />


### Product Analysis Dashboard 
<img width="1920" height="4521" alt="image" src="https://github.com/user-attachments/assets/682b591c-09cd-41b4-aa03-d44923e27ee4" />


---

## 🧠 Key Features

- 🔍 Semantic Product Search using Sentence Transformers  
- 📊 Sentiment Analysis on 3.7M+ reviews  
- 🧴 Ingredient Safety Analyzer (skin & hair type aware)  
- 🤖 AI-generated product insights using Groq API  
- 🏷️ Brand comparison & ranking system  
- ⚡ Optimized backend caching + precomputed embeddings  
- 📈 Analytics dashboard with real-time insights  

---

## 🏗️ System Architecture

Frontend (React + Vite + Vercel)  
↓  
FastAPI Backend (Hugging Face Spaces)  
↓  
Processed Dataset (3.7M reviews + 8K products)  
↓  
ML Layer (Sentence Transformers + VADER + Custom NLP)

---

## ⚙️ Tech Stack

Frontend:
- React.js
- Vite
- Axios
- Recharts

Backend:
- FastAPI
- Python
- Pandas, NumPy
- SentenceTransformers
- VADER Sentiment Analysis
- Groq API

Deployment:
- Vercel (Frontend)
- Hugging Face Spaces (Backend)
- Hugging Face Datasets (Storage)

---

## 📦 Installation (Run Locally)

### 1. Clone Repository
```bash
git clone https://github.com/your-username/sephora-sentiment.git
cd sephora-sentiment
