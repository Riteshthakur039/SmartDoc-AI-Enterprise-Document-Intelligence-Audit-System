from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class DocumentBase(BaseModel):
    filename: str
    document_type: Optional[str] = None
    status: str = "Pending"

class DocumentCreate(DocumentBase):
    file_path: str

class DocumentResponse(DocumentBase):
    id: int
    user_id: int
    extracted_data: Optional[Dict[str, Any]] = None
    anomalies: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ExtractionResult(BaseModel):
    extracted_data: Dict[str, Any]
    anomalies: Optional[Dict[str, Any]] = None
