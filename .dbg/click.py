import asyncio,sys
from playwright.async_api import async_playwright
PORT=sys.argv[1]
xml=open("/mnt/user-uploads/NFe35260859910539000120550000000455481232167796-nfe.xml",encoding="utf-8",errors="replace").read()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(headless=True)
        ctx=await b.new_context(viewport={"width":1280,"height":1800})
        pg=await ctx.new_page()
        await pg.goto(f"http://localhost:{PORT}",wait_until="domcontentloaded")
        await pg.wait_for_timeout(3000)
        await pg.evaluate("""(t)=>{const i=document.querySelector('input[type=file]');const dt=new DataTransfer();dt.items.add(new File([t],'nfe.xml',{type:'text/xml'}));i.files=dt.files;i.dispatchEvent(new Event('change',{bubbles:true}));}""",xml)
        print("injected",flush=True)
        await pg.get_by_role("button",name="Processar XML").click()
        print("processed",flush=True)
        await pg.wait_for_timeout(3000)
        print("clicking",flush=True)
        await pg.evaluate("window.__t=0;setInterval(()=>window.__t++,50);document.evaluate(\"//button[contains(.,'Visualizar')]\",document,null,9,null).singleNodeValue.click()")
        print("clicked",flush=True)
        await asyncio.sleep(5)
        try:
            t=await asyncio.wait_for(pg.evaluate("window.__t"),timeout=5)
            print("ALIVE ticks",t,"dialog",await pg.locator("[role=dialog]").count(),"pages",await pg.locator("[role=dialog] .doc-page").count())
        except Exception as e:
            print("FROZEN",type(e).__name__)
        await b.close()
asyncio.run(main())
