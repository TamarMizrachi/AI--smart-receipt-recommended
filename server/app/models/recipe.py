<<<<<<< HEAD
=======
# app/models/recipe.py

>>>>>>> partner-code
from sqlalchemy import Column, Integer, String, Text, JSON
from app.database import Base

class Recipe(Base):
<<<<<<< HEAD
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    ingredients = Column(JSON, nullable=False)  
=======
    __tablename__ = "recipes"  # חייב להיות תואם לשם הטבלה שיצרתן ב-MySQL

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)  
    name = Column(String(255), nullable=False)
    ingredients = Column(JSON, nullable=False)  # מזהה אוטומטית את מערך המצרכים שלכן
>>>>>>> partner-code
    instructions = Column(Text, nullable=False)
    prep_time = Column(String(50))