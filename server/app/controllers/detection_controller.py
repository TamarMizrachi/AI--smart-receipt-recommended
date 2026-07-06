# import cv2
# import numpy as np
# from ultralytics import YOLO

# # טעינת מודל ה-Medium של YOLO-World
# model = YOLO("yolov8m-world.pt")

# # רשימה ממוקדת ונקייה (ללא כפילויות שיוצרות פיצול באחוזי הביטחון)
# model.set_classes([
#     "tomato", "cherry tomato", "cucumber", "red bell pepper", 
#     "yellow bell pepper", "green bell pepper", "carrot", "onion", 
#     "garlic", "potato", "sweet potato", "eggplant", "zucchini", 
#     "lettuce", "cabbage", "broccoli", "cauliflower", "avocado", 
#     "lemon", "apple", "banana", "orange", "strawberry", "grape",
#     "mushroom", "corn", "celery", "melon", "watermelon", "peach"
# ])

# def process_image_for_ingredients(image_bytes: bytes) -> dict:
#     try:
#         nparr = np.frombuffer(image_bytes, np.uint8)
#         image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
#         if image is None:
#             print("שגיאה: לא ניתן היה לפענח את התמונה שנתקבלה מהממשק")
#             return {"sure": [], "unsure": []}
            
#         # הרצת המודל עם סף רגישות התחלתי של 15%
#         results = model(image, conf=0.15)
        
#         sure_items = []
#         unsure_items = []

#         for result in results:
#             for box in result.boxes:
#                 class_id = int(box.cls[0])
#                 confidence = float(box.conf[0])
#                 label = model.names[class_id]
                
#                 # איחוד שמות קרובים למניעת כפילות באפליקציה
#                 clean_label = label
#                 if "tomato" in label:
#                     clean_label = "tomato"
#                 elif "bell pepper" in label:
#                     clean_label = "bell pepper"

#                 # חלוקה מחודשת ומדויקת יותר: 30% ומעלה נחשב לזיהוי ודאי!
#                 if confidence >= 0.30:
#                     if clean_label not in sure_items:
#                         sure_items.append(clean_label)
#                 else:
#                     if clean_label not in sure_items and clean_label not in unsure_items:
#                         unsure_items.append(clean_label)
                    
#         print(f"🥦 זיהויים בטוחים (מעל 30%): {sure_items}")
#         print(f"🟡 זיהויים בספק (15%-30%): {unsure_items}")
        
#         return {
#             "sure": sure_items,
#             "unsure": unsure_items
#         }

#     except Exception as e:
#         print(f"תקלה בזמן ריצת מודל ה-YOLO: {e}")
#         return {"sure": [], "unsure": []}

import cv2
import numpy as np
from ultralytics import YOLO

# טעינת מודל ה-Medium של YOLO-World
model = YOLO("yolov8m-world.pt")

# רשימה מפורטת וממוקדת לזיהוי מדויק של פירות וירקות
# model.set_classes([
#     "tomato", "cherry tomato", 
#     "cucumber", "green cucumber", "persian cucumber", "mini cucumber", "sliced cucumber",
#     "red bell pepper", "yellow bell pepper", "green bell pepper", 
#     "carrot", "onion", "garlic", "potato", "sweet potato", "eggplant", "zucchini", 
#     "lettuce", "cabbage", "broccoli", "cauliflower", "avocado", 
#     "lemon", "apple", "banana", "orange", "strawberry", "grape",
#     "mushroom", "corn", "celery", "melon", "watermelon", "peach"
# ])



model.set_classes([
    # ירקות בסיס למקרר וסלטים
    "tomato", "cherry tomato", "cucumber", "persian cucumber",
    "red bell pepper", "yellow bell pepper", "green bell pepper",
    "carrot", "onion", "red onion", "garlic",
    
    # ירקות בישול ותבשילים
    "potato", "sweet potato", "eggplant", "zucchini",
    "cabbage", "cauliflower", "broccoli", "mushroom",
    "corn", "celery", "pumpkin", "beetroot",
    
    # עלים ועשבי תיבול
    "lettuce", "parsley", "cilantro", "dill", "spinach",
    
    # פירות נפוצים (כולל פירות הדר של ישראל)
    "apple", "banana", "orange", "clementine", "lemon",
    "strawberry", "grape", "peach", "nectarine", "plum",
    "melon", "watermelon", "avocado", "pear"
])
def process_image_for_ingredients(image_bytes: bytes) -> dict:
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            print("שגיאה: לא ניתן היה לפענח את התמונה שנתקבלה מהממשק")
            return {"sure": [], "unsure": []}
            
        # סף מינימום מקצועי ונקי של 20% לסינון מוחלט של רעשים והזיות
        results = model(image, conf=0.15)
        
        sure_items = []
        unsure_items = []

        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                label = model.names[class_id]
                
                # נרמול ואיחוד שמות נרדפים לשם מוצר נקי באפליקציה
                clean_label = label
                if "tomato" in label:
                    clean_label = "tomato"
                elif "bell pepper" in label:
                    clean_label = "bell pepper"
                elif "cucumber" in label:
                    clean_label = "cucumber"

                # חלוקה מדויקת: מעל 28% ודאי (ירוק), בין 20% ל-28% בספק (צהוב)
                if confidence >= 0.28:
                    if clean_label not in sure_items:
                        sure_items.append(clean_label)
                else:
                    if clean_label not in sure_items and clean_label not in unsure_items:
                        unsure_items.append(clean_label)
                    
        print(f"🥦 זיהויים בטוחים (מעל 28%): {sure_items}")
        print(f"🟡 זיהויים בספק (20%-28%): {unsure_items}")
        
        return {
            "sure": sure_items,
            "unsure": unsure_items
        }

    except Exception as e:
        print(f"תקלה בזמן ריצת מודל ה-YOLO: {e}")
        return {"sure": [], "unsure": []}