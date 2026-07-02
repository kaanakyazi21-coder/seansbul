import asyncio
from playwright.async_api import async_playwright
from database import SessionLocal
from models.cinema import Cinema
from models.session import Session
from models.film import Film
from datetime import date

async def scrape_all_istanbul():
    db = SessionLocal()
    today = date.today().strftime("%Y-%m-%d")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print("🔍 İstanbul sinemaları aranıyor...")
        await page.goto("https://www.paribucineverse.com/sinemalar", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        cinema_links = await page.evaluate("""
            () => {
                const cards = document.querySelectorAll('a[href*="/sinemalar/"]');
                const results = [];
                cards.forEach(card => {
                    const href = card.getAttribute('href');
                    const name = card.querySelector('h2, h3, .card-title, [class*="title"]');
                    const addr = card.querySelector('p, address, [class*="address"]');
                    if (href && href.includes('/sinemalar/') && href !== '/sinemalar') {
                        results.push({
                            url: 'https://www.paribucineverse.com' + href,
                            name: name ? name.innerText.trim() : href,
                            address: addr ? addr.innerText.trim() : ''
                        });
                    }
                });
                return [...new Map(results.map(r => [r.url, r])).values()];
            }
        """)

        print(f"Toplam sinema: {len(cinema_links)}")

        istanbul_cinemas = [c for c in cinema_links if 'İstanbul' in c['address'] or 'Istanbul' in c['address'] or 'istanbul' in c['url']]
        print(f"İstanbul sinemaları: {len(istanbul_cinemas)}")

        if len(istanbul_cinemas) == 0:
            istanbul_cinemas = cinema_links
            print("Adres filtresi çalışmadı, tüm sinemalar alınıyor...")

        for cinema_data in cinema_links:
            try:
                print(f"\n🎬 Çekiliyor: {cinema_data['name']}")

                await page.goto(cinema_data['url'], wait_until="networkidle")
                await page.wait_for_timeout(2000)

                page_text = await page.inner_text('body')
                if 'İstanbul' not in page_text and 'istanbul' not in page_text.lower():
                    print(f"  ⏭ İstanbul değil, atlanıyor...")
                    continue

                cinema = db.query(Cinema).filter(
                    Cinema.website_url == cinema_data['url']
                ).first()

                if not cinema:
                    cinema = Cinema(
                        name=cinema_data['name'],
                        brand="Paribu Cineverse",
                        mall_name=cinema_data['name'],
                        district="İstanbul",
                        website_url=cinema_data['url'],
                        scraper_id=cinema_data['url'].split('/')[-1],
                    )
                    db.add(cinema)
                    db.commit()
                    db.refresh(cinema)

                film_blocks = await page.query_selector_all(".item-list-detail")

                for block in film_blocks:
                    movie_row = await block.query_selector("[data-movie-title]")
                    if not movie_row:
                        continue
                    film_title = await movie_row.get_attribute("data-movie-title")
                    if not film_title:
                        continue
                    film_title = film_title.strip()

                    session_rows = await block.query_selector_all(".row.time-row-list")
                    for row in session_rows:
                        hall_el = await row.query_selector(".into-text")
                        hall_type = "2D"
                        if hall_el:
                            hall_text = await hall_el.inner_text()
                            if "IMAX" in hall_text:
                                hall_type = "IMAX"
                            elif "GOLD" in hall_text.upper():
                                hall_type = "Gold Class"
                            elif "3D" in hall_text:
                                hall_type = "3D"
                            elif "SCREENX" in hall_text.upper():
                                hall_type = "ScreenX"
                            else:
                                hall_type = hall_text.strip()

                        session_els = await row.query_selector_all("a.cinema-list-item")
                        for session_el in session_els:
                            time_text = (await session_el.inner_text()).strip()
                            ticket_path = await session_el.get_attribute("data-url")
                            ticket_url = "https://www.paribucineverse.com" + ticket_path if ticket_path else cinema_data['url']

                            film = db.query(Film).filter(Film.title == film_title).first()
                            if not film:
                                film = Film(title=film_title)
                                db.add(film)
                                db.commit()
                                db.refresh(film)

                            existing = db.query(Session).filter(
                                Session.film_id == film.id,
                                Session.cinema_id == cinema.id,
                                Session.date == today,
                                Session.time == time_text,
                            ).first()

                            if not existing:
                                session = Session(
                                    film_id=film.id,
                                    cinema_id=cinema.id,
                                    date=today,
                                    time=time_text,
                                    hall_type=hall_type,
                                    ticket_url=ticket_url,
                                )
                                db.add(session)
                                print(f"  ✅ {film_title} - {time_text} ({hall_type})")

                db.commit()

            except Exception as e:
                print(f"❌ Hata: {e}")
                db.rollback()

        await browser.close()
    db.close()
    print("\n🎬 Tüm İstanbul seansları eklendi!")


async def scrape_upcoming():
    """Yakında vizyona girecek filmleri çek"""
    db = SessionLocal()

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print("🔍 Yakında vizyona girecek filmler çekiliyor...")
        await page.goto("https://www.paribucineverse.com/vizyondakiler", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await page.wait_for_timeout(2000)
        await page.evaluate("window.scrollTo(0, 0)")
        await page.wait_for_timeout(1000)

        try:
            yakinda_btn = await page.query_selector('text=Yakında')
            if yakinda_btn:
                await yakinda_btn.click()
                await page.wait_for_timeout(2000)
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await page.wait_for_timeout(2000)
        except:
            print("Yakında sekmesi bulunamadı")

        film_cards = await page.evaluate("""
            () => {
                const links = document.querySelectorAll('a[href*="filmi"], a[href*="film-izle"]');
                const results = [];
                const seen = new Set();
                links.forEach(a => {
                    const href = a.href;
                    if (seen.has(href)) return;
                    seen.add(href);
                    const img = a.querySelector('img');
                    const slug = href.split('/').pop().replace('-filmi-izle', '').replace('-filmi', '');
                    const title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    const dateEl = a.querySelector('[class*="date"], time, [class*="release"]');
                    results.push({
                        title: title,
                        poster: img ? img.src : '',
                        release_date: dateEl ? dateEl.innerText.trim() : '',
                        url: href
                    });
                });
                return results;
            }
        """)

        print(f"Yakında {len(film_cards)} film bulundu")

        for card in film_cards:
            try:
                existing = db.query(Film).filter(Film.title == card['title']).first()
                poster = card['poster'] if card['poster'] and card['poster'].startswith('http') else None
                if not existing:
                    film = Film(
                        title=card['title'],
                        poster_path=poster,
                        release_date=card['release_date'] if card['release_date'] else None,
                    )
                    db.add(film)
                    print(f"✅ Eklendi: {card['title']} - poster: {poster}")
                else:
                    updated = False
                    if poster and not existing.poster_path:
                        existing.poster_path = poster
                        updated = True
                    # Seansı varsa yakında değil
                    from models.session import Session as SeansModel
                    has_session = db.query(SeansModel).filter(SeansModel.film_id == existing.id).first()
                    if has_session:
                        existing.is_upcoming = False
                    else:
                        existing.is_upcoming = True
                    print(f"{'🔄' if updated else '⏭'} {card['title']} - seansı {'var' if has_session else 'yok'}")
            except Exception as e:
                print(f"❌ Hata: {e}")
                db.rollback()

        db.commit()
        await browser.close()
    db.close()
    print("✅ Yakında filmleri eklendi!")


if __name__ == "__main__":
    asyncio.run(scrape_all_istanbul())