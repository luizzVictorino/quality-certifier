import asyncio,sys,json
from playwright.async_api import async_playwright
JS="""
window.__c={};window.__n=0;
const types=['focusin','focusout','blur','focus','mousedown','mouseup','click','pointerdown','pointerup','keydown','scroll','resize','animationstart','animationend','transitionend','selectionchange','wheel','mousemove','load','error'];
for(const t of types){
  window.addEventListener(t,(e)=>{
    window.__c[t]=(window.__c[t]||0)+1;window.__n++;
    if(window.__n>800){e.stopImmediatePropagation();}
  },true);
}
const mo=new MutationObserver(m=>{window.__mut=(window.__mut||0)+m.length});
mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true});
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
            print(await asyncio.wait_for(pg.evaluate("[window.__c,window.__n,window.__mut]"),timeout=8))
        except Exception as e: print("FROZEN",type(e).__name__)
        await b.close()
asyncio.run(main())
