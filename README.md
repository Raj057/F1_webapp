# 🏎️ Formula 1 Web Application  

A Formula 1-themed web application built with **FastAPI** (backend) and **React + TypeScript + Tailwind CSS** (frontend), powered by the **FastF1 API** for live and historical race data.  
The app allows users to view race results, qualifying results, and pit stop summaries with formatted timing data for better readability.  

---

## 📌 Features  
- **Race Results Viewer** – Select a year & Grand Prix, then fetch detailed race results.  
- **Qualifying Results Viewer** – See session breakdowns (Q1, Q2, Q3) with timings.  
- **Pit Stop Data** – View lap numbers and pit stop durations.  
- **Driver Names & Abbreviations** – Full driver names are fetched directly from FastF1, no manual mapping needed.  
- **"Show Results" Button** – Fetch results only when ready, preventing unnecessary API calls.  
- **Frontend Time Formatting** – Removes leading zero hours (`00:`) from lap times for clarity.  

---

## 🛠️ Tech Stack  

**Frontend:**  
- React (TypeScript)  
- Tailwind CSS  
- React Router  

**Backend:**  
- FastAPI  
- FastF1  
- Pandas  

---

## ⚡ Installation  

### 1. Clone the Repository  
```bash
git clone https://github.com/<your-username>/f1-web-app.git
cd f1-web-app
