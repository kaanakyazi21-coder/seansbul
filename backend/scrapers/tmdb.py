import httpx
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from database import SessionLocal
from models.film import Film

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"

def fetch_now_playing():
    db: Session = SessionLocal()
    try:
        response = httpx.get(
            f"{TMDB_BASE_URL}/movie/now_playing",
            params={"api_key": TMDB_API_KEY, "language": "tr-TR", "region": "TR", "page": 1}
        )
        data = response.json()
        films = data.get("results", [])
        
        for film_data in films:
            existing = db.query(Film).filter(Film.tmdb_id == film_data["id"]).first()
            
            detail = httpx.get(
                f"{TMDB_BASE_URL}/movie/{film_data['id']}",
                params={"api_key": TMDB_API_KEY, "language": "tr-TR"}
            ).json()

            credits = httpx.get(
                f"{TMDB_BASE_URL}/movie/{film_data['id']}/credits",
                params={"api_key": TMDB_API_KEY, "language": "tr-TR"}
            ).json()

            director = next((p["name"] for p in credits.get("crew", []) if p["job"] == "Director"), None)
            cast_list = ", ".join([p["name"] for p in credits.get("cast", [])[:5]])
            genres = ", ".join([g["name"] for g in detail.get("genres", [])])

            if existing:
                existing.director = director
                existing.cast_list = cast_list
                existing.genres = genres
                existing.runtime = detail.get("runtime")
                existing.vote_average = film_data.get("vote_average")
                print(f"🔄 Güncellendi: {existing.title}")
                continue
            
            film = Film(
                tmdb_id=film_data["id"],
                title=film_data.get("title"),
                original_title=film_data.get("original_title"),
                overview=film_data.get("overview"),
                poster_path=film_data.get("poster_path"),
                backdrop_path=film_data.get("backdrop_path"),
                release_date=film_data.get("release_date"),
                runtime=detail.get("runtime"),
                vote_average=film_data.get("vote_average"),
                genres=genres,
                director=director,
                cast_list=cast_list,
            )
            db.add(film)
            print(f"✅ Eklendi: {film.title}")
        
        db.commit()
        print("🎬 Tüm filmler güncellendi!")
    except Exception as e:
        print(f"❌ Hata: {e}")
        db.rollback()
    finally:
        db.close()

def enrich_films_from_tmdb():
    """tmdb_id'si olmayan filmleri TMDB'de arayıp bilgilerini doldur"""
    db: Session = SessionLocal()
    try:
        films = db.query(Film).filter(Film.tmdb_id == None).all()
        print(f"{len(films)} film zenginleştirilecek...")
        
        for film in films:
            try:
                result = httpx.get(
                    f"{TMDB_BASE_URL}/search/movie",
                    params={"api_key": TMDB_API_KEY, "query": film.title, "language": "tr-TR"}
                ).json()
                
                results = result.get("results", [])
                if not results:
                    # Türkçe bulamazsa İngilizce dene
                    result = httpx.get(
                        f"{TMDB_BASE_URL}/search/movie",
                        params={"api_key": TMDB_API_KEY, "query": film.title, "language": "en-US"}
                    ).json()
                    results = result.get("results", [])
                
                if not results:
                    print(f"❌ Bulunamadı: {film.title}")
                    continue
                
                tmdb_film = results[0]
                tmdb_id = tmdb_film["id"]
                
                # Zaten bu tmdb_id var mı?
                existing = db.query(Film).filter(Film.tmdb_id == tmdb_id).first()
                if existing:
                    print(f"⏭ Zaten var: {film.title}")
                    continue
                
                detail = httpx.get(
                    f"{TMDB_BASE_URL}/movie/{tmdb_id}",
                    params={"api_key": TMDB_API_KEY, "language": "tr-TR"}
                ).json()

                credits = httpx.get(
                    f"{TMDB_BASE_URL}/movie/{tmdb_id}/credits",
                    params={"api_key": TMDB_API_KEY, "language": "tr-TR"}
                ).json()

                director = next((p["name"] for p in credits.get("crew", []) if p["job"] == "Director"), None)
                cast_list = ", ".join([p["name"] for p in credits.get("cast", [])[:5]])
                genres = ", ".join([g["name"] for g in detail.get("genres", [])])

                film.tmdb_id = tmdb_id
                film.overview = film.overview or tmdb_film.get("overview")
                film.backdrop_path = film.backdrop_path or tmdb_film.get("backdrop_path")
                film.vote_average = film.vote_average or tmdb_film.get("vote_average")
                film.runtime = film.runtime or detail.get("runtime")
                film.genres = film.genres or genres
                film.director = director
                film.cast_list = cast_list
                
                print(f"✅ Zenginleştirildi: {film.title}")
                
            except Exception as e:
                print(f"❌ Hata ({film.title}): {e}")
        
        db.commit()
        print("✅ Tamamlandı!")
    except Exception as e:
        print(f"❌ Genel hata: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fetch_now_playing()