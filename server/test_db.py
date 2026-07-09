from app.database import engine
from sqlalchemy import text

def test_connection():
    print("🔄 מנסה להתחבר למסד הנתונים...")
    try:
        # פתיחת חיבור זמני והרצת שאילתה פשוטה
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            print("✅ החיבור הצליח! השרת מדבר עם MySQL מצוין.")
    except Exception as e:
        print("❌ אופס! החיבור נכשל.")
        print(f"השגיאה שקיבלנו: {e}")
        print("\n💡 טיפים לפתרון:")
        print("1. ודאו ששרת ה-MySQL שלכן פועל.")
        print("2. בדקו שהסיסמה ב-database.py נכונה.")
        print("3. ודאו שקיים בסיס נתונים בשם 'smart_recipe_db'.")

if __name__ == "__main__":
    test_connection()
