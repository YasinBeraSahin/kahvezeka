
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

print(f"Key: {API_KEY[:5]}...")

try:
    print("Sending request...")
    response = model.generate_content("Hello")
    print("Response received!")
    print(response.text)
except Exception as e:
    print("ERROR OCCURRED:")
    print(e)
