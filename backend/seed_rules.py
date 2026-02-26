"""
Seed script to populate Qdrant 'business_rules' collection with sample validation rules.
Uses sentence-transformers for local embeddings (no API key needed).

Run:  python seed_rules.py
"""
import uuid
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.http import models
from app.core.config import settings

# ── Load Embedding Model (runs locally, ~80MB download first time) ──
print("Loading embedding model...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")
EMBEDDING_DIM = 384  # all-MiniLM-L6-v2 output dimension

# ── Connect to Qdrant ──────────────────────────────────────────
qdrant = QdrantClient(url=settings.QDRANT_URL)

# Recreate collection (fresh start)
collections = [c.name for c in qdrant.get_collections().collections]
if "business_rules" in collections:
    qdrant.delete_collection("business_rules")
    print("Deleted existing 'business_rules' collection.")

qdrant.create_collection(
    collection_name="business_rules",
    vectors_config=models.VectorParams(
        size=EMBEDDING_DIM,
        distance=models.Distance.COSINE,
    ),
)
print("Created fresh 'business_rules' collection.")

# ── Sample Business Rules ──────────────────────────────────────
RULES = [
    # Invoice rules
    "Invoice total must equal the sum of all line item amounts plus tax.",
    "Tax amount must not exceed the total invoice amount.",
    "Invoice date must not be in the future.",
    "Invoice must contain at least one line item with description and amount.",
    "Duplicate invoice numbers from the same vendor should be flagged.",
    "Invoice amounts exceeding $10,000 require additional approval.",
    "Vendor name and address must be present on every invoice.",
    "Payment terms must be clearly stated (e.g., Net 30, Net 60).",
    "Currency must be consistent across all line items in an invoice.",
    "Discount percentage must not exceed 50% of the subtotal.",

    # Medical Bill rules
    "Medical bill must include a valid patient name and date of service.",
    "Procedure codes (CPT/ICD) must be valid and match the diagnosis.",
    "Medical bill total must match the sum of individual procedure charges.",
    "Insurance adjustments must not exceed the original billed amount.",
    "Date of service must be before or equal to the billing date.",
    "Duplicate charges for the same procedure on the same date should be flagged.",
    "Out-of-network charges must be clearly marked.",

    # Contract rules
    "Contract must have clearly defined start and end dates.",
    "Contract parties (signatories) must be explicitly named.",
    "Termination clause must be present in every contract.",
    "Non-compete duration must not exceed 2 years.",
    "Payment milestones in a contract must sum to the total contract value.",
    "Contracts exceeding $50,000 must include a liability limitation clause.",
    "Auto-renewal clauses must specify the notice period for cancellation.",

    # General document rules
    "All monetary values must use consistent decimal formatting.",
    "Document must not contain contradictory information in different sections.",
    "Dates should follow a consistent format throughout the document.",
]

# ── Generate Embeddings & Seed Qdrant ──────────────────────────
def main():
    print(f"\nGenerating embeddings for {len(RULES)} rules...")
    embeddings = embedder.encode(RULES, show_progress_bar=True)

    points = []
    for i, (rule, embedding) in enumerate(zip(RULES, embeddings)):
        points.append(
            models.PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding.tolist(),
                payload={"rule_text": rule, "rule_id": i + 1},
            )
        )

    qdrant.upsert(collection_name="business_rules", points=points)
    print(f"\n✅ Successfully seeded {len(points)} rules into Qdrant!")

    # Quick verification
    info = qdrant.get_collection("business_rules")
    print(f"   Collection points count: {info.points_count}")

    # Test search
    test_query = "invoice total does not match line items"
    test_embedding = embedder.encode(test_query).tolist()
    results = qdrant.query_points(
        collection_name="business_rules",
        query=test_embedding,
        limit=3,
    )
    print(f"\n🔍 Test search for: '{test_query}'")
    for r in results.points:
        print(f"   Score {r.score:.4f} → {r.payload['rule_text']}")


if __name__ == "__main__":
    main()
