from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean, text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "alignix.db")
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    integrity_lock = Column(Boolean, default=False)
    rules = relationship("Rule", back_populates="profile", cascade="all, delete-orphan")
    sessions = relationship("DocumentSession", back_populates="profile")


class Rule(Base):
    __tablename__ = "rules"
    id = Column(Integer, primary_key=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    element = Column(String(80), nullable=False)
    font_name = Column(String(80))
    font_size = Column(Float)
    bold = Column(Integer, default=0)
    italic = Column(Integer, default=0)
    color = Column(String(20))
    alignment = Column(String(20))
    line_spacing = Column(Float)
    space_before = Column(Float)
    space_after = Column(Float)
    profile = relationship("Profile", back_populates="rules")


class DocumentSession(Base):
    __tablename__ = "document_sessions"
    id = Column(Integer, primary_key=True)
    path = Column(String(500), nullable=False)
    profile_id = Column(Integer, ForeignKey("profiles.id"))
    integrity_score = Column(Float, default=0)
    professionalism_score = Column(Float, default=0)
    readability_score = Column(Float, default=0)
    structural_score = Column(Float, default=0)
    total_corrections = Column(Integer, default=0)
    last_analyzed = Column(DateTime, default=datetime.utcnow)
    profile = relationship("Profile", back_populates="sessions")
    logs = relationship("CorrectionLog", back_populates="session", cascade="all, delete-orphan")


class CorrectionLog(Base):
    __tablename__ = "correction_logs"
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("document_sessions.id"))
    element = Column(String(80))
    issue = Column(Text)
    action = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    session = relationship("DocumentSession", back_populates="logs")


class IntegrityLock(Base):
    __tablename__ = "integrity_locks"
    id = Column(Integer, primary_key=True)
    path = Column(String(500), nullable=False, unique=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(engine)
    _migrate()

def _migrate():
    """Add new columns to existing DB without dropping data."""
    migrations = [
        "ALTER TABLE profiles ADD COLUMN integrity_lock BOOLEAN DEFAULT 0",
        "ALTER TABLE document_sessions ADD COLUMN total_corrections INTEGER DEFAULT 0",
    ]
    with engine.connect() as conn:
        for sql in migrations:
            try:
                conn.execute(text(sql))
                conn.commit()
            except Exception:
                pass  # column already exists


def get_session():
    return SessionLocal()
