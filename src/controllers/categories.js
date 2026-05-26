import { getCorsOrigin, sendJson } from "../helpers/response.js";
import * as categoriesModel from "../models/categories.js";

export function getCategories(res, req) {
	const corsOrigin = getCorsOrigin(req);

	res.cork(() => {
		sendJson(res, corsOrigin, categoriesModel.getCategories());
	});
}

export function reloadCategories(res, req) {
	const corsOrigin = getCorsOrigin(req);

	try {
		const categories = categoriesModel.loadCategories();

		res.cork(() => {
			sendJson(res, corsOrigin, categories);
		});
	} catch (error) {
		console.error(error);

		res.cork(() => {
			sendJson(
				res,
				corsOrigin,
				{
					message: "Failed to reload categories",
					code: "RELOAD_CATEGORIES_ERROR",
				},
				"500 Internal Server Error",
			);
		});
	}
}
