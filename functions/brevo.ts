export async function onRequestPost(context) {
    let input = await context.request.formData();
    let send_request = new Request("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "accept": "application/json",
            "api-key": "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",
            "content-type": "application/json",
        },
        body: JSON.stringify({
            sender: {
                name: input.get("name") ?? "Contact Form",
                email: "contact@albin.com.bd",
            },
            to: [{ "email": "md.albin.hossain@hotmail.com", }],
            replyTo: { email: input.get("email") ?? "contact@albin.com.bd" },
            subject: input.get("subject") ?? "Contact Form",
            textContent: input.get("message") + "\n\nSent from " + context.request.headers.get("CF-Connecting-IP").toString() + " at " + new Date().toISOString(),
        }),
    });

    let respContent = "";
    const resp = await fetch(send_request);
    const respText = await resp.text();

    respContent = resp.status + " " + resp.statusText + "\n\n" + respText;
    let htmlContent = `<html><head></head><body><h1 style="text-align:center; margin-top:40px">${respContent}</h1></body></html>`;
    return new Response(htmlContent, { headers: { "content-type": "text/html" }, });
}