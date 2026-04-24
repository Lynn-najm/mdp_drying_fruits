from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

readings = []

class Reading(BaseModel):
    temperature: float
    humidity: float
    fan_on: bool

@app.get("/")
def root():
    return {"message": "Drying system API is running"}

@app.post("/api/readings")
def create_reading(r: Reading):
    data = {
        "temperature": r.temperature,
        "humidity": r.humidity,
        "fan_on": r.fan_on,
        "timestamp": datetime.now().isoformat()
    }
    readings.append(data)
    return {"status": "ok", "reading": data}

@app.get("/api/readings")
def get_readings():
    return readings

@app.get("/api/readings/latest")
def get_latest():
    return readings[-1] if readings else {}