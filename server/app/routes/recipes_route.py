
from fastapi import APIRouter
from app.controllers.recipes_controller import get_recommended_recipes
from app.database import fetch_recipe_details

router = APIRouter()

@router.post("/recommend")
async def recommend_recipes(ingredients: list[str]):
    # קריאה ל-Controller
    result = get_recommended_recipes(ingredients)
    return result

@router.get("/{recipe_id}/details")
async def get_recipe_details(recipe_id: int):
    # שליפת פרטי מתכון בודד
    details = fetch_recipe_details(recipe_id)
    if details:
        return {"success": True, "recipe": details}
    return {"success": False, "message": "Recipe not found"}