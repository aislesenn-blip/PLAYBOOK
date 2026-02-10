import os
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import pyautogui  # Hii ndiyo inashika Mouse/Keyboard
import requests   # Kuwasiliana na Cloud Brain (Hugging Face)

app = FastAPI()

# Mount static files (PWA icons, CSS)
app.mount("/static", StaticFiles(directory="static"), name="static")

# LINK YA CLOUD BRAIN YAKO (Ibadilishe hii ikiwa deployed)
CLOUD_BRAIN_URL = "https://huggingface.co/spaces/ERNEST/PLAYBOOK-OS/api/interact"

class Command(BaseModel):
    command: str

@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("templates/index.html", "r") as f:
        return f.read()

@app.post("/execute")
async def execute_task(cmd: Command):
    print(f"⚡ USER COMMAND: {cmd.command}")
    
    # 1. Tuma kwa Cloud Brain (Reasoning)
    # response = requests.post(CLOUD_BRAIN_URL, json={"user_input": cmd.command})
    # logic = response.json()
    
    # 2. Local Execution (Mfano: Screenshot, Mouse Click)
    # Hapa ndipo tutaweka logic ya "Hands"
    # if logic['action'] == 'screenshot':
    #     pyautogui.screenshot('screen.png')
    
    return {"status": "Execution Started"}

if __name__ == "__main__":
    # Inafungua interface kama App
    print("🟢 PLAYBOOK ENGINE STARTED. Open http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
