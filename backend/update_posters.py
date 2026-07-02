import asyncio
from playwright.async_api import async_playwright
from database import SessionLocal
from models.film import Film

def normalize(s):
    s = s.lower()
    s = s.replace('ı','i').replace('ğ','g').replace('ü','u').replace('ş','s').replace('ö','o').replace('ç','c')
    s = s.replace(':','').replace('(','').replace(')','').replace('.','')
    s = s.replace(' ','')
    return s

async def update_posters():
    db = SessionLocal()
    
    films_without_poster = db.query(Film).filter(Film.poster_path == None).all()
    print(f'{len(films_without_poster)} filmin posteri yok')
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1080})
        
        # Vizyondakiler sayfası
        await page.goto('https://www.paribucineverse.com/vizyondakiler', wait_until='networkidle')
        await page.wait_for_timeout(5000)
        for i in range(15):
            await page.evaluate(f'window.scrollTo(0, {i * 500})')
            await page.wait_for_timeout(300)
        await page.wait_for_timeout(2000)

        cards = await page.evaluate("""
            () => {
                const imgs = document.querySelectorAll('img[src*="marsgate"], img[src*="cdn"]');
                const r = [];
                imgs.forEach(img => {
                    const a = img.closest('a');
                    if (!a) return;
                    r.push({slug: a.href.split('/').pop(), poster: img.src, href: a.href});
                });
                return r;
            }
        """)
        print(f'Vizyonda {len(cards)} poster bulundu')

        # Gelecek filmler sayfası
        try:
            await page.goto('https://www.paribucineverse.com/gelecek-filmler', wait_until='networkidle')
            await page.wait_for_timeout(3000)
            for i in range(20):
                await page.evaluate(f'window.scrollTo(0, {i * 500})')
                await page.wait_for_timeout(300)
            await page.wait_for_timeout(2000)
            
            extra_cards = await page.evaluate("""
                () => {
                    const imgs = document.querySelectorAll('img[src*="marsgate"], img[src*="cdn"]');
                    const r = [];
                    imgs.forEach(img => {
                        const a = img.closest('a');
                        if (!a) return;
                        r.push({slug: a.href.split('/').pop(), poster: img.src, href: a.href});
                    });
                    return r;
                }
            """)
            cards.extend(extra_cards)
            print(f'Gelecek filmlerden {len(extra_cards)} poster daha bulundu')
        except Exception as e:
            print(f'Gelecek filmler hatası: {e}')

        print(f'Toplam {len(cards)} poster bulundu')
        updated = 0
        
        for film in films_without_poster:
            film_norm = normalize(film.title)
            matched = None
            for card in cards:
                slug_norm = normalize(card['slug'].replace('-filmi-izle','').replace('-filmi','').replace('-',' '))
                if film_norm == slug_norm or film_norm in slug_norm or slug_norm in film_norm:
                    matched = card
                    break
            
            if matched:
                film.poster_path = matched['poster']
                updated += 1
                print(f'✅ Güncellendi: {film.title}')
            else:
                print(f'❌ Bulunamadı: {film.title}')

        db.commit()
        db.close()
        await browser.close()
        print(f'Bitti! {updated} film güncellendi.')

asyncio.run(update_posters())