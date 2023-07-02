export async function onRequestPost(context) {
  let input = await context.request.formData();
  let send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json", },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: "contact@albin.com.bd", name: "Contact Form" },],
        dkim_domain: "albin.com.bd",
        dkim_selector: "mailchannels",
        dkim_private_key: context.env.DKIM_PRIVATE_KEY,
      },],
      from: { email: "contact@albin.com.bd", name: "Contact Form" },
      reply_to: { email: input.get("email") },
      subject: "Hello",
      content: [{
        type: "text/plain",
        value: input.get("message"),
      },],
    }),
  });

  let respContent = "";
  if (context.request.method == "POST") {
    const resp = await fetch(send_request);
    const respText = await resp.text();

    respContent = resp.status + " " + resp.statusText + "\n\n" + respText;
  }

  let htmlContent = `<html><head></head><body><p>Click to send message: <form method="post"><input type="submit" value="Send"/></form></p><pre>${respContent}</pre></body></html>`;
  return new Response(htmlContent, { headers: { "content-type": "text/html" }, });
}