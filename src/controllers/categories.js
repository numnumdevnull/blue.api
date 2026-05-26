import { getCorsOrigin, sendJson } from "../helpers/response.js";
import * as categoriesModel from "../models/categories.js";

export function getCategories(c) {
	const corsOrigin = getCorsOrigin(c.req);
	return sendJson(categoriesModel.getCategories(), corsOrigin);
}

export function reloadCategories(c) {
	const corsOrigin = getCorsOrigin(c.req);

	try {
		const categories = categoriesModel.loadCategories();
		return sendJson(categories, corsOrigin);
	} catch (error) {
		console.error(error);
		return sendJson(
			{
				message: "Failed to reload categories",
				code: "RELOAD_CATEGORIES_ERROR",
			},
			corsOrigin,
			500,
		);
	}
}
