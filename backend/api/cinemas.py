from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.cinema import Cinema

router = APIRouter()

# Tüm sinemaları getir
@router.get("/")
def get_cinemas(db: Session = Depends(get_db)):
    cinemas = db.query(Cinema).all()
    return cinemas

# Tek bir sinemayı ID'ye göre getir
@router.get("/{cinema_id}")
def get_cinema(cinema_id: int, db: Session = Depends(get_db)):
    cinema = db.query(Cinema).filter(Cinema.id == cinema_id).first()
    if not cinema:
        raise HTTPException(status_code=404, detail="Sinema bulunamadı")
    return cinema

# AVM adına göre sinema getir
@router.get("/avm/{mall_name}")
def get_cinema_by_mall(mall_name: str, db: Session = Depends(get_db)):
    cinemas = db.query(Cinema).filter(
        Cinema.mall_name.ilike(f"%{mall_name}%")
    ).all()
    return cinemas