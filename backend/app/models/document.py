from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    document_type = Column(String)  # Invoice, Medical Bill, Contract
    status = Column(String, default="Pending") # Pending, Review Required, Approved
    
    # Store LLM JSON structured outputs dynamically here
    extracted_data = Column(JSON, nullable=True)
    anomalies = Column(JSON, nullable=True) # Issues detected by agent
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="documents")
