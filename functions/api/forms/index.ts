export interface Env {
	KV: KVNamespace;
	DB: D1Database;
}

type FormResponse = {
	id: string;
	form_name: string;
	data: string;
};


export const onRequestPost: PagesFunction<Env> = async (context) => {
	const request = context.request;
	if (context.params.test) {
		const reqBody = await readRequestBody(request);

		return new Response(JSON.stringify(reqBody), {
			status: 200,
			statusText: 'OK',
			headers: {
				'content-type': 'text/plain',
				'Access-Control-Allow-Origin': '*',
			},
		});
	}

	const requestOrigin = request.headers.get('Origin');
	const allowedOrigins = ['https://albin.com.bd', 'https://mdalbinhossain.pages.dev', 'https://dev.mdalbinhossain.pages.dev', 'https://email.mdalbinhossain.workers.dev'];

	if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
		const reqBody = await readRequestBody(request);
		try {
			const respBody = await createResponse(
				context.env.DB,
				{
					id: "", form_name: request.url,
					data: JSON.stringify({ headers: Object.fromEntries(request.headers), body: reqBody })
				});

			return new Response(respBody.success === true ? "Accepted" : respBody.error || "Error", {
				status: respBody.success === true ? 200 : 500,
				statusText: respBody.success === true ? 'OK' : 'Internal Server Error',
				headers: {
					'content-type': 'text/plain',
					'Access-Control-Allow-Origin': requestOrigin,
				},
			});
		}
		catch (error: any) {
			return new Response(error.message, {
				status: 500,
				statusText: 'Internal Server Error',
				headers: {
					'content-type': 'text/plain',
					'Access-Control-Allow-Origin': requestOrigin,
				},
			});
		}
	}
	return Response.redirect('https://albin.com.bd', 301);
};

async function createResponse(db: D1Database, response: FormResponse) {
	const query = 'INSERT INTO FormResponses(form_name, data) VALUES (?, ?)';

	const results = await db
		.prepare(query)
		.bind(response.form_name, response.data)
		.run();

	return results;
};

async function readRequestBody(request: Request) {
	const contentType = request.headers.get('content-type');
	if (contentType && contentType.includes('application/json')) {
		return String(await request.json());
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
