
import sys
import os

# Add the current directory to sys.path so we can import from the backend module
sys.path.append(os.getcwd())

try:
    print("Attempting to import main...")
    from main import app, get_db, engine
    print("Successfully imported main.")

    print("Attempting to create database session...")
    db_gen = get_db()
    db = next(db_gen)
    print("Successfully created database session.")
    db.close()
    
    print("Backend check passed!")

except ImportError as e:
    print(f"ImportError: {e}")
    sys.exit(1)
except Exception as e:
    print(f"An error occurred: {e}")
    sys.exit(1)
