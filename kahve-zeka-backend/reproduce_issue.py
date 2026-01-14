
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
print(f"API Key found: {bool(API_KEY)}")

genai.configure(api_key=API_KEY)

model_name = 'gemini-2.5-flash' # Testing the suspicious model name
print(f"Testing model: {model_name}")

try:
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Hello, say hi in JSON format like {\"message\": \"hi\"}")
    print(f"Response text: '{response.text}'")
except Exception as e:
    print(f"Error occurred: {e}")
