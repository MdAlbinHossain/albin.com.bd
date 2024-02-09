export async function onRequestPost(context) {
  const request = context.request
  let respContent = "";

  let input = await request.formData();
  const name = input.get("name") ?? "Md. Albin Hossain"
  const email = input.get("from") ?? "mail@albin.com.bd"
  const subject = input.get("subject")
  const message = input.get("message")

  let to = [];
  let cc = [];
  let bcc = [{ email: email, name: name }];

  if (input.get("password") == context.env.PASSWORD) {
    let arr = input.get("to").split(",");
    if (arr.length > 0) to = arr.map((email) => { return { email: email.trim() }; });

    arr = input.get("cc").split(",");
    if (arr.length > 0) cc = arr.map((email) => { return { email: email.trim() }; });

    arr = input.get("bcc").split(",");
    if (arr.length > 0) bcc = bcc.concat(arr.map((email) => { return { email: email.trim() }; }));
  }
  let send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json", },
    body: JSON.stringify({
      personalizations: [{
        to: [,...new Set(to)],
        cc: [...new Set(cc)],
        bcc: [...new Set(bcc)],
        dkim_domain: "albin.com.bd",
        dkim_selector: "mailchannels",
        dkim_private_key: context.env.DKIM_PRIVATE_KEY,
      },],
      from: { email: email, name: name },
      subject: subject,
      content: [{
        type: "text/html",
        value: message,
      },],
    }),
  });

  const resp = await fetch(send_request);
  const respText = await resp.text();

  if (resp.statusText == "Accepted") respContent = message;
  else respContent = resp.status + " " + resp.statusText + "\n\n" + respText;

  return new Response(respContent, { headers: { "content-type": "text/html" }, });
}