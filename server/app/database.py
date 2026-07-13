# server/app/database.py
import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

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
# הירשמו בחינם ל-Spoonacular ושימו כאן את ה-API Key שתקבלו
SPOONACULAR_API_KEY = "c818a38a03b9461f90f6dadfde5f3479" 
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











    #חדדדששששששששש
    # נתיב ה-API לשליפת פרטי מתכון בודד
SPOONACULAR_INFO_URL = "https://api.spoonacular.com/recipes/{id}/information"

def fetch_recipe_details(recipe_id: int):
    """שליפת פרטי מתכון מלאים לפי ID"""
    url = SPOONACULAR_INFO_URL.format(id=recipe_id)
    params = {"apiKey": SPOONACULAR_API_KEY}
    
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            return response.json()
        return None
    except Exception as e:
        print(f"Error fetching recipe details: {e}")
        return None