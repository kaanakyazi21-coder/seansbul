from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Session(Base):
    __tablename__ = "sessions"

    # Her seanın benzersiz ID'si
    id = Column(Integer, primary_key=True, index=True)

    # Hangi film, hangi sinema
    film_id = Column(Integer, ForeignKey("films.id"), nullable=False)
    cinema_id = Column(Integer, ForeignKey("cinemas.id"), nullable=False)

    date = Column(String, nullable=False)       # Tarih (2026-04-26)
    time = Column(String, nullable=False)       # Saat (19:30)
    hall_type = Column(String)                  # Salon tipi (2D, 3D, IMAX, Gold)
    price = Column(Float)                       # Fiyat (TL)
    ticket_url = Column(String)                 # Bilet alma linki (resmi siteye yönlendirme)
    available_seats = Column(Integer)           # Boş koltuk sayısı (varsa)

    # İlişkiler — film ve sinema bilgisine direkt erişim sağlar
    film = relationship("Film", backref="sessions")
    cinema = relationship("Cinema", backref="sessions")