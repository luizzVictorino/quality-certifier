import asyncio,sys
from playwright.async_api import async_playwright
JS="""
window.__seen={};window.__n=0;
const types=Object.keys(window).filter(k=>k.startsWith('on')).map(k=>k.slice(2));
for(const t of types){
  window.addEventListener(t,(e)=>{
    window.__n++;
    if(!window.__seen[t]){window.__seen[t]=1;console.log('EVT',t,(e.target&&e.target.nodeName)||'?',(e.target&&e.target.className&&(''+e.target.className).slice(0,50))||'');}
    if(window.__n%500===0) console.log('N',window.__n);
    if(window.__n>3000) console.log('TYPE_NOW',t);
  },true);
}
"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(headless=True)
        ctx=await b.new_context(viewport={"width":1280,"height":900})
        pg=await ctx.new_page()
        msgs=[]
        pg.on("console",lambda m: msgs.append(m.text[:120]))
        await pg.goto(f"http://localhost:{sys.argv[1]}/#/dlgtest",wait_until="domcontentloaded")
        await pg.wait_for_timeout(2500)
        await pg.evaluate(JS)
        await pg.evaluate("document.evaluate(\"//button[contains(.,'Visualizar')]\",document,null,9,null).singleNodeValue.click()")
        await asyncio.sleep(4)
        seen=[m for m in msgs if m.startswith('EVT')]
        print("EVTs:",seen[:25])
        print("Ns:",[m for m in msgs if m.startswith('N ')][-3:])
        print("now:",[m for m in msgs if m.startswith('TYPE_NOW')][-3:])
        print("other:",[m for m in msgs if not m.startswith(('EVT','N ','TYPE_NOW'))][:5])
        await b.close()
asyncio.run(main())
