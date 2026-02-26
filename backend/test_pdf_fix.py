import sys
import os
import json

# Add backend to path
sys.path.append(os.getcwd())

from app.api.endpoints.documents import extract_text_from_pdf
from app.services.llm_service import extract_structured_data

def test_extraction():
    pdf_path = "uploads/filled_sample_invoice.pdf"
    print(f"Testing extraction from: {pdf_path}")
    
    # 1. Test Text Extraction
    text = extract_text_from_pdf(pdf_path)
    print("\n--- Extracted Text Preview ---")
    print(text[:500] + "...")
    
    if not text:
        print("FAILED: No text extracted from PDF.")
        return

    # 2. Test LLM Parsing
    print("\n--- Sending to LLM for parsing ---")
    result = extract_structured_data(text)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    test_extraction()
