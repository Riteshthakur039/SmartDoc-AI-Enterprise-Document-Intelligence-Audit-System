from openai import OpenAI
import json
from app.core.config import settings

def get_llm_client():
    if not settings.OPENAI_API_BASE or not settings.OPENAI_API_KEY:
        raise ValueError("LLM Configuration is incomplete. Must provide OPENAI_API_BASE and OPENAI_API_KEY")
    return OpenAI(
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_API_BASE
    )

def extract_structured_data(text: str) -> dict:
    """
    Sends raw OCR/extracted text to the Gemini (OpenAI compatible) model
    and asks for structured JSON output.
    """
    try:
        client = get_llm_client()
        prompt = f"""
        You are an intelligent document parsing system. Extract the key entities from the following text based on the provided schema.
        Determine if it is an Invoice, Medical Bill, or Contract. 
        If it does not fit these types perfectly, categorize as "Other".

        ### JSON Schema to follow:
        {{
          "document_type": "Invoice | Medical Bill | Contract | Other",
          "entities": {{
            "invoice_number": "string or null",
            "total_amount": "string or null",
            "currency": "ISO code (e.g. USD, EUR, INR) or symbol (e.g. $, ₹) or null",
            "line_items": [
              {{
                "description": "string",
                "quantity": "number or null",
                "unit_price": "string or null",
                "amount": "string or null"
              }}
            ],
            "parties": [
              {{ "type": "Vendor | Buyer | Patient | Provider | PartyA | PartyB", "name": "string" }}
            ],
            "dates": {{
              "invoice_date": "YYYY-MM-DD or null",
              "due_date": "YYYY-MM-DD or null",
              "service_date": "YYYY-MM-DD or null",
              "contract_start": "YYYY-MM-DD or null",
              "contract_end": "YYYY-MM-DD or null"
            }},
            "payment_terms": "string or null",
            "tax_amount": "string or null"
          }}
        }}

        ### Text to analyze:
        {text}
        
        Strictly return ONLY valid JSON.
        """
        response = client.chat.completions.create(
            model="gemini-2.5-flash", 
            messages=[{"role": "system", "content": "You are a helpful assistant that replies only formatting JSON."},
                      {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        output_txt = response.choices[0].message.content
        return json.loads(output_txt)
    except Exception as e:
        return {"error": str(e)}

def analyze_anomalies(structured_data: dict) -> dict:
    """
    Pass the structured data back into the LLM to act as a validation agent.
    Ask it to flag any anomalies.
    """
    try:
        client = get_llm_client()
        prompt = f"""
        You are a highly capable auditing agent. Review this structured document data and point out anomalies.
        Are the totals adding up? Are dates in the past? Any unusual terms?
        Return the output in JSON format detailing any anomalies found. If none, return empty JSON {{}}.
        
        Document JSON:
        {json.dumps(structured_data, indent=2)}
        """
        response = client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        output_txt = response.choices[0].message.content
        return json.loads(output_txt)
    except Exception as e:
        return {"error": str(e)}
