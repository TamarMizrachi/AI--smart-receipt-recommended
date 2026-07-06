from fastapi import APIRouter, File, UploadFile
from app.controllers.detection_controller import process_image_for_ingredients

router = APIRouter()

@router.post("/detect")
async def detect_ingredients(file: UploadFile = File(...)):
    print("\n" + "="*40)
    print(f"📸 קיבלתי תמונה של פירות/ירקות מהממשק!")
    print(f"שם הקובץ: {file.filename}")
    print(f"סוג הקובץ: {file.content_type}")
    
    # קריאת תוכן התמונה
    contents = await file.read()
    print(f"גודל הקובץ בבייטים: {len(contents)} bytes")
    print("="*40 + "\n")
    
    # הפעלת מנוע ה-AI
    detection_result = process_image_for_ingredients(contents)
    
    return {
        "status": "success",
        "sure": detection_result["sure"],
        "unsure": detection_result["unsure"],
        "detected_ingredients": detection_result["sure"]  # תמיכה לאחור למניעת שגיאות
    }