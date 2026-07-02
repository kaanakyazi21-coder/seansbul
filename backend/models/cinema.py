from sqlalchemy import Column, Integer, String, Float
from database import Base

class Cinema(Base):
    __tablename__ = "cinemas"

    # Her sinemanın benzersiz ID'si
    id = Column(Integer, primary_key=True, index=True)
    
    name = Column(String, nullable=False)      # Sinema adı (Cinemaximum, CGV vb.)
    brand = Column(String)                     # Marka (Cinemaximum, Cineverse vb.)
    mall_name = Column(String)                 # AVM adı (Kanyon, İstinyePark vb.)
    district = Column(String)                  # İlçe (Levent, Beşiktaş vb.)
    address = Column(String)                   # Tam adres
    latitude = Column(Float)                   # Konum — enlem
    longitude = Column(Float)                  # Konum — boylam
    website_url = Column(String)               # Bilet satın alma linki
    scraper_id = Column(String, unique=True)   # Scraper'ın tanıdığı benzersiz ID