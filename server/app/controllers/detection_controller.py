import cv2
import numpy as np
from ultralytics import YOLO

# טעינת המודל המקורי והחכם שלך - נטען פעם אחת כשהשרת עולה
model = YOLO("yolov8s-world.pt")

model.set_classes([
    # מוצרי חלב, גבינות, ביצים ותחליפים
    "milk", "milk carton", "milk bottle", "egg", "egg carton", "butter", "butter block", 
    "margarine", "yogurt", "yogurt cup", "cottage cheese", "cream cheese", "yellow cheese", 
    "cheese slice", "mozzarella cheese", "parmesan cheese", "cheddar cheese", "feta cheese", 
    "goat cheese", "sour cream", "sweet cream", "whipping cream", "tofu", "tofu block", "soy milk", "almond milk",
    
    # ירקות טריים, קפואים ומשומרים למתכונים
    "tomato", "cucumber", "onion", "red onion", "garlic", "garlic clove", "potato", "sweet potato", 
    "carrot", "bell pepper", "red pepper", "green pepper", "yellow pepper", "chili pepper", 
    "lettuce", "cabbage", "purple cabbage", "spinach", "broccoli", "cauliflower", "zucchini", 
    "eggplant", "mushroom", "corn", "corn can", "pea", "green beans", "pumpkin", "butternut squash",
    "celery", "radish", "avocado", "artichoke", "leek", "asparagus",
    
    # עשבי תיבול וירקות עלים (בסיס למתכונים)
    "parsley", "coriander", "cilantro", "mint", "basil", "dill", "thyme", "rosemary", "scallion", "green onion",
    
    # פירות טריים ומשומרים
    "lemon", "lime", "apple", "green apple", "red apple", "banana", "orange", "mandarin", 
    "grape", "strawberry", "blueberry", "raspberry", "blackberry", "cherry", "peach", "plum", 
    "apricot", "nectarine", "pear", "mango", "pineapple", "pineapple can", "kiwi", "melon", 
    "watermelon", "fig", "dates", "pomegranate",
    
    # בשר, עוף, דגים ופירות ים
    "chicken", "chicken breast", "chicken wing", "chicken thigh", "whole chicken", 
    "meat", "beef", "minced meat", "ground beef", "steak", "beef rib", "lamb", 
    "mutton", "pork", "bacon", "ham", "sausage", "hot dog", "salami", "turkey", 
    "fish", "salmon", "salmon fillet", "tuna", "tuna can", "sardines", "shrimp", "crab",
    
    # רטבים, ממרחים, שמנים ותבלינים נוזליים (חובה לכל מתכון)
    "ketchup", "ketchup bottle", "mayonnaise", "mayonnaise jar", "mustard", "mustard bottle", 
    "pesto", "pesto jar", "tomato sauce", "tomato paste", "bbq sauce", "chili sauce", "hot sauce", 
    "soy sauce", "teriyaki sauce", "olive oil", "olive oil bottle", "canola oil", "vegetable oil", 
    "sesame oil", "vinegar", "balsamic vinegar", "lemon juice", "honey", "honey jar", "maple syrup", 
    "hummus", "tahini", "chocolate paste", "peanut butter", "jam", "jam jar",
    
    # מאפים, פחמימות, מוצרי בצק ודגנים
    "bread", "white bread", "whole wheat bread", "sliced bread", "baguette", "pita", "pita bread", 
    "bun", "tortilla", "croissant", "cake", "cookie", "biscuit", "dough", "puff pastry", 
    "pizza dough", "pasta", "spaghetti", "noodles", "rice", "flour", "sugar", "oats", "oatmeal",
    
    # משקאות ונוזלים מוגדרים (לא בקבוק ריק, אלא התוכן שלו)
    "juice", "orange juice", "apple juice", "grape juice", "lemonade", "soda", "coke", "cola", 
    "beer", "beer bottle", "beer can", "wine", "wine bottle", "white wine", "red wine", "iced coffee", "water bottle"
])

def process_image_for_ingredients(image_bytes: bytes) -> list:
    """
    פונקציה זו מקבלת תמונה כבייטים, מעבירה אותה דרך מודל ה-YOLO המקורי
    ומחזירה רשימה של מצרכים שזוהו.
    """
    try:
        # המרה לפורמט ש-OpenCV מבין
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            print("שגיאה: לא ניתן היה לפענח את התמונה שנתקבלה מהממשק")
            return []
            
        # הרצת המודל החכם שלך על התמונה
        results = model(image)
        
        detected_items = []
        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0])
                label = model.names[class_id] 
                
                if label not in detected_items:
                    detected_items.append(label)
                    
        print(f"המצרכים שזוהו בהצלחה באלגוריתם: {detected_items}")
        return detected_items

    except Exception as e:
        print(f"תקלה בזמן ריצת מודל ה-YOLO המקורי: {e}")
        return []