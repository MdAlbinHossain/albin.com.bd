interface Env {
    KV: KVNamespace;
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {

    const responses = await getResponses(context.env.DB);

    return new Response(JSON.stringify(responses), {
        status: 200,
        statusText: 'OK',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'cache-control': 'no-store',
            'content-type': 'application/json',
        },
    });
}

async function getResponses(db: D1Database) {
    const query = 'SELECT * FROM FormResponses';

    const { results } = await db.prepare(query).all();

    return results;
}
