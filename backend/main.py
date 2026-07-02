from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import films, cinemas, sessions
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import asyncio
from scrapers.cineverse import scrape_all_istanbul, scrape_upcoming
from scrapers.cinetime import scrape_cinetime

app = FastAPI(title="SeansBul API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(films.router, prefix="/api/films", tags=["films"])
app.include_router(cinemas.router, prefix="/api/cinemas", tags=["cinemas"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])

def update_upcoming_flags():
    """Seansı olan filmleri vizyonda, olmayanları yakında olarak işaretle"""
    from database import SessionLocal
    from models.cinema import Cinema
    from models.film import Film
    from models.session import Session as SeansModel
    db = SessionLocal()
    try:
        films_all = db.query(Film).filter(Film.tmdb_id == None).all()
        for f in films_all:
            has_session = db.query(SeansModel).filter(SeansModel.film_id == f.id).first()
            f.is_upcoming = not bool(has_session)
        db.commit()
        print("✅ Yakında/vizyonda bayrakları güncellendi")
    except Exception as e:
        print(f"❌ Bayrak güncelleme hatası: {e}")
        db.rollback()
    finally:
        db.close()

def update_posters_auto():
    """Posterleri otomatik güncelle"""
    import asyncio as aio
    from playwright.async_api import async_playwright
    from database import SessionLocal
    from models.film import Film

    def normalize(s):
        s = s.lower()
        s = s.replace('ı','i').replace('ğ','g').replace('ü','u').replace('ş','s').replace('ö','o').replace('ç','c')
        s = s.replace(':','').replace('(','').replace(')','').replace('.','')
        s = s.replace(' ','')
        return s

    async def _update():
        db = SessionLocal()
        films_without_poster = db.query(Film).filter(Film.poster_path == None).all()
        if not films_without_poster:
            db.close()
            return

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.set_viewport_size({"width": 1920, "height": 1080})
            
            cards = []
            for url in ['https://www.paribucineverse.com/vizyondakiler', 'https://www.paribucineverse.com/gelecek-filmler']:
                await page.goto(url, wait_until='networkidle')
                await page.wait_for_timeout(5000)
                for i in range(20):
                    await page.evaluate(f'window.scrollTo(0, {i * 500})')
                    await page.wait_for_timeout(300)
                await page.wait_for_timeout(2000)
                new_cards = await page.evaluate("""
                    () => {
                        const imgs = document.querySelectorAll('img[src*="marsgate"], img[src*="cdn"]');
                        const r = [];
                        imgs.forEach(img => {
                            const a = img.closest('a');
                            if (!a) return;
                            r.push({slug: a.href.split('/').pop(), poster: img.src});
                        });
                        return r;
                    }
                """)
                cards.extend(new_cards)

            updated = 0
            for film in films_without_poster:
                film_norm = normalize(film.title)
                for card in cards:
                    slug_norm = normalize(card['slug'].replace('-filmi-izle','').replace('-filmi','').replace('-',' '))
                    if film_norm == slug_norm or film_norm in slug_norm or slug_norm in film_norm:
                        film.poster_path = card['poster']
                        updated += 1
                        break
            
            db.commit()
            db.close()
            await browser.close()
            print(f"✅ {updated} film posteri güncellendi")

    aio.run(_update())

def run_scraper():
    print("🕐 Otomatik scraper başladı...")
    asyncio.run(scrape_all_istanbul())
    asyncio.run(scrape_cinetime())
    asyncio.run(scrape_upcoming())
    update_upcoming_flags()
    update_posters_auto()
    print("✅ Otomatik scraper tamamlandı!")

scheduler = BackgroundScheduler()
scheduler.add_job(
    run_scraper,
    CronTrigger(hour=6, minute=0),
    id="daily_scraper",
    replace_existing=True
)

@app.on_event("startup")
def startup():
    scheduler.start()
    print("⏰ Günlük scraper scheduler başlatıldı (her gün 06:00)")
    # Uygulama başlarken bir kere çalıştır
    import threading
    threading.Thread(target=run_scraper, daemon=True).start()
    print("🚀 Başlangıç scraper'ı çalışıyor...")

@app.on_event("shutdown")
def shutdown():
    scheduler.shutdown()

@app.get("/")
def root():
    return {"message": "SeansBul API çalışıyor 🎬"}

@app.get("/scraper/calistir")
async def run_scraper_manually():
    """Manuel scraper çalıştırma endpoint'i"""
    import subprocess
    import sys
    subprocess.Popen([sys.executable, "-m", "scrapers.cineverse"])
    return {"message": "Scraper başlatıldı!"}