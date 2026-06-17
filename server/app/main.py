from fastapi import FastAPI, File, UploadFile
import cv2
import numpy as np
from ultralytics import YOLO

app = FastAPI()

# 1. טעינת המודל החכם של YOLO-World
# בגלל שזה מודל רשמי, הוא יירד אוטומטית בפעם הראשונה שתריצו את השרת
model = YOLO("yolov8s-world.pt")

# 2. מגדירים למודל אילו מצרכים לחפש! 
# אתן יכולות להוסיף לכאן כל מצרך שתרצו באנגלית
model.set_classes([
    "milk", "egg", "cheese", "butter", 
    "tomato", "cucumber", "chicken", 
    "ketchup", "onion", "garlic", "yogurt"
])

@app.get("/")
def read_root():
    return {"status": "השרת שלכן באוויר!", "project": "Smart Recipe Recommender"}

@app.post("/detect")
async def detect_ingredients(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # 3. הרצת המודל על התמונה
    results = model(image)
    
    detected_items = []
    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            # המודל יחזיר רק את המילים שהגדרנו לו מראש ברשימה!
            label = model.names[class_id] 
            
            if label not in detected_items:
                detected_items.append(label)
                
    return {
        "status": "success",
        "detected_ingredients": detected_items
    }


    

