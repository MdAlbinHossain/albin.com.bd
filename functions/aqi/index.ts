export interface Env {
    KV: KVNamespace;
    DB: D1Database;
}

const SENSOR_DATA_KEY = 'SENSOR_DATA_KEY';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const request = context.request;

    const reqBody = await readRequestBody(request);

    try {
        const respBody = await createResponse(
            context.env.KV,
            SENSOR_DATA_KEY,
            JSON.stringify(reqBody)
        );

        return new Response(respBody || "Error", {
            status: respBody !== null ? 200 : 500,
            statusText: respBody !== null ? 'OK' : 'Internal Server Error',
            headers: {
                'content-type': respBody !== null ? 'application/json' : 'text/plain',
                'Access-Control-Allow-Origin': '*',
                'cache-control': 'no-store',
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
                'cache-control': 'no-store',
            },
        });
    }

};

export const onRequestGet: PagesFunction<Env> = async (context) => {

    try {
        const responses = await getResponse(context.env.KV, SENSOR_DATA_KEY);

        return new Response(responses, {
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

async function createResponse(kv: KVNamespace, key: string, value: string) {
    await kv.put(key, value)
    return await kv.get(key)
};

async function getResponse(kv: KVNamespace, key: string) {
    return await kv.get(key)
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