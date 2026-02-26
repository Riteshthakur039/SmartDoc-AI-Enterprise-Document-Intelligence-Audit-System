import os
import shutil
import pdfplumber
from typing import List
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.services.llm_service import extract_structured_data, analyze_anomalies
from app.services.validation import validate_extracted_data

router = APIRouter()
UPLOAD_DIR = "uploads"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extracts text from a local PDF file using pdfplumber.
    """
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
    return text.strip()

@router.post("/upload", response_model=DocumentResponse)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 1. Real OCR/Text Extraction from PDF
        raw_text = extract_text_from_pdf(file_path)
        
        if not raw_text:
            # Fallback for image-based PDFs (In real app, use OCR like DocTR or Gemini Vision)
            raw_text = f"Simulated OCR extract for {file.filename}. Content could not be read as text."

        # 2. Extract structured data using LLM
        structured_data = extract_structured_data(raw_text)

        # 3. Rule-Based Validation & Qdrant RAG Context Gathering
        discrepancies = validate_extracted_data(structured_data, raw_text)

        # 4. Detect anomalies using Agent (Pass in RAG enriched data)
        anomalies = analyze_anomalies(structured_data)
        
        # Merge manual rule violations into LLM anomalies
        if discrepancies:
            if not isinstance(anomalies, dict):
                anomalies = {}
            anomalies["rule_violations"] = discrepancies

        # 5. Save to Database
        doc_type = structured_data.get("document_type", "Unknown")
        db_doc = Document(
            user_id=current_user.id,
            filename=file.filename,
            file_path=file_path,
            document_type=doc_type,
            status="Processed",
            extracted_data=structured_data,
            anomalies=anomalies
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)

        return db_doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[DocumentResponse])
def get_document_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    documents = db.query(Document).filter(
        Document.user_id == current_user.id
    ).order_by(desc(Document.created_at)).all()
    return documents
