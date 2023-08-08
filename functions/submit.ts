export async function onRequestPost(context) {
  let input = await context.request.formData();
  let send_request = new Request("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "accept": "application/json", "api-key": context.env.BREVO_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({
      sender: { name: input.get("name") ?? "Form Response", email: "form@albin.com.bd", },
      to: [{ "email": "md.albin.hossain@hotmail.com", }],
      replyTo: { email: input.get("email") ?? "form@albin.com.bd" },
      subject: input.get("subject") ?? "Form Response",
      textContent: input.get("message") + "\n\nSent from " + context.request.headers.get("CF-Connecting-IP").toString(),
    }),
  });

  let respContent = "";
  const resp = await fetch(send_request);
  const respText = await resp.text();

  if (resp.statusText == "Created") respContent = "Thank You!";
  else respContent = resp.status + " " + resp.statusText + "\n\n" + respText;

  let htmlContent = `<html><head></head><body><h1 style="text-align:center; margin-top:40px">${respContent}</h1></body></html>`;
  return new Response(htmlContent, { headers: { "content-type": "text/html" }, });
}