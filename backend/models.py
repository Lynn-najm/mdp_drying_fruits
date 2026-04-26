from datetime import datetime
from sqlalchemy import Column, Integer, Float, Boolean, String, DateTime
from database import Base

class ReadingDB(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, index=True)

    inlet_temperature = Column(Float)
    middle1_temperature = Column(Float)
    middle2_temperature = Column(Float)
    outlet_temperature = Column(Float)
    chamber_temperature = Column(Float)

    humidity = Column(Float)

    fan1_on = Column(Boolean, default=False)
    fan2_on = Column(Boolean, default=False)

    control_mode = Column(String)  # "auto" or "manual"

    timestamp = Column(DateTime, default=datetime.utcnow)
    experiment_id = Column(Integer, nullable=True)



class SettingsDB(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)

    temp_min = Column(Float)
    temp_max = Column(Float)
    humidity_min = Column(Float)
    humidity_max = Column(Float)

    manual_mode = Column(Boolean, default=True)

    forced_fan1_on = Column(Boolean, default=False)
    forced_fan2_on = Column(Boolean, default=False)

class AlertDB(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)
    message = Column(String)
    timestamp = Column(String)


class ExperimentDB(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(String, unique=True, index=True)
    start_time = Column(String)
    end_time = Column(String, nullable=True)
    status = Column(String)  # "running" or "stopped"