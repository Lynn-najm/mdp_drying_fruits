from fastapi import FastAPI, Depends
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import csv
import io

from database import SessionLocal, engine
from models import Base, ReadingDB, SettingsDB, AlertDB, ExperimentDB

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


def now():
    return datetime.now().isoformat()


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
        db.add(
            SettingsDB(
                temp_min=20,
                temp_max=60,
                humidity_min=30,
                humidity_max=80,
                manual_mode=False,  # False = Auto mode by default
                forced_fan1_on=False,
                forced_fan2_on=False,
            )
        )
        db.commit()

    db.close()


class Reading(BaseModel):
    inlet_temperature: float
    middle1_temperature: float
    middle2_temperature: float
    outlet_temperature: float
    chamber_temperature: float
    humidity: float
    fan1_on: bool = False
    fan2_on: bool = False


class ExperimentStartRequest(BaseModel):
    test_id: str


@app.get("/")
def root():
    return {"message": "API running with DB"}


def control_temperature(r: Reading):
    return r.outlet_temperature


def compute_fan_states(r: Reading, settings: SettingsDB):
    if settings.manual_mode:
        return settings.forced_fan1_on, settings.forced_fan2_on

    temp = control_temperature(r)

    if temp > settings.temp_max or r.humidity > settings.humidity_max:
        return True, True

    temp_safe = temp < settings.temp_max - 5
    humidity_safe = r.humidity < settings.humidity_max - 10

    if temp_safe and humidity_safe:
        return False, False

    return r.fan1_on, r.fan2_on


def create_alerts_if_needed(r: Reading, settings: SettingsDB, db: Session):
    timestamp = now()
    temp = control_temperature(r)

    if r.humidity > settings.humidity_max:
        db.add(AlertDB(type="humidity_high", message=f"Humidity too high: {r.humidity}%", timestamp=timestamp))

    if r.humidity < settings.humidity_min:
        db.add(AlertDB(type="humidity_low", message=f"Humidity too low: {r.humidity}%", timestamp=timestamp))

    if temp > settings.temp_max:
        db.add(AlertDB(type="temperature_high", message=f"Temperature too high: {temp}°C", timestamp=timestamp))

    if temp < settings.temp_min:
        db.add(AlertDB(type="temperature_low", message=f"Temperature too low: {temp}°C", timestamp=timestamp))


def get_running_experiment(db: Session):
    return db.query(ExperimentDB).filter(ExperimentDB.status == "running").first()


def reading_from_db(r: ReadingDB):
    return Reading(
        inlet_temperature=r.inlet_temperature,
        middle1_temperature=r.middle1_temperature,
        middle2_temperature=r.middle2_temperature,
        outlet_temperature=r.outlet_temperature,
        chamber_temperature=r.chamber_temperature,
        humidity=r.humidity,
        fan1_on=r.fan1_on,
        fan2_on=r.fan2_on,
    )


@app.post("/api/readings")
def create_reading(r: Reading, db: Session = Depends(get_db)):
    settings = db.query(SettingsDB).first()
    fan1_state, fan2_state = compute_fan_states(r, settings)
    running_experiment = get_running_experiment(db)

    new_reading = ReadingDB(
        inlet_temperature=r.inlet_temperature,
        middle1_temperature=r.middle1_temperature,
        middle2_temperature=r.middle2_temperature,
        outlet_temperature=r.outlet_temperature,
        chamber_temperature=r.chamber_temperature,
        humidity=r.humidity,
        fan1_on=fan1_state,
        fan2_on=fan2_state,
        control_mode="manual" if settings.manual_mode else "auto",
        experiment_id=running_experiment.id if running_experiment else None,
    )

    db.add(new_reading)
    create_alerts_if_needed(r, settings, db)
    db.commit()
    db.refresh(new_reading)

    return {
        "status": "saved",
        "fan1_on": fan1_state,
        "fan2_on": fan2_state,
        "control_mode": new_reading.control_mode,
        "experiment_id": new_reading.experiment_id,
    }


@app.get("/api/readings")
def get_readings(db: Session = Depends(get_db)):
    return db.query(ReadingDB).order_by(ReadingDB.id.asc()).all()


@app.get("/api/readings/latest")
def get_latest(db: Session = Depends(get_db)):
    return db.query(ReadingDB).order_by(ReadingDB.id.desc()).first()


@app.get("/api/settings")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(SettingsDB).first()

    return {
        "id": settings.id,
        "temp_min": settings.temp_min,
        "temp_max": settings.temp_max,
        "humidity_min": settings.humidity_min,
        "humidity_max": settings.humidity_max,
        "manual_mode": settings.manual_mode,
        "forced_fan1_on": settings.forced_fan1_on,
        "forced_fan2_on": settings.forced_fan2_on,
    }


@app.put("/api/settings")
def update_settings(data: dict, db: Session = Depends(get_db)):
    settings = db.query(SettingsDB).first()

    for key, value in data.items():
        if hasattr(settings, key):
            setattr(settings, key, value)

    latest = db.query(ReadingDB).order_by(ReadingDB.id.desc()).first()
    running_experiment = get_running_experiment(db)

    if latest:
        reading = reading_from_db(latest)
        fan1_state, fan2_state = compute_fan_states(reading, settings)

        db.add(
            ReadingDB(
                inlet_temperature=latest.inlet_temperature,
                middle1_temperature=latest.middle1_temperature,
                middle2_temperature=latest.middle2_temperature,
                outlet_temperature=latest.outlet_temperature,
                chamber_temperature=latest.chamber_temperature,
                humidity=latest.humidity,
                fan1_on=fan1_state,
                fan2_on=fan2_state,
                control_mode="manual" if settings.manual_mode else "auto",
                experiment_id=running_experiment.id if running_experiment else None,
            )
        )

    db.commit()
    db.refresh(settings)

    return get_settings(db)


@app.post("/api/control/fan1")
def control_fan1(state: bool, db: Session = Depends(get_db)):
    settings = db.query(SettingsDB).first()
    settings.manual_mode = True
    settings.forced_fan1_on = state

    latest = db.query(ReadingDB).order_by(ReadingDB.id.desc()).first()
    running_experiment = get_running_experiment(db)

    if latest:
        db.add(
            ReadingDB(
                inlet_temperature=latest.inlet_temperature,
                middle1_temperature=latest.middle1_temperature,
                middle2_temperature=latest.middle2_temperature,
                outlet_temperature=latest.outlet_temperature,
                chamber_temperature=latest.chamber_temperature,
                humidity=latest.humidity,
                fan1_on=state,
                fan2_on=latest.fan2_on,
                control_mode="manual",
                experiment_id=running_experiment.id if running_experiment else None,
            )
        )

    db.commit()
    return {"manual_mode": True, "fan1_on": state}


@app.post("/api/control/fan2")
def control_fan2(state: bool, db: Session = Depends(get_db)):
    settings = db.query(SettingsDB).first()
    settings.manual_mode = True
    settings.forced_fan2_on = state

    latest = db.query(ReadingDB).order_by(ReadingDB.id.desc()).first()
    running_experiment = get_running_experiment(db)

    if latest:
        db.add(
            ReadingDB(
                inlet_temperature=latest.inlet_temperature,
                middle1_temperature=latest.middle1_temperature,
                middle2_temperature=latest.middle2_temperature,
                outlet_temperature=latest.outlet_temperature,
                chamber_temperature=latest.chamber_temperature,
                humidity=latest.humidity,
                fan1_on=latest.fan1_on,
                fan2_on=state,
                control_mode="manual",
                experiment_id=running_experiment.id if running_experiment else None,
            )
        )

    db.commit()
    return {"manual_mode": True, "fan2_on": state}


@app.post("/api/control/auto")
def enable_auto_mode(db: Session = Depends(get_db)):
    settings = db.query(SettingsDB).first()
    settings.manual_mode = False

    latest = db.query(ReadingDB).order_by(ReadingDB.id.desc()).first()
    running_experiment = get_running_experiment(db)

    if latest:
        reading = reading_from_db(latest)
        fan1_state, fan2_state = compute_fan_states(reading, settings)

        db.add(
            ReadingDB(
                inlet_temperature=latest.inlet_temperature,
                middle1_temperature=latest.middle1_temperature,
                middle2_temperature=latest.middle2_temperature,
                outlet_temperature=latest.outlet_temperature,
                chamber_temperature=latest.chamber_temperature,
                humidity=latest.humidity,
                fan1_on=fan1_state,
                fan2_on=fan2_state,
                control_mode="auto",
                experiment_id=running_experiment.id if running_experiment else None,
            )
        )

    db.commit()
    db.refresh(settings)

    return {
        "manual_mode": settings.manual_mode,
        "message": "Automatic control enabled",
    }


@app.get("/api/alerts")
def get_alerts(db: Session = Depends(get_db)):
    return db.query(AlertDB).order_by(AlertDB.id.desc()).all()


@app.post("/api/experiment/start")
def start_experiment(req: ExperimentStartRequest, db: Session = Depends(get_db)):
    running = get_running_experiment(db)

    if running:
        return {
            "status": "error",
            "message": f"Experiment {running.test_id} is already running",
        }

    experiment = ExperimentDB(
        test_id=req.test_id,
        start_time=now(),
        end_time=None,
        status="running",
    )

    db.add(experiment)
    db.commit()
    db.refresh(experiment)

    return {"status": "started", "experiment": experiment.test_id}


@app.post("/api/experiment/stop")
def stop_experiment(db: Session = Depends(get_db)):
    running = get_running_experiment(db)

    if not running:
        return {
            "status": "error",
            "message": "No experiment is currently running",
        }

    running.status = "stopped"
    running.end_time = now()
    db.commit()

    return {"status": "stopped", "experiment": running.test_id}


@app.get("/api/experiment/current")
def get_current_experiment(db: Session = Depends(get_db)):
    running = get_running_experiment(db)

    return {
        "running": running is not None,
        "test_id": running.test_id if running else None,
        "start_time": running.start_time if running else None,
    }


@app.get("/api/export/csv")
def export_csv(db: Session = Depends(get_db)):
    readings = db.query(ReadingDB).order_by(ReadingDB.id.asc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "reading_id",
        "experiment_id",
        "timestamp",
        "control_mode",
        "inlet_temperature",
        "middle1_temperature",
        "middle2_temperature",
        "outlet_temperature",
        "chamber_temperature",
        "humidity",
        "fan1_on",
        "fan2_on",
    ])

    for r in readings:
        writer.writerow([
            r.id,
            r.experiment_id,
            r.timestamp,
            r.control_mode,
            r.inlet_temperature,
            r.middle1_temperature,
            r.middle2_temperature,
            r.outlet_temperature,
            r.chamber_temperature,
            r.humidity,
            r.fan1_on,
            r.fan2_on,
        ])

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=readings.csv"},
    )

@app.get("/api/export/csv/experiment/{test_id}")
def export_experiment_csv(test_id: str, db: Session = Depends(get_db)):
    experiment = db.query(ExperimentDB).filter(ExperimentDB.test_id == test_id).first()

    if not experiment:
        return {"status": "error", "message": "Experiment not found"}

    readings = (
        db.query(ReadingDB)
        .filter(ReadingDB.experiment_id == experiment.id)
        .order_by(ReadingDB.id.asc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "reading_id",
        "experiment_id",
        "test_id",
        "timestamp",
        "control_mode",
        "inlet_temperature",
        "middle1_temperature",
        "middle2_temperature",
        "outlet_temperature",
        "chamber_temperature",
        "humidity",
        "fan1_on",
        "fan2_on",
    ])

    for r in readings:
        writer.writerow([
            r.id,
            r.experiment_id,
            experiment.test_id,
            r.timestamp,
            r.control_mode,
            r.inlet_temperature,
            r.middle1_temperature,
            r.middle2_temperature,
            r.outlet_temperature,
            r.chamber_temperature,
            r.humidity,
            r.fan1_on,
            r.fan2_on,
        ])

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={test_id}.csv"},
    )

@app.get("/api/experiments")
def get_experiments(db: Session = Depends(get_db)):
    experiments = db.query(ExperimentDB).order_by(ExperimentDB.id.desc()).all()

    return [
        {
            "id": e.id,
            "test_id": e.test_id,
            "start_time": e.start_time,
            "end_time": e.end_time,
            "status": e.status,
        }
        for e in experiments
    ]
