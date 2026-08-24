import asyncio,sys,json
from playwright.async_api import async_playwright
JS="""
window.__c={};window.__n=0;
const types=Object.keys(window).filter(k=>k.startsWith('on')).map(k=>k.slice(2));
for(const t of types){
  window.addEventListener(t,(e)=>{
    window.__c[t]=(window.__c[t]||0)+1;window.__n++;
    if(window.__n>1500){e.stopImmediatePropagation();e.preventDefault&&e.preventDefault();}
  },true);
}
window.__types=types.length;
"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(headless=True)
        ctx=await b.new_context(viewport={"width":1280,"height":900})
        pg=await ctx.new_page()
        await pg.goto(f"http://localhost:{sys.argv[1]}/#/dlgtest",wait_until="domcontentloaded")
        await pg.wait_for_timeout(2500)
        await pg.evaluate(JS)
        await pg.evaluate("document.evaluate(\"//button[contains(.,'Visualizar')]\",document,null,9,null).singleNodeValue.click()")
        await asyncio.sleep(3)
        try:
            c,n,t=await asyncio.wait_for(pg.evaluate("[window.__c,window.__n,window.__types]"),timeout=8)
            print("types",t,"total",n)
            print(sorted(c.items(),key=lambda x:-x[1])[:8])
        except Exception as e: print("FROZEN",type(e).__name__)
        await b.close()
asyncio.run(main())
