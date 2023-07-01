import mailChannelsPlugin from "@cloudflare/pages-plugin-mailchannels";

export const onRequest: PagesFunction = (context) => mailChannelsPlugin({
  personalizations: [
    {
      to: [{ name: "Support", email: "support@albin.com.bd" }],
      "dkim_domain": "albin.com.bd",
      "dkim_selector": "mailchannels",
      "dkim_private_key": context.env.DKIM_PRIVATE_KEY
    },
  ],
  from: {
    name: "Support",
    email: "support@albin.com.bd",
  },
  respondWith: () => {
    return new Response(
      `Thank you for submitting your enquiry. A member of the team will be in touch shortly.`
    );
  },
})(context);