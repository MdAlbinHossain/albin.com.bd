export async function onRequestPost(context) {
  const request = context.request
  const input = await request.formData();

  const sender = { email: "mail@albin.com.bd", name: "Md. Albin Hossain" };
  const subject = input.get("subject")
  const message = input.get("message")

  const toInput = input.get("to");
  const ccInput = input.get("cc");

  const to = (toInput.length > 0 && toInput != null && toInput != undefined) ? toInput.split(",").map((toEmail) => { return { email: toEmail.trim() }; }) : [];
  const cc = (ccInput.length > 0 && ccInput != null && ccInput != undefined) ? ccInput.split(",").map((ccEmail) => { return { email: ccEmail.trim() }; }) : [];

  if (input.get("password") == context.env.PASSWORD) {
    return await sendEmail(context, sender, to, cc, subject, message);
  }
  else {
    return new Response("Unauthorized", { status: 401, });
  }
}

async function sendEmail(context, sender, to, cc, subject, message) {
  const send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json", },
    body: JSON.stringify({
      personalizations: [{
        to: Array.from(new Set(to)),
        cc: Array.from(new Set(cc)),
        bcc: [{ email: "md.albin.hossain@icloud.com" }],
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
  
  return await fetch(send_request);
}