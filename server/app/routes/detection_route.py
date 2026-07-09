

from fastapi import APIRouter, File, UploadFile
from app.controllers.detection_controller import process_image_for_ingredients

router = APIRouter()

@router.post("/detect")
async def detect_ingredients(file: UploadFile = File(...)):
    # --- שורות בדיקה חדשות ---
    print("\n" + "="*40)
    print(f"📸 קיבלתי קובץ מהממשק!")
    print(f"שם הקובץ: {file.filename}")
    print(f"סוג הקובץ: {file.content_type}")
    
    # קריאת התוכן
    contents = await file.read()
    print(f"גודל הקובץ בבייטים: {len(contents)} bytes")
    print("="*40 + "\n")
    # --------------------------
    
    # מעבירים לקונטרולר שיפעיל את ה-AI
    detected_items = process_image_for_ingredients(contents)
    
    return {
        "status": "success",
        "detected_ingredients": detected_items
    }