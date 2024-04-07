export interface Env {
    // MY_KV_NAMESPACE: KVNamespace;
    // MY_DB: D1Database;
    // MY_DURABLE_OBJECT: DurableObjectNamespace;
    // MY_BUCKET: R2Bucket;
    // MY_SERVICE: Fetcher;
    // MY_QUEUE: Queue;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    return new Response("Hello " + context.params.user || 'world', { headers: { 'content-type': 'text/plain' } });
}