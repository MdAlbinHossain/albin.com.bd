export interface Env {
	// MY_KV_NAMESPACE: KVNamespace;
	// MY_DB: D1Database;
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	// MY_BUCKET: R2Bucket;
	// MY_SERVICE: Fetcher;
	// MY_QUEUE: Queue;
}

export const onRequest: PagesFunction<Env> = async (context) => {
	// const value = await context.env.KV.get('example');
 	return new Response("Hello World");
}