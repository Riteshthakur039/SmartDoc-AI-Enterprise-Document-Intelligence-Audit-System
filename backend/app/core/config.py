from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Document Intelligence System"
    API_V1_STR: str = "/api/v1"
    
    # JWT Auth Configuration
    SECRET_KEY: str = "supersecretkey_change_me_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # PostgreSQL Database URL
    DATABASE_URL: str = "postgresql://postgres:admin123@127.0.0.1:5432/smart_doc_db"
    
    # Gemini / OpenAI Config
    OPENAI_API_BASE: str = "https://generativelanguage.googleapis.com/v1beta/openai/"    # The Gemini / compatible base URL
    OPENAI_API_KEY: str = ""     # API Key

    # Qdrant Config
    QDRANT_URL: str = "http://localhost:6333"

    class Config:
        case_sensitive = True

settings = Settings()
