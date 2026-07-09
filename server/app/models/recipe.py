from sqlalchemy import Column, Integer, String, Text, JSON
from app.database import Base

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    ingredients = Column(JSON, nullable=False)  
    instructions = Column(Text, nullable=False)
    prep_time = Column(String(50))