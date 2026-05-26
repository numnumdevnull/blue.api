const DEFAULT_ALLOWED_ORIGINS = [
	"http://localhost:3000",
	"https://blue.com.ua",
];

const allowedOrigins = (process.env.CORS_ORIGINS || "")
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

const corsOrigins =
	allowedOrigins.length > 0 ? allowedOrigins : DEFAULT_ALLOWED_ORIGINS;

function getRequestOrigin(req) {
	// Expect a Fetch API Request (`c.req`) or similar with `headers.get()`.
	if (!req || !req.headers || typeof req.headers.get !== "function") return "";

	return req.headers.get("origin") || "";
}

export function getCorsOrigin(req) {
	const requestOrigin = getRequestOrigin(req);

	// CORS работает только для браузерных запросов с Origin.
	// Если Origin нет, это может быть curl, Postman, backend-to-backend или healthcheck.
	if (!requestOrigin) {
		return "";
	}

	// Access-Control-Allow-Origin не принимает список доменов.
	// Поэтому мы проверяем Origin запроса и возвращаем его только если он в allow-list.
	if (corsOrigins.includes(requestOrigin)) {
		return requestOrigin;
	}

	return "";
}

function buildHeaders(corsOrigin) {
	const headers = {
		"Content-Type": "application/json",
	};

	if (corsOrigin) {
		headers["Access-Control-Allow-Origin"] = corsOrigin;
		headers["Vary"] = "Origin";
	}

	return headers;
}

export function sendJson(data, corsOrigin, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: buildHeaders(corsOrigin),
	});
}

export function sendOptions(corsOrigin) {
	return new Response(null, {
		status: 204,
		headers: {
			...buildHeaders(corsOrigin),
			"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
}
