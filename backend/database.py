from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# .env dosyasını yükle
load_dotenv()

# Veritabanı bağlantı URL'si
DATABASE_URL = os.getenv("DATABASE_URL")

# Engine oluştur — veritabanıyla bağlantıyı kurar
engine = create_engine(DATABASE_URL)

# Her istek için ayrı bir session açar, işlem bitince kapatır
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Tüm modellerin miras alacağı temel sınıf
Base = declarative_base()

# API endpoint'lerinde kullanılacak bağlantı fonksiyonu
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()