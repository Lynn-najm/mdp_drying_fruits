from fastapi import FastAPI, Depends
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session

from database import SessionLocal, engine
from models import ReadingDB, Base

app = FastAPI()

# create tables
Base.metadata.create_all(bind=engine)

# dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class Reading(BaseModel):
    temperature: float
    humidity: float
    fan_on: bool

@app.get("/")
def root():
    return {"message": "API running with DB"}

@app.post("/api/readings")
def create_reading(r: Reading, db: Session = Depends(get_db)):
    new_reading = ReadingDB(
        temperature=r.temperature,
        humidity=r.humidity,
        fan_on=r.fan_on,
        timestamp=datetime.now().isoformat()
    )
    db.add(new_reading)
    db.commit()
    db.refresh(new_reading)
    return {"status": "saved"}

@app.get("/api/readings")
def get_readings(db: Session = Depends(get_db)):
    return db.query(ReadingDB).all()

@app.get("/api/readings/latest")
def get_latest(db: Session = Depends(get_db)):
    return db.query(ReadingDB).order_by(ReadingDB.id.desc()).first()