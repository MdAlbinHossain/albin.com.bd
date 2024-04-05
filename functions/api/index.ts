export interface Env {
	// MY_KV_NAMESPACE: KVNamespace;
	// MY_DB: D1Database;
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	// MY_BUCKET: R2Bucket;
	// MY_SERVICE: Fetcher;
	// MY_QUEUE: Queue;
}

export const onRequest: PagesFunction<Env> = async (context) => {
	return new Response(JSON.stringify({
		headers: Object.fromEntries(context.request.headers),
	}),
		{ headers: { 'content-type': 'application/json' } });
}