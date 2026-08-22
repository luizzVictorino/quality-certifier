import asyncio,sys,json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(headless=True)
        ctx=await b.new_context(viewport={"width":1280,"height":900})
        pg=await ctx.new_page()
        cdp=await ctx.new_cdp_session(pg)
        paused=asyncio.get_event_loop().create_future()
        cdp.on("Debugger.paused",lambda ev: (not paused.done()) and paused.set_result(ev))
        await pg.goto(f"http://localhost:{sys.argv[1]}/#/dlgtest",wait_until="domcontentloaded")
        await pg.wait_for_timeout(2500)
        await cdp.send("Debugger.enable")
        asyncio.create_task(cdp.send("Runtime.evaluate",{"expression":"document.evaluate(\"//button[contains(.,'Visualizar')]\",document,null,9,null).singleNodeValue.click()"}))
        await asyncio.sleep(3)
        asyncio.create_task(cdp.send("Debugger.pause"))
        try:
            ev=await asyncio.wait_for(paused,timeout=15)
            srcs={}
            for f in ev["callFrames"][:25]:
                sid=f["location"]["scriptId"]
                if sid not in srcs: srcs[sid]=(await cdp.send("Debugger.getScriptSource",{"scriptId":sid}))["scriptSource"].split("\n")
                ln=f["location"]["lineNumber"];cn=f["location"]["columnNumber"]
                line=srcs[sid][ln] if ln<len(srcs[sid]) else "?"
                print(f["functionName"],"|",f["url"].split("/")[-1],ln,"|",line[max(0,cn-80):cn+80].strip()[:180])
        except Exception as e: print("nopause",e)
        await b.close()
asyncio.run(main())
