import mailChannelsPlugin from "@cloudflare/pages-plugin-mailchannels";

export const onRequest: PagesFunction = (context) => mailChannelsPlugin({
    trunstile: false,
    personalizations: [
        {
            to: [{ name: "Albin", email: "mail@albin.com.bd" }],
            "dkim_domain": "albin.com.bd",
            "dkim_selector": "mailchannels",
            "dkim_private_key": context.env.DKIM_PRIVATE_KEY
        },
    ],
    from: {
        name: "Contact Form",
        email: "contact@albin.com.bd",
    },
    respondWith: () => {
        return new Response(
            `Thank you for submitting.`
        );
    },
})(context);