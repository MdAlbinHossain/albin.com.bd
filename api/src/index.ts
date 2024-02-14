import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext';

export interface Env {
	SENDER: { name: string; addr: string };
	RECIPIENT: { name: string; addr: string };
	SEB: any;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.url.includes('/test')) {
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
			if (request.method === 'POST') {
				const reqHeaders = await readRequestHeaders(request);
				const reqBody = await readRequestBody(request);
				const respBody = await sendEmail(reqHeaders + "\n" + reqBody, env);
				return new Response(respBody, {
					status: 200,
					statusText: 'OK',
					headers: {
						'content-type': 'text/plain',
						'Access-Control-Allow-Origin': requestOrigin,
					},
				});
			}
		}
		return new Response('Forbidden', { status: 403, statusText: 'Forbidden' });
	},
};

async function readRequestHeaders(request: Request) {
	const headers = request.headers.entries();
	const headerObj: { [key: string]: any } = {};
	for (const header of headers) {
		headerObj[header[0]] = header[1];
	}
	return JSON.stringify(headerObj);
}

async function readRequestBody(request: Request) {
	const contentType = request.headers.get('content-type');
	if (contentType && contentType.includes('application/json')) {
		return JSON.stringify(await request.json());
	} else if (contentType && contentType.includes('application/text')) {
		return request.text();
	} else if (contentType && contentType.includes('text/html')) {
		return request.text();
	} else if (contentType && contentType.includes('form')) {
		const formData = await request.formData();
		const body: { [key: string]: any } = {};
		for (const entry of formData.entries()) {
			body[entry[0]] = entry[1];
		}

		return JSON.stringify(body);
	} else {
		return 'a file';
	}
}

async function sendEmail(message: string, env: Env) {
	const msg = createMimeMessage();
	msg.setSender(env.SENDER);
	msg.setRecipient(env.RECIPIENT);
	msg.setSubject('Form Submission');
	msg.addMessage({
		contentType: 'text/plain',
		data: message,
	});

	var emailMessage = new EmailMessage(env.SENDER.addr, env.RECIPIENT.addr, msg.asRaw());
	try {
		await env.SEB.send(emailMessage);
	} catch (e: any) {
		return e.message;
	}

	return 'Message sent';
}
