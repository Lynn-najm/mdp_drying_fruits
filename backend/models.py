from sqlalchemy import Column, Integer, Float, Boolean, String
from database import Base

class ReadingDB(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Float)
    humidity = Column(Float)
    fan_on = Column(Boolean)
    timestamp = Column(String)