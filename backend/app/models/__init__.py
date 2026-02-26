from sqlalchemy.orm import declarative_base

# Add a central import module so Alembic can import all models easily
from app.db.base import Base
from app.models.user import User
from app.models.document import Document
