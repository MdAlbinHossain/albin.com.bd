export async function onRequest(context) {
  let input = await context.request.formData();
  let to = [{ email: "mail@albin.com.bd" }];
  if (input.get("password") == context.env.PASSWORD) {
    let arr = input.get("to").split(",");
    if (arr.length > 0) to = arr.map((email) => { return { email: email.trim() }; });
  }
  let send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json", },
    body: JSON.stringify({
      personalizations: [{
        to: to,
        dkim_domain: "albin.com.bd",
        dkim_selector: "mailchannels",
        dkim_private_key: context.env.DKIM_PRIVATE_KEY,
      },],
      from: { email: input.get("from") ?? "anonymous@albin.com.bd", name: input.get("name") ?? "Anonymous" },
      reply_to: { email: (input.get("from") ?? input.get("email")) ?? "anonymous@albin.com.bd", name: input.get("name") ?? "Anonymous" },
      subject: input.get("subject") ?? "Anonymous",
      content: [{
        type: "text/plain",
        value: input.get("message") + "\n\nSent from " + context.request.headers.get("CF-Connecting-IP").toString() + " at " + new Date().toISOString(),
      },],
    }),
  });

  let respContent = "";
  if (context.request.method == "POST") {
    const resp = await fetch(send_request);
    const respText = await resp.text();

    if (resp.statusText == "Accepted") respContent = "Done! Message Sent!";
    else respContent = resp.status + " " + resp.statusText + "\n\n" + respText;
  }
  else respContent = "Method Not Allowed";

  let htmlContent = `<html><head></head><body><h1 style="text-align:center; margin-top:40px">${respContent}</h1></body></html>`;
  return new Response(htmlContent, { headers: { "content-type": "text/html" }, });
}