export async function onRequestPost(context) {
  let input = await context.request.formData();
  let send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json", },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: "mail@albin.com.bd", name: "Albin" },],
        dkim_domain: "albin.com.bd",
        dkim_selector: "mailchannels",
        dkim_private_key: context.env.DKIM_PRIVATE_KEY,
      },],
      from: { email: "contact@albin.com.bd", name: input.get("name") },
      reply_to: { email: input.get("email"), name: input.get("name") },
      subject: input.get("subject"),
      content: [{
        type: "text/html",
        value: input.get("message"),
      },],
    }),
  });

  let respContent = "";
  if (context.request.method == "POST") {
    const resp = await fetch(send_request);
    const respText = await resp.text();

    if (resp.statusText == "Accepted") respContent = "<h2>Thank you " + input.get("name") + ".</h2><h3>We recieved your message.</h3>";
    else respContent = resp.status + " " + resp.statusText + "\n\n" + respText;
  }

  let htmlContent = `<html><head></head><body><pre>${respContent}</pre></body></html>`;
  return new Response(htmlContent, { headers: { "content-type": "text/html" }, });
}