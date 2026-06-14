import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, Boolean, Text, DateTime, ForeignKey, Enum as SAEnum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum


class FarmType(str, enum.Enum):
    crop = "crop"
    livestock = "livestock"
    mixed = "mixed"
    aquaculture = "aquaculture"


class SessionStatus(str, enum.Enum):
    active = "active"
    ended = "ended"


class MessageRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


class DocumentType(str, enum.Enum):
    nin = "nin"
    cac = "cac"
    bank_statement = "bank_statement"
    land_document = "land_document"
    other = "other"


class ApplicationStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    rejected = "rejected"
    needs_changes = "needs_changes"


# ─── Farmer ──────────────────────────────────────────────────────────────────
class Farmer(Base):
    __tablename__ = "farmers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supabase_user_id: Mapped[str | None] = mapped_column(String(255), unique=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(20))
    state_of_residence: Mapped[str | None] = mapped_column(String(100))
    lga: Mapped[str | None] = mapped_column(String(100))
    farm_location: Mapped[str | None] = mapped_column(String(255))
    farm_type: Mapped[str | None] = mapped_column(String(50))
    farm_size_hectares: Mapped[float | None] = mapped_column(Float)
    crop_or_livestock_types: Mapped[str | None] = mapped_column(String(500))
    years_in_operation: Mapped[int | None] = mapped_column(Integer)
    annual_revenue_ngn: Mapped[float | None] = mapped_column(Float)
    has_bvn: Mapped[bool] = mapped_column(Boolean, default=False)
    has_cac_registration: Mapped[bool] = mapped_column(Boolean, default=False)
    is_member_of_cooperative: Mapped[bool] = mapped_column(Boolean, default=False)
    has_land_document: Mapped[bool] = mapped_column(Boolean, default=False)
    is_smallholder_farmer: Mapped[bool] = mapped_column(Boolean, default=False)
    is_youth_farmer: Mapped[bool] = mapped_column(Boolean, default=False)
    is_woman_farmer: Mapped[bool] = mapped_column(Boolean, default=False)
    has_existing_loan_default: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sessions = relationship("ChatSession", back_populates="farmer")
    applications = relationship("Application", back_populates="farmer")
    documents = relationship("Document", back_populates="farmer")


# ─── Chat Session ────────────────────────────────────────────────────────────
class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmers.id"))
    token: Mapped[str] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(20), default="active")
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    farmer = relationship("Farmer", back_populates="sessions")
    messages = relationship("ChatMessage", back_populates="session", order_by="ChatMessage.created_at")


# ─── Chat Message ────────────────────────────────────────────────────────────
class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("chat_sessions.id"))
    role: Mapped[str] = mapped_column(String(20))  # user, assistant, system
    content: Mapped[str] = mapped_column(Text)
    suggested_actions: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    pipeline_status: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")


# ─── Grant (Knowledge Base) ──────────────────────────────────────────────────
class Grant(Base):
    __tablename__ = "grants"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255))
    organization: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    eligibility_criteria: Mapped[dict | None] = mapped_column(JSON)
    max_funding_ngn: Mapped[float | None] = mapped_column(Float)
    target_farm_types: Mapped[dict | None] = mapped_column(JSON)  # ["crop", "livestock"]
    target_states: Mapped[dict | None] = mapped_column(JSON)  # ["All"] or specific
    requires_cooperative: Mapped[bool] = mapped_column(Boolean, default=False)
    requires_bvn: Mapped[bool] = mapped_column(Boolean, default=False)
    requires_cac: Mapped[bool] = mapped_column(Boolean, default=False)
    application_url: Mapped[str | None] = mapped_column(String(500))
    deadline: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ─── Application ─────────────────────────────────────────────────────────────
class Application(Base):
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmers.id"))
    grant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("grants.id"))
    status: Mapped[str] = mapped_column(String(30), default="draft")
    portal_reference: Mapped[str | None] = mapped_column(String(100))
    uipath_job_id: Mapped[str | None] = mapped_column(String(255))
    submission_screenshot_url: Mapped[str | None] = mapped_column(String(500))
    proposed_project_description: Mapped[str | None] = mapped_column(Text)
    requested_funding_ngn: Mapped[float | None] = mapped_column(Float)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    last_status_update: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text)

    farmer = relationship("Farmer", back_populates="applications")
    grant = relationship("Grant")


# ─── Document ────────────────────────────────────────────────────────────────
class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmers.id"))
    document_type: Mapped[str] = mapped_column(String(30))
    file_path: Mapped[str] = mapped_column(String(500))
    original_filename: Mapped[str] = mapped_column(String(255))
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    farmer = relationship("Farmer", back_populates="documents")
