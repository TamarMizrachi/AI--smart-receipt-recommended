# app/controllers/recipes_controller.py
from app.database import fetch_recipes_from_api

def get_recommended_recipes(detected_ingredients: list):
    """
    המוח של המערכת: מקבל מצרכים מה-YOLO, פונה למאגר, 
    ומחשב את ציון ההתאמה הסופי עבור ה-React
    """
    if not detected_ingredients:
        return {"success": False, "message": "No ingredients detected", "recipes": []}
        
    # 1. שליפת המתכונים מהמאגר הענק בזמן אמת
    raw_recipes = fetch_recipes_from_api(detected_ingredients)
    
    recommended_recipes = []
    
    # 2. ריצה על המתכונים שחזרו וחישוב ה-Match Score
    for recipe in raw_recipes:
        used_count = recipe.get("usedIngredientCount", 0)
        missed_count = recipe.get("missedIngredientCount", 0)
        total_ingredients = used_count + missed_count
        
        # חישוב אחוז ההתאמה באופן אלגוריתמי
        match_score = 0
        if total_ingredients > 0:
            match_score = int((used_count / total_ingredients) * 100)
            
        # בניית אובייקט המתכון הסופי שיוצג בכרטיסיות ב-React
        recipe_data = {
            "id": recipe.get("id"),
            "title": recipe.get("title"),
            "image": recipe.get("image"),
            "match_score": match_score,
            "used_ingredients": [ing.get("name") for ing in recipe.get("usedIngredients", [])],
            "missed_ingredients": [ing.get("name") for ing in recipe.get("missedIngredients", [])]
        }
        recommended_recipes.append(recipe_data)
        
    # מיון המתכונים מההתאמה הגבוהה ביותר לנמוכה ביותר
    recommended_recipes.sort(key=lambda x: x["match_score"], reverse=True)
    
    return {
        "success": True,
        "detected_count": len(detected_ingredients),
        "recipes": recommended_recipes
    }