import asyncio
from playwright.async_api import async_playwright
from database import SessionLocal
from models.cinema import Cinema
from models.session import Session
from models.film import Film
from datetime import date

CINETIME_ISTANBUL_URL = "https://cinetime.com.tr/tr/vizyondakiler/cinetime-ozdilekpark-istanbul"
BASE_URL = "https://cinetime.com.tr"
ISTANBUL_SEHIR_ID = "10"

async def scrape_cinetime():
    db = SessionLocal()
    today = date.today().strftime("%Y-%m-%d")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print("🎬 Cinetime ÖzdilekPark İstanbul çekiliyor...")

        cinema = db.query(Cinema).filter(
            Cinema.scraper_id == "cinetime_ozdilekpark"
        ).first()

        if not cinema:
            cinema = Cinema(
                name="Cinetime ÖzdilekPark İstanbul",
                brand="Cinetime",
                mall_name="ÖzdilekPark AVM",
                district="Şişli",
                website_url=CINETIME_ISTANBUL_URL,
                scraper_id="cinetime_ozdilekpark",
            )
            db.add(cinema)
            db.commit()
            db.refresh(cinema)

        # Film listesini çek
        await page.goto(CINETIME_ISTANBUL_URL, wait_until="networkidle")
        await page.wait_for_timeout(2000)

        try:
            await page.click("text=Kabul Et")
            await page.wait_for_timeout(500)
        except:
            pass

        film_links = await page.evaluate("""
            () => {
                const links = document.querySelectorAll('a[href*="film/"]');
                const results = [];
                const seen = new Set();
                links.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && !href.includes('#') && !seen.has(href)) {
                        seen.add(href);
                        results.push(href);
                    }
                });
                return results;
            }
        """)

        print(f"Bulunan film: {len(film_links)}")
        today_formatted = date.today().strftime("%d.%m.%Y")

        for film_path in film_links:
            try:
                film_url = BASE_URL + '/tr/' + film_path + f"#0|{ISTANBUL_SEHIR_ID}|{today_formatted}"
                await page.goto(film_url, wait_until="networkidle")
                await page.wait_for_timeout(2000)

                # Film adını URL'den al
                film_title = film_path.replace('film/', '').replace('-', ' ').title()
                film_title = film_title.strip()
                if not film_title:
                    continue

                print(f"\n🎬 {film_title}")

                # İstanbul salonlarını bul (data-sehirid="18")
                sessions_data = await page.evaluate(f"""
                    () => {{
                        const results = [];
                        const salons = document.querySelectorAll('li.film-detay-salon[data-sehirid="{ISTANBUL_SEHIR_ID}"]');
                        salons.forEach(salon => {{
                            const times = salon.querySelectorAll('time');
                            const formats = salon.querySelectorAll('.film-salon-slider-text p');
                            const seansEls = salon.querySelectorAll('.film-salon-slider-text');
                            
                            times.forEach((timeEl, i) => {{
                                const seansEl = seansEls[i];
                                const seansId = seansEl ? seansEl.getAttribute('seansid') : '';
                                const format = formats[i] ? formats[i].innerText.trim() : '2D';
                                results.push({{
                                    time: timeEl.innerText.trim(),
                                    format: format,
                                    ticket_url: seansId ? 'https://cinetime.com.tr/tr/bilet/seans/' + seansId : '{CINETIME_ISTANBUL_URL}'
                                }});
                            }});
                        }});
                        return results;
                    }}
                """)

                print(f"  Seans: {len(sessions_data)}")

                film = db.query(Film).filter(Film.title == film_title).first()
                if not film:
                    film = Film(title=film_title)
                    db.add(film)
                    db.commit()
                    db.refresh(film)

                for s in sessions_data:
                    existing = db.query(Session).filter(
                        Session.film_id == film.id,
                        Session.cinema_id == cinema.id,
                        Session.date == today,
                        Session.time == s['time'],
                    ).first()

                    if not existing:
                        session = Session(
                            film_id=film.id,
                            cinema_id=cinema.id,
                            date=today,
                            time=s['time'],
                            hall_type=s['format'],
                            ticket_url=s['ticket_url'],
                        )
                        db.add(session)
                        print(f"  ✅ {s['time']} ({s['format']})")

                db.commit()

            except Exception as e:
                print(f"❌ Hata: {e}")
                db.rollback()

        await browser.close()
    db.close()
    print("\n✅ Cinetime scraper tamamlandı!")

if __name__ == "__main__":
    asyncio.run(scrape_cinetime())