
# app/routes/recipes_route.py
from fastapi import APIRouter
from typing import List  # בשביל הפרוטוקול, מייבאים List עם L גדולה מ-typingfrom app.controllers.recipes_controller import get_recommended_recipes

router = APIRouter()

@router.post("/recommend")
async def recommend_recipes(ingredients: List[str]):
    # קריאה ל-Controller שיבצע את הפנייה למאגר ויחשב את הנתונים
    result = get_recommended_recipes(ingredients)
    return result