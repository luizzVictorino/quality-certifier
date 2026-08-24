import asyncio,sys,json
from playwright.async_api import async_playwright
JS="""
window.__ev=[];
window.addEventListener('focusin',(e)=>{
  if(window.__ev.length>=250){e.stopImmediatePropagation();return;}
  const t=e.target;
  window.__ev.push((t.tagName||'')+'#'+(t.id||'')+'.'+(t.className&&t.className.baseVal!==undefined?t.className.baseVal:(''+t.className)).slice(0,60));
},true);
window.addEventListener('focusout',(e)=>{if(window.__ev.length>=250)e.stopImmediatePropagation();},true);
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
            ev=await asyncio.wait_for(pg.evaluate("window.__ev"),timeout=8)
            print("count",len(ev))
            print(json.dumps(ev[:12],indent=0))
            print("tail",json.dumps(ev[-6:]))
        except Exception as e: print("FROZEN",type(e).__name__)
        await b.close()
asyncio.run(main())
