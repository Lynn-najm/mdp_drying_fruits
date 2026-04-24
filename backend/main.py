from fastapi import FastAPI, Depends
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session

from fastapi.responses import StreamingResponse
import csv
import io

from database import SessionLocal, engine
from models import Base, ReadingDB, SettingsDB, AlertDB

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
def create_default_settings():
    db = SessionLocal()

    settings = db.query(SettingsDB).first()

    if not settings:
        default_settings = SettingsDB(
            temp_min=20,
            temp_max=60,
            humidity_min=30,
            humidity_max=80,
            manual_mode=False,
            forced_fan_on=False
        )
        db.add(default_settings)
        db.commit()

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
    settings = db.query(SettingsDB).first()

    fan_state = r.fan_on

    if settings.manual_mode:
        fan_state = settings.forced_fan_on
    else:
        if r.humidity > settings.humidity_max:
            fan_state = True
        elif r.humidity < settings.humidity_min:
            fan_state = False

    new_reading = ReadingDB(
        temperature=r.temperature,
        humidity=r.humidity,
        fan_on=fan_state,
        timestamp=datetime.now().isoformat()
    )

    db.add(new_reading)

    if r.humidity > settings.humidity_max:
        alert = AlertDB(
            type="humidity_high",
            message=f"Humidity too high: {r.humidity}%",
            timestamp=datetime.now().isoformat()
        )
        db.add(alert)

    if r.humidity < settings.humidity_min:
        alert = AlertDB(
            type="humidity_low",
            message=f"Humidity too low: {r.humidity}%",
            timestamp=datetime.now().isoformat()
        )
        db.add(alert)

    if r.temperature > settings.temp_max:
        alert = AlertDB(
            type="temperature_high",
            message=f"Temperature too high: {r.temperature}°C",
            timestamp=datetime.now().isoformat()
        )
        db.add(alert)

    if r.temperature < settings.temp_min:
        alert = AlertDB(
            type="temperature_low",
            message=f"Temperature too low: {r.temperature}°C",
            timestamp=datetime.now().isoformat()
        )
        db.add(alert)

    db.commit()
    db.refresh(new_reading)

    return {
        "status": "saved",
        "fan_on": fan_state
    }


@app.get("/api/readings")
def get_readings(db: Session = Depends(get_db)):
    return db.query(ReadingDB).all()


@app.get("/api/readings/latest")
def get_latest(db: Session = Depends(get_db)):
    return db.query(ReadingDB).order_by(ReadingDB.id.desc()).first()


@app.get("/api/settings")
def get_settings(db: Session = Depends(get_db)):
    return db.query(SettingsDB).first()


@app.put("/api/settings")
def update_settings(data: dict, db: Session = Depends(get_db)):
    settings = db.query(SettingsDB).first()

    for key, value in data.items():
        if hasattr(settings, key):
            setattr(settings, key, value)

    db.commit()
    db.refresh(settings)

    return settings


@app.post("/api/control/fan")
def control_fan(state: bool, db: Session = Depends(get_db)):
    settings = db.query(SettingsDB).first()

    settings.manual_mode = True
    settings.forced_fan_on = state

    db.commit()

    return {
        "manual_mode": True,
        "fan_forced": state
    }


@app.post("/api/control/auto")
def enable_auto_mode(db: Session = Depends(get_db)):
    settings = db.query(SettingsDB).first()

    settings.manual_mode = False

    db.commit()

    return {
        "manual_mode": False,
        "message": "Automatic control enabled"
    }


@app.get("/api/alerts")
def get_alerts(db: Session = Depends(get_db)):
    return db.query(AlertDB).order_by(AlertDB.id.desc()).all()

@app.get("/api/export/csv")
def export_csv(db: Session = Depends(get_db)):
    readings = db.query(ReadingDB).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["id", "temperature", "humidity", "fan_on", "timestamp"])

    for r in readings:
        writer.writerow([
            r.id,
            r.temperature,
            r.humidity,
            r.fan_on,
            r.timestamp
        ])

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=readings.csv"}
    )