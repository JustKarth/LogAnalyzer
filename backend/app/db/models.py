from sqlalchemy import BigInteger, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import INET, JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    event_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        unique=True,
        nullable=False
    )

    source_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    timestamp: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    event_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    severity: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    user_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    src_ip: Mapped[str | None] = mapped_column(
        INET,
        nullable=True
    )

    dst_ip: Mapped[str | None] = mapped_column(
        INET,
        nullable=True
    )

    host: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    event_metadata: Mapped[dict] = mapped_column(
        "metadata",
        JSONB,
        nullable=False,
        default=dict
    )