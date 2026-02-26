from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.http import models
from app.core.config import settings

# Load embedding model once at startup (cached after first download)
embedder = SentenceTransformer("all-MiniLM-L6-v2")
EMBEDDING_DIM = 384

# Initialize Qdrant Client (Requires running Qdrant instance)
try:
    qdrant = QdrantClient(url=settings.QDRANT_URL)
    
    # Ensure collection exists for rules
    collections = qdrant.get_collections().collections
    if not any(c.name == "business_rules" for c in collections):
        qdrant.create_collection(
            collection_name="business_rules",
            vectors_config=models.VectorParams(
                size=EMBEDDING_DIM,
                distance=models.Distance.COSINE
            )
        )
except Exception as e:
    print(f"Warning: Qdrant connection failed: {e}")
    qdrant = None


def get_context_for_document(document_text: str) -> str:
    """
    Search Qdrant for relevant business rules using sentence-transformers embeddings.
    Returns the top matching business rules as context for validation.
    """
    if not qdrant:
         return "No Qdrant connection."
         
    try:
        # 1. Generate real embedding for the document text
        query_embedding = embedder.encode(document_text[:500]).tolist()
        
        # 2. Search Qdrant DB for matching business rules
        search_result = qdrant.query_points(
            collection_name="business_rules",
            query=query_embedding,
            limit=5
        )
        
        rules = [point.payload.get("rule_text", "") for point in search_result.points]
        return "\n".join(rules) if rules else "No matching rules found."
    except Exception as e:
        return f"RAG Search Error: {str(e)}"

def validate_extracted_data(extracted_data: dict, document_text: str) -> dict:
    """
    Combines rule-based python validation with RAG context fetch.
    Returns detected discrepancies.
    """
    discrepancies = {}
    
    # 1. Fetch RAG Context (real semantic search from Qdrant)
    rag_context = get_context_for_document(document_text)
    
    # 2. Hardcoded Python Rule Checks
    if "total" in extracted_data and "tax" in extracted_data:
        try:
            total = float(extracted_data["total"])
            tax = float(extracted_data["tax"])
            if tax > total:
                discrepancies["tax_error"] = "Tax cannot be greater than total amount."
        except ValueError:
            pass
            
    # Include RAG Context as an annotation for the AI Agent later
    extracted_data["_rag_context"] = rag_context
    
    return discrepancies

