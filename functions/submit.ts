export async function onRequestPost(context) {
  const request = context.request
  let respContent = "";

  if (request.method == "POST") {
    let input = await request.formData();
    const name = input.get("name") ?? "Anonymous"
    const email = (input.get("from") ?? input.get("email")) ?? "contact@albin.com.bd"
    const phone = input.get("phone") ?? ""
    const message = input.get("message")

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
          to: [...new Set(to)],
          dkim_domain: "albin.com.bd",
          dkim_selector: "mailchannels",
          dkim_private_key: context.env.DKIM_PRIVATE_KEY,
        },],
        from: { email: input.get("from") ?? "contact@albin.com.bd", name: name },
        reply_to: { email: email, name: name },
        subject: input.get("subject") ?? name + " - Form Submission",
        content: [{
          type: "text/html",
          value:
            `<!DOCTYPE html>
            <html>
              <body>
                <p>${message}</p>
                <br>
                <p>${input.get("name") ?? ""}</p>
                <p>${input.get("email") ?? ""}</p>
                <p>${phone}</p>
                <p>Sent from ${request.headers.get("CF-Connecting-IP")}, ${request.headers.get("CF-IPCountry")}</p>
              </body>
            </html>`,
        },],
      }),
    });

    const resp = await fetch(send_request);
    const respText = await resp.text();

    if (resp.statusText == "Accepted") respContent = "Thanks! I will get back to you soon.";
    else respContent = resp.status + " " + resp.statusText + "\n\n" + respText;
  }
  else respContent = "Method Not Allowed";

  let htmlContent = `<html><head></head><body><h1 style="text-align:center; margin-top:40px">${respContent}</h1></body></html>`;
  return new Response(htmlContent, { headers: { "content-type": "text/html" }, });
}