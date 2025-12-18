from services.chat_service import recommend_coffee_from_mood
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()
print(f"Current API Key in process: {os.getenv('GEMINI_API_KEY')[:10]}...")

async def test():
    print("Testing 'Çok mutluyum'...")
    try:
        result = await recommend_coffee_from_mood("Çok mutluyum")
        print(f"Result Category: {result.get('emotion_category')}")
    except Exception as e:
        print(f"Error: {e}")

    print("\nTesting 'Bugün çok sinirliyim'...")
    try:
        result = await recommend_coffee_from_mood("Bugün çok sinirliyim")
        print(f"Result Category: {result.get('emotion_category')}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\nTesting 'asdasdasd'...")
    try:
        result = await recommend_coffee_from_mood("asdasdasd")
        print(f"Result Category: {result.get('emotion_category')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
