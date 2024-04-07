export interface Env {
	KV: KVNamespace;
	DB: D1Database;
	// MY_BUCKET: R2Bucket;
}

type FormResponse = {
	id: string;
	formName: string;
	data: string;
};

export const createResponse = async (db: D1Database, response: FormResponse) => {
	const query = `INSERT INTO FormResponses(form_name, data) VALUES (?, ?)`;

	const results = await db
		.prepare(query)
		.bind(response.formName, response.data)
		.run();

	return results;
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
	const request = context.request;
	if (context.params.test) {
		const reqBody = await readRequestBody(request);

		return new Response(reqBody, {
			status: 200,
			statusText: 'OK',
			headers: {
				'content-type': 'text/plain',
				'Access-Control-Allow-Origin': '*',
			},
		});
	}

	const requestOrigin = request.headers.get('Origin');
	const allowedOrigins = ['https://albin.com.bd', 'https://mdalbinhossain.pages.dev'];

	if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
		const reqHeaders = await readRequestHeaders(request);
		const reqBody = await readRequestBody(request);
		const fullMessage = `<div>${reqBody}<div><div> <br/> <hr/> ${reqHeaders}</div>`;
		try {
			const respBody = await createResponse(context.env.DB, { id: "", formName: 'test', data: reqHeaders });

			return new Response(JSON.stringify(respBody), {
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

async function readRequestHeaders(request: Request) {
	const headers = request.headers.entries();
	let html = '<ul>';
	for (const header of headers) {
		html += `<li><strong>${header[0]}:</strong> ${header[1]}</li>`;
	}
	html += '</ul>';
	return html;
}

async function readRequestBody(request: Request): Promise<string> {
	const contentType = request.headers.get('content-type');
	if (contentType && contentType.includes('application/json')) {
		const jsonBody = await request.json();
		return `<pre>${JSON.stringify(jsonBody, null, 2)}</pre>`;
	} else if (contentType && contentType.includes('application/text')) {
		const textBody = await request.text();
		return `<pre>${textBody}</pre>`;
	} else if (contentType && contentType.includes('text/html')) {
		const htmlBody = await request.text();
		return htmlBody;
	} else if (contentType && contentType.includes('form')) {
		const formData = await request.formData();
		const body: { [key: string]: any } = {};
		for (const entry of formData.entries()) {
			body[entry[0]] = entry[1];
		}

		let html = '<ul>';
		for (const key in body) {
			html += `<li><strong>${key}:</strong> ${body[key]}</li>`;
		}
		html += '</ul>';

		return html;
	} else {
		return '<p>a file</p>';
	}
}
