from app.database import fetch_recipes_from_api

PANTRY_KEYWORDS = {
    # תבלינים ומלח
    "salt", "black pepper", "paprika", "turmeric", "cumin", 
    "cinnamon", "garlic powder", "onion powder", "oregano", "thyme", 
    "chili flakes", "chili powder", "cinnamon",
    
    # נוזלים, שמנים ורטבים
    "oil", "olive oil", "vegetable oil", "vinegar", "balsamic", 
    "soy sauce", "honey", "syrup", "maple syrup", "teriyaki",
    
    # בסיס יבש ואפייה
    "sugar", "brown sugar", "flour", "water", "yeast", 
    "baking powder", "baking soda", "cornstarch"
}

def is_pantry_item(ingredient_name):
    """
    בודק אם שם המצרך מכיל מילת מפתח של מזווה.
    משתמש ב-lower() כדי להתעלם מהבדלי רישיות (אותיות גדולות/קטנות).
    """
    name_lower = ingredient_name.lower()
    for keyword in PANTRY_KEYWORDS:
        if keyword in name_lower:
            return True
    return False

def get_recommended_recipes(detected_ingredients: list):
    if not detected_ingredients:
        return {"success": False, "message": "No ingredients detected", "recipes": []}
        
    raw_recipes = fetch_recipes_from_api(detected_ingredients)
    recommended_recipes = []
    
    for recipe in raw_recipes:
        used_ingredients = recipe.get("usedIngredients", [])
        missed_ingredients = recipe.get("missedIngredients", [])
        
        # סינון חכם: מסננים את מה שעונה לקריטריונים של מצרכי מזווה
        filtered_missed = [
            ing for ing in missed_ingredients 
            if not is_pantry_item(ing.get("name", ""))
        ]
        
        used_count = len(used_ingredients)
        missed_count = len(filtered_missed)
        total_relevant = used_count + missed_count
        
        # חישוב התאמה רק על בסיס מצרכים משמעותיים
        match_score = int((used_count / total_relevant) * 100) if total_relevant > 0 else 100
            
        recipe_data = {
            "id": recipe.get("id"),
            "title": recipe.get("title"),
            "image": recipe.get("image"),
            "match_score": match_score,
            "used_ingredients": [ing.get("name") for ing in used_ingredients],
            "missed_ingredients": [ing.get("name") for ing in filtered_missed]
        }
        recommended_recipes.append(recipe_data)
        
    recommended_recipes.sort(key=lambda x: x["match_score"], reverse=True)
    
    return {"success": True, "detected_count": len(detected_ingredients), "recipes": recommended_recipes}