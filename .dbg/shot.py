import asyncio,sys
from playwright.async_api import async_playwright
xml=open("/mnt/user-uploads/NFe35260859910539000120550000000455481232167796-nfe.xml",encoding="utf-8",errors="replace").read()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(headless=True)
        ctx=await b.new_context(viewport={"width":1280,"height":1800})
        pg=await ctx.new_page()
        errs=[]
        pg.on("pageerror",lambda e:errs.append(str(e)[:120]))
        await pg.goto(f"http://localhost:{sys.argv[1]}",wait_until="domcontentloaded")
        await pg.wait_for_timeout(2500)
        await pg.evaluate("""(t)=>{const i=document.querySelector('input[type=file]');const dt=new DataTransfer();dt.items.add(new File([t],'nfe.xml',{type:'text/xml'}));i.files=dt.files;i.dispatchEvent(new Event('change',{bubbles:true}));}""",xml)
        await pg.get_by_role("button",name="Processar XML").click()
        await pg.wait_for_timeout(2000)
        await pg.evaluate("document.evaluate(\"//button[contains(.,'Visualizar')]\",document,null,9,null).singleNodeValue.click()")
        await pg.wait_for_timeout(2500)
        await pg.screenshot(path="/tmp/browser/modal.png")
        print("errs",errs[:3])
        await b.close()
asyncio.run(main())
