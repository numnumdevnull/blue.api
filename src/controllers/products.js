import { getCorsOrigin, sendJson } from "../helpers/response.js";
import * as productsModel from "../models/products.js";

/*
 * Важно для uWebSockets.js:
 *
 * Это не Express/Fastify, где можно просто сделать await и потом спокойно
 * использовать response. В uWebSockets.js объект res привязан к живому
 * HTTP-соединению, а req доступен только синхронно внутри route handler.
 * Пока мы ждем асинхронную операцию, например запрос в Redis, клиент может
 * закрыть вкладку, отменить запрос или потерять соединение.
 *
 * res.onAborted() нужен, чтобы узнать, что соединение уже закрыто. После abort
 * нельзя писать в res: нельзя вызывать sendJson(), res.end(), writeHeader()
 * и похожие методы. Поэтому после каждого await мы проверяем aborted и просто
 * выходим, если клиент уже ушел.
 *
 * req после await тоже трогать нельзя. Поэтому все, что нужно из request,
 * например Origin для CORS, мы читаем заранее и дальше передаем обычное
 * значение, а не сам req.
 *
 * res.cork() нужен, когда мы пишем ответ после асинхронного кода. Он группирует
 * writeStatus/writeHeader/end в одну безопасную операцию для uWebSockets.js.
 * Это помогает избежать странного поведения соединения и сохраняет быстрый
 * путь записи ответа.
 *
 * Поэтому паттерн для async-контроллеров здесь такой:
 * 1. подписаться на res.onAborted();
 * 2. сделать await к модели/БД;
 * 3. если aborted === true, ничего не отправлять;
 * 4. отправлять ответ только внутри res.cork().
 */
export async function getProducts(res, req) {
	let aborted = false;
	const corsOrigin = getCorsOrigin(req);

	res.onAborted(() => {
		aborted = true;
	});

	try {
		const products = await productsModel.getProducts();

		if (aborted) {
			return;
		}

		res.cork(() => {
			sendJson(res, corsOrigin, products);
		});
	} catch (error) {
		if (aborted) {
			return;
		}

		console.error(error);

		res.cork(() => {
			sendJson(
				res,
				corsOrigin,
				{
					message: "Failed to get products",
					code: "GET_PRODUCTS_ERROR",
				},
				"500 Internal Server Error",
			);
		});
	}
}

export async function getProduct(res, req) {
	let aborted = false;
	const corsOrigin = getCorsOrigin(req);
	const id = req.getParameter(0);

	res.onAborted(() => {
		aborted = true;
	});

	try {
		const product = await productsModel.getProduct(id);

		if (aborted) {
			return;
		}

		if (!product) {
			res.cork(() => {
				sendJson(
					res,
					corsOrigin,
					{
						message: "Product not found",
						code: "PRODUCT_NOT_FOUND",
					},
					"404 Not Found",
				);
			});

			return;
		}

		res.cork(() => {
			sendJson(res, corsOrigin, product);
		});
	} catch (error) {
		if (aborted) {
			return;
		}

		console.error(error);

		res.cork(() => {
			sendJson(
				res,
				corsOrigin,
				{
					message: "Failed to get product",
					code: "GET_PRODUCT_ERROR",
				},
				"500 Internal Server Error",
			);
		});
	}
}
