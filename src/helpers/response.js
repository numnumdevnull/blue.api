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
	return req?.getHeader("origin") || "";
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

export function writeCorsHeaders(res, corsOrigin) {
	if (corsOrigin) {
		res.writeHeader("Access-Control-Allow-Origin", corsOrigin);
		res.writeHeader("Vary", "Origin");
	}
}

export function sendJson(res, corsOrigin, data, status = "200 OK") {
	res.writeStatus(status);
	writeCorsHeaders(res, corsOrigin);
	res.writeHeader("Content-Type", "application/json");
	res.end(JSON.stringify(data));
}

export function sendOptions(res, corsOrigin) {
	writeCorsHeaders(res, corsOrigin);
	res.writeHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, PATCH, DELETE, OPTIONS",
	);
	res.writeHeader(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization",
	);
	res.end();
}
