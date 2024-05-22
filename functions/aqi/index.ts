export interface Env {
    KV: KVNamespace;
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const request = context.request;

    const reqBody = await readRequestBody(request);

    try {
        const respBody = await createResponse(
            context.env.DB,
            JSON.stringify({ headers: Object.fromEntries(request.headers), body: reqBody })
        );

        return new Response(respBody.success === true ? "Accepted" : respBody.error || "Error", {
            status: respBody.success === true ? 200 : 500,
            statusText: respBody.success === true ? 'OK' : 'Internal Server Error',
            headers: {
                'content-type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
    catch (error: any) {
        return new Response(error.message, {
            status: 500,
            statusText: 'Internal Server Error',
            headers: {
                'content-type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }

};

async function createResponse(db: D1Database, data: string) {
    const query = 'INSERT INTO Milesight(ts, data) VALUES (?, ?)';

    const results = await db
        .prepare(query)
        .bind(Date.now(), data)
        .run();

    return results;
};

async function readRequestBody(request: Request) {
    const contentType = request.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await request.json();
    } else if (contentType && contentType.includes('application/text')) {
        return await request.text();
    } else if (contentType && contentType.includes('text/html')) {
        return await request.text();
    } else if (contentType && contentType.includes('form')) {
        return Object.fromEntries(await request.formData());
    } else {
        return String('a file or binary data');
    }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {

    try {
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
    catch (e: any) {
        return new Response(e.message, {
            status: 502,
            statusText: 'Server Error',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'cache-control': 'no-store',
                'content-type': 'application/json',
            },
        });
    }
}

async function getResponses(db: D1Database) {
    const query = 'SELECT * FROM Milesight';

    const { results } = await db.prepare(query).all();

    return results;
}
