import asyncio,sys,json
from playwright.async_api import async_playwright
PORT=sys.argv[1]
xml=open("/mnt/user-uploads/NFe35260859910539000120550000000455481232167796-nfe.xml",encoding="utf-8",errors="replace").read()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(headless=True)
        ctx=await b.new_context(viewport={"width":1280,"height":1800})
        pg=await ctx.new_page()
        cdp=await ctx.new_cdp_session(pg)
        paused=asyncio.get_event_loop().create_future()
        def on_paused(ev):
            if not paused.done(): paused.set_result(ev)
        cdp.on("Debugger.paused",on_paused)
        await pg.goto(f"http://localhost:{PORT}",wait_until="domcontentloaded")
        await pg.wait_for_timeout(3000)
        await pg.evaluate("""(t)=>{const i=document.querySelector('input[type=file]');const dt=new DataTransfer();dt.items.add(new File([t],'nfe.xml',{type:'text/xml'}));i.files=dt.files;i.dispatchEvent(new Event('change',{bubbles:true}));}""",xml)
        await pg.get_by_role("button",name="Processar XML").click()
        await pg.wait_for_timeout(2000)
        await cdp.send("Debugger.enable")
        asyncio.create_task(cdp.send("Runtime.evaluate",{"expression":"document.evaluate(\"//button[contains(.,'Visualizar')]\",document,null,9,null).singleNodeValue.click()"}))
        await asyncio.sleep(4)
        asyncio.create_task(cdp.send("Debugger.pause"))
        try:
            ev=await asyncio.wait_for(paused,timeout=15)
            out=[]
            srcs={}
            for f in ev["callFrames"][:20]:
                sid=f["location"]["scriptId"]
                if sid not in srcs:
                    srcs[sid]=(await cdp.send("Debugger.getScriptSource",{"scriptId":sid}))["scriptSource"]
                lines=srcs[sid].split("\n")
                ln=f["location"]["lineNumber"]; cn=f["location"]["columnNumber"]
                snip=lines[ln][max(0,cn-120):cn+120] if ln<len(lines) else "?"
                out.append({"fn":f["functionName"],"snip":snip})
            open("stack.json","w").write(json.dumps(out,indent=1))
            print(json.dumps(out[:20],indent=1))
        except Exception as e:
            print("nopause",type(e).__name__)
        await b.close()
asyncio.run(main())
