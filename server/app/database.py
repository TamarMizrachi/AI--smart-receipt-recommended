# server/app/database.py
import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# ---- חלק 1: החיבור שלכן למסד הנתונים המקומי (MySQL) ----
SQL_DATABASE_URL = "mysql+pymysql://root:123456@localhost:3306/smart_recipe_db"

engine = create_engine(SQL_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """פונקציה המאפשרת לשרת לפתוח ולסגור חיבור ל-MySQL עבור כל בקשה"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---- חלק 2: שליפת מתכונים ממאגר הנתונים העולמי (Spoonacular API) ----
SPOONACULAR_API_KEY = "4d9eb1cd446c4bbe83efa9f628f58190" 
SPOONACULAR_URL = "https://api.spoonacular.com/recipes/findByIngredients"

def fetch_recipes_from_api(ingredients_list: list):
    """
    פונקציה הפונה למאגר המתכונים העולמי ושולפת מתכונים רלוונטיים
    לפי רשימת המצרכים שזיהה מודל ה-YOLO
    """
    # הפיכת רשימת המצרכים למחרוזת פסיקים עבור ה-API (למשל: tomato,milk,eggs)
    ingredients_query = ",".join(ingredients_list)
    
    headers = {
        "Content-Type": "application/json"
    }
    
    params = {
        "ingredients": ingredients_query,
        "number": 10,       # כמות המתכונים שיוחזרו
        "ranking": 1,        # מיון לפי מקסימום מצרכים קיימים בבית
        "apiKey": SPOONACULAR_API_KEY
    }
    
    try:
        response = requests.get(SPOONACULAR_URL, params=params, headers=headers)
        if response.status_code == 200:
            return response.json()  # מחזיר את הנתונים בפורמט JSON מסודר ל-Controller
        else:
            print(f"Error fetching from API: {response.status_code}")
            return []
    except Exception as e:
        print(f"API Connection Error: {e}")
        return []