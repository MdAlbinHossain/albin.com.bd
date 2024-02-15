import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext';

export interface Env {
	SENDER: { name: string; addr: string };
	RECIPIENT1: { name: string; addr: string };
	RECIPIENT2: { name: string; addr: string };
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
				const fullMessage = `<div>${reqBody}<div><div> <br/> <hr/> ${reqHeaders}</div>`;
				const respBody = await sendEmail(fullMessage, env);
				return new Response(respBody, {
					status: respBody === 'Accepted' ? 200 : 500,
					statusText: respBody === 'Accepted' ? 'OK' : 'Internal Server Error',
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

async function sendEmail(message: string, env: Env) {
	const msg1 = createMimeMessage();
	msg1.setSender(env.SENDER);
	msg1.setRecipient(env.RECIPIENT1);
	msg1.setSubject('Form Submission');
	msg1.addMessage({
		contentType: 'text/html',
		data: message,
	});
	const msg2 = createMimeMessage();
	msg2.setSender(env.SENDER);
	msg2.setRecipient(env.RECIPIENT2);
	msg2.setSubject('Form Submission');
	msg2.addMessage({
		contentType: 'text/html',
		data: message,
	});

	var emailMessage1 = new EmailMessage(env.SENDER.addr, env.RECIPIENT1.addr, msg1.asRaw());
	var emailMessage2 = new EmailMessage(env.SENDER.addr, env.RECIPIENT2.addr, msg2.asRaw());
	try {
		await env.SEB.send(emailMessage1);
		await env.SEB.send(emailMessage2);
	} catch (e: any) {
		return e.message;
	}

	return 'Accepted';
}
