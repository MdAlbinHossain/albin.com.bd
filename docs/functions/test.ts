export async function onRequest(context) {  
    let htmlContent = `<html><head></head><body><h1 style="text-align:center; margin-top:40px">Hello World</h1></body></html>`;
    return new Response(htmlContent, { headers: { "content-type": "text/html" }, });
  }