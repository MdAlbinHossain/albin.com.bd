
import { Buffer } from "buffer";

const encoder = new TextEncoder();

export interface Env {
	KV: KVNamespace;
	DB: D1Database;
	PASSWORD: string;
}

type FormResponse = {
	id: string;
	form_name: string;
	data: string;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
	const request = context.request;
	const requestOrigin = request.headers.get('Origin');
	const allowedOrigins = ['https://albin.com.bd', 'https://mdalbinhossain.pages.dev', 'https://dev.mdalbinhossain.pages.dev'];

	const authenticated = await authenticate(request, context.env);

	if (!authenticated) {
		return new Response("You need to login.", {
			status: 401,
			headers: {
				"WWW-Authenticate": 'Basic realm="my scope", charset="UTF-8"',
			},
		});
	}


	// if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
	const responses = await getResponses(context.env.DB);

	return new Response(JSON.stringify(responses), {
		status: 200,
		statusText: 'OK',
		headers: {
			'Access-Control-Allow-Origin': requestOrigin || '*',
			'cache-control': 'no-store',
			'content-type': 'application/json',
		},
	});
	// }
	// return Response.redirect('https://albin.com.bd', 301);
}

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
	const allowedOrigins = ['https://albin.com.bd', 'https://mdalbinhossain.pages.dev', 'https://dev.mdalbinhossain.pages.dev'];

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

function timingSafeEqual(a: string, b: string) {
	const aBytes = encoder.encode(a);
	const bBytes = encoder.encode(b);

	if (aBytes.byteLength !== bBytes.byteLength) {
		// Strings must be the same length in order to compare
		// with crypto.subtle.timingSafeEqual
		return false;
	}

	return crypto.subtle.timingSafeEqual(aBytes, bBytes);
}

async function authenticate(request: Request, env: Env) {
	const BASIC_USER = "albin";
	const BASIC_PASS = env.PASSWORD ?? "adminpass";

	const authorization = request.headers.get("Authorization");
	if (!authorization) {
		return new Response("You need to login.", {
			status: 401,
			headers: {
				"WWW-Authenticate": 'Basic realm="my scope", charset="UTF-8"',
			},
		});
	}
	const [scheme, encoded] = authorization.split(" ");
	if (!encoded || scheme !== "Basic") {
		return new Response("Malformed authorization header.", {
			status: 400,
		});
	}

	const credentials = Buffer.from(encoded, "base64").toString();

	const index = credentials.indexOf(":");
	const user = credentials.substring(0, index);
	const pass = credentials.substring(index + 1);

	if (
		!timingSafeEqual(BASIC_USER, user) ||
		!timingSafeEqual(BASIC_PASS, pass)
	) {
		return false;
	}

	return true;
}

async function createResponse(db: D1Database, response: FormResponse) {
	const query = 'INSERT INTO FormResponses(form_name, data) VALUES (?, ?)';

	const results = await db
		.prepare(query)
		.bind(response.form_name, response.data)
		.run();

	return results;
};

async function getResponses(db: D1Database) {
	const query = 'SELECT * FROM FormResponses';

	const { results } = await db.prepare(query).all();

	return results;
}

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
