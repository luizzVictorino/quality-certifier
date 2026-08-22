import asyncio,sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(headless=True)
        ctx=await b.new_context(viewport={"width":1280,"height":900})
        pg=await ctx.new_page()
        await pg.goto(f"http://localhost:{sys.argv[1]}/dlgtest",wait_until="domcontentloaded")
        await pg.wait_for_timeout(2500)
        await pg.evaluate("window.__t=0;setInterval(()=>window.__t++,50);document.evaluate(\"//button[contains(.,'Visualizar')]\",document,null,9,null).singleNodeValue.click()")
        await asyncio.sleep(4)
        try:
            print("ALIVE",await asyncio.wait_for(pg.evaluate("window.__t"),timeout=5),await pg.locator("[role=dialog]").count())
        except Exception as e: print("FROZEN")
        await b.close()
asyncio.run(main())
