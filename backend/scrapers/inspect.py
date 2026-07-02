import asyncio
from playwright.async_api import async_playwright
from datetime import date

async def inspect():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        today = date.today().strftime("%d.%m.%Y")
        await page.goto(f"https://cinetime.com.tr/tr/film/super-mario-galaksi-filmi#0|18|{today}", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        all_salons = await page.query_selector_all('li.film-detay-salon')
        for s in all_salons:
            sehir = await s.get_attribute('data-sehirid')
            h3 = await s.query_selector('h3')
            name = await h3.inner_text() if h3 else ''
            if 'istanbul' in name.lower() or 'İstanbul' in name:
                print(f"BULUNDU! sehirid={sehir}: {name}")
        
        await browser.close()

asyncio.run(inspect())