export const onRequest: PagesFunction = async (context) => {
    return new Response(JSON.stringify({
        headers: Object.fromEntries(context.request.headers),
    }),
        { headers: { 'content-type': 'application/json' } });
}