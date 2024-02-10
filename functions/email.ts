export async function onRequestPost(context) {
  const request = context.request
  let respContent = "";

  let input = await request.formData();
  const sender = { email: "mail@albin.com.bd", name: "Md. Albin Hossain" };
  const subject = input.get("subject")
  const message = input.get("message")

  let to = [{ email: "to@albin.com.bd" }];
  let cc = [{ email: "cc@albin.com.bd" }];

  if (input.get("password") == context.env.PASSWORD) {
    let arr = input.get("to").split(",");
    if (arr.length > 0) to = arr.map((toEmail) => { return { email: toEmail.trim() }; });

    arr = input.get("cc").split(",");
    if (arr.length > 0) cc = arr.map((ccEmail) => { return { email: ccEmail.trim() }; });
  }

  let send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json", },
    body: JSON.stringify({
      personalizations: [{
        to: Array.from(new Set(to)),
        cc: [],
        bcc: [{ email: "md.albin.hossain@hotmail.com" }],
        dkim_domain: "albin.com.bd",
        dkim_selector: "mailchannels",
        dkim_private_key: context.env.DKIM_PRIVATE_KEY,
      },],
      from: sender,
      subject: subject,
      content: [{
        type: "text/html",
        value: message,
      }],
    }),
  });

  const resp = await fetch(send_request);
  const respText = await resp.text();

  if (resp.statusText == "Accepted") respContent = message;
  else respContent = resp.status + " " + resp.statusText + "\n\n" + respText;

  return new Response(respContent+JSON.stringify(cc), { headers: { "content-type": "text/html" }, });
}