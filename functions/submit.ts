export async function onRequestPost(context) {
  let input = await context.request.formData();
  let to = input.get("to");
  if (input.get("password") != context.env.PASSWORD) to = null;
  let send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json", },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to ?? "mail@albin.com.bd", },],
        dkim_domain: "albin.com.bd",
        dkim_selector: "mailchannels",
        dkim_private_key: context.env.DKIM_PRIVATE_KEY,
      },],
      from: { email: input.get("email") ?? "anonymous@albin.com.bd", name: input.get("name") ?? "Anonymous" },
      reply_to: { email: input.get("email") ?? "anonymous@albin.com.bd", name: input.get("name") ?? "Anonymous" },
      subject: input.get("subject") ?? "Anonymous",
      content: [{
        type: "text/html",
        value: input.get("message") ?? "No Message",
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

  let htmlContent = `<html><head></head><body><h1 style="text-align:center">${respContent}</h1></body></html>`;
  return new Response(htmlContent, { headers: { "content-type": "text/html" }, });
}