import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

with open("models.log", "w", encoding="utf-8") as f:
    if not API_KEY:
        f.write("API_KEY not found\n")
    else:
        genai.configure(api_key=API_KEY)
        try:
            f.write("--- START MODEL LIST ---\n")
            for m in genai.list_models():
                f.write(f"Name: {m.name}\n")
                f.write(f"Methods: {m.supported_generation_methods}\n")
                f.write("-" * 20 + "\n")
            f.write("--- END MODEL LIST ---\n")
        except Exception as e:
            f.write(f"Error: {e}\n")
