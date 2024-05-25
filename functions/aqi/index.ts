export interface Env {
    KV: KVNamespace;
    DB: D1Database;
}

type SensorEvent = {
    "eventId": string,
    "eventCreatedTime": number,
    "eventVersion": string,
    "eventType": string,
    "data": {
        "deviceProfile": {
            "deviceId": string,
            "sn": string,
            "devEUI": string,
            "name": string
        },
        "type": string,
        "tslId": string | null,
        "payload": {
            "temperature": number,
            "humidity": number,
            "pir_status": number,
            "als_level": number,
            "co2": number,
            "tvoc_level": number,
            "tvoc": number,
            "pressure": number,
            "buzzer_status": number
        }
    }
}

type Payload = {
    ts: number,
    deviceId: string,
    deviceName: string,
    temperature: number,
    humidity: number,
    pir_status: number,
    als_level: number,
    co2: number,
    tvoc_level: number,
    tvoc: number,
    pressure: number,
    buzzer_status: number
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const request = context.request;

    const reqBody: SensorEvent = await request.json();

    try {
        const respBody = await createResponse(
            context.env.DB,
            {
                ts: reqBody.eventCreatedTime,
                deviceId: reqBody.data.deviceProfile.deviceId,
                deviceName: reqBody.data.deviceProfile.name,
                temperature: reqBody.data.payload.temperature,
                humidity: reqBody.data.payload.humidity,
                pir_status: reqBody.data.payload.pir_status,
                als_level: reqBody.data.payload.als_level,
                co2: reqBody.data.payload.co2,
                tvoc_level: reqBody.data.payload.tvoc_level,
                tvoc: reqBody.data.payload.tvoc,
                pressure: reqBody.data.payload.pressure,
                buzzer_status: reqBody.data.payload.buzzer_status
            }
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

async function createResponse(db: D1Database, data: Payload) {
    const query = 'INSERT INTO Milesight(ts,deviceId,deviceName,temperature,humidity,pir_status,als_level,co2,tvoc_level,tvoc,pressure,buzzer_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    const results = await db
        .prepare(query)
        .bind(
            data.ts,
            data.deviceId,
            data.deviceName,
            data.temperature,
            data.humidity,
            data.pir_status,
            data.als_level,
            data.co2,
            data.tvoc_level,
            data.tvoc,
            data.pressure,
            data.buzzer_status)
        .run();

    return results;
};

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
