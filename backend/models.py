from sqlalchemy import Column, Integer, Float, Boolean, String
from database import Base

class ReadingDB(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Float)
    humidity = Column(Float)
    fan_on = Column(Boolean)
    timestamp = Column(String)

class SettingsDB(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    temp_min = Column(Float)
    temp_max = Column(Float)
    humidity_min = Column(Float)
    humidity_max = Column(Float)
    manual_mode = Column(Boolean)
    forced_fan_on = Column(Boolean)

class AlertDB(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)
    message = Column(String)
    timestamp = Column(String)