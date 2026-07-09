import os
from ultralytics import YOLO

def main():
    print("🚀 מתחילים את אימון המודל על התמונות שלנו...")

    # 1. טעינת מודל בסיס קליל שמתאים להרצה על מחשב אישי
    model = YOLO('yolov8n.pt')

    # 2. הגדרת הנתיב המדויק לקובץ ההגדרות של הדאטה-סט
    data_yaml_path = os.path.join(os.getcwd(), "dataset", "data.yaml")

    # 3. התחלת אימון המודל
    results = model.train(
        data=data_yaml_path,
        epochs=15,             # 15 מחזורי למידה מספיקים כדי להגיע לדיוק מעולה
        imgsz=640,             # הגודל הסטנדרטי לתמונות ב-YOLO
        batch=8,               # כמות תמונות שמצולם ולומד במקביל (8 מותאם למחשב רגיל)
        name='fridge_veggies'  # שם התיקייה שבה יישמרו התוצאות
    )

    print("🎉 האימון הסתיים בהצלחה!")

if __name__ == '__main__':
    main()
    