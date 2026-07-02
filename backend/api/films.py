from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.film import Film
from models.session import Session as SeansModel
from datetime import date

router = APIRouter()

@router.get("/")
def get_films(db: Session = Depends(get_db)):
    films = db.query(Film).filter(Film.tmdb_id != None).all()
    return films

@router.get("/filtrele")
def filtrele_films(
    filtre: str = Query(default="bugun"),
    db: Session = Depends(get_db)
):
    today = date.today().strftime("%Y-%m-%d")

    if filtre == "bugun":
        film_ids = db.query(SeansModel.film_id).filter(
            SeansModel.date == today
        ).distinct().all()
        ids = [f[0] for f in film_ids]
        if not ids:
            return []
        return db.query(Film).filter(Film.id.in_(ids)).all()

    elif filtre == "aksam":
        film_ids = db.query(SeansModel.film_id).filter(
            SeansModel.date == today,
            SeansModel.time >= "18:00"
        ).distinct().all()
        ids = [f[0] for f in film_ids]
        if not ids:
            return []
        return db.query(Film).filter(Film.id.in_(ids)).all()

    elif filtre == "imax":
        film_ids = db.query(SeansModel.film_id).filter(
            SeansModel.date == today,
            SeansModel.hall_type.ilike("%imax%")
        ).distinct().all()
        ids = [f[0] for f in film_ids]
        if not ids:
            return []
        return db.query(Film).filter(Film.id.in_(ids)).all()

    elif filtre == "erken":
        film_ids = db.query(SeansModel.film_id).filter(
            SeansModel.date == today
        ).order_by(SeansModel.time).distinct().all()
        ids = [f[0] for f in film_ids]
        if not ids:
            return []
        return db.query(Film).filter(Film.id.in_(ids)).all()

    elif filtre == "yakinda":
        return db.query(Film).filter(
            Film.is_upcoming == True,
            Film.poster_path != None,
        ).all()

    else:
        film_ids = db.query(SeansModel.film_id).filter(
            SeansModel.date == today
        ).distinct().all()
        ids = [f[0] for f in film_ids]
        if not ids:
            return []
        return db.query(Film).filter(Film.id.in_(ids)).all()

@router.get("/film/{film_id}")
def get_film(film_id: int, db: Session = Depends(get_db)):
    film = db.query(Film).filter(Film.id == film_id).first()
    if not film:
        raise HTTPException(status_code=404, detail="Film bulunamadi")
    return film