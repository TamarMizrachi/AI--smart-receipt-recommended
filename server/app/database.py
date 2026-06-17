from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# כתובת ההתחברות למסד הנתונים (אל תשכחי לשנות את הסיסמה לסיסמה שלך ב-MySQL!)
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:123456@localhost:3306/smart_recipe_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()