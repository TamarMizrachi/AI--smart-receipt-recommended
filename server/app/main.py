<<<<<<< HEAD
=======

>>>>>>> partner-code
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import detection_route, recipes_route

app = FastAPI()

# זה החלק שפותר את בעיית ה-API Connection:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # מאפשר לכל פורט (כולל 5173) להתחבר
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(detection_route.router, prefix="/api/detection", tags=["Detection"])
app.include_router(recipes_route.router, prefix="/api/recipes", tags=["Recipes"])

@app.get("/")
def health_check():
    return {"status": "Server is up and running"}