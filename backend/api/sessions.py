from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.session import Session as SeansModel
from datetime import date

router = APIRouter()

# Tüm seansları getir
@router.get("/")
def get_sessions(db: Session = Depends(get_db)):
    sessions = db.query(SeansModel).all()
    return sessions

# Bugünkü seansları getir
@router.get("/bugun")
def get_today_sessions(db: Session = Depends(get_db)):
    today = date.today().strftime("%Y-%m-%d")
    sessions = db.query(SeansModel).filter(
        SeansModel.date == today
    ).all()
    return sessions

# Belirli bir filme ait seansları getir
@router.get("/film/{film_id}")
def get_sessions_by_film(film_id: int, db: Session = Depends(get_db)):
    sessions = db.query(SeansModel).filter(
        SeansModel.film_id == film_id
    ).all()
    return sessions

# Belirli bir sinemaya ait seansları getir
@router.get("/sinema/{cinema_id}")
def get_sessions_by_cinema(cinema_id: int, db: Session = Depends(get_db)):
    sessions = db.query(SeansModel).filter(
        SeansModel.cinema_id == cinema_id
    ).all()
    return sessions

# En ucuz seansları getir
@router.get("/filtrele/en-ucuz")
def get_cheapest_sessions(db: Session = Depends(get_db)):
    sessions = db.query(SeansModel).filter(
        SeansModel.price != None
    ).order_by(SeansModel.price).limit(20).all()
    return sessions