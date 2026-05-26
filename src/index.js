import "dotenv/config";
import uWS from "uWebSockets.js";

import * as categoriesController from "./controllers/categories.js";
import * as productsController from "./controllers/products.js";
import { getCorsOrigin, sendJson, sendOptions } from "./helpers/response.js";
import { loadCategories } from "./models/categories.js";

const PORT = process.env.PORT || 3001;

loadCategories();

uWS
	.App()
	.options("/*", (res, req) => {
		const corsOrigin = getCorsOrigin(req);

		res.cork(() => {
			sendOptions(res, corsOrigin);
		});
	})
	// .get("/", (res) => {
	// 	res.end("Hello");
	// })
	.get("/v1/categories", categoriesController.getCategories)
	.post("/v1/categories/reload", categoriesController.reloadCategories)
	.get("/v1/products", productsController.getProducts)
	.get("/v1/products/:id", productsController.getProduct)
	.any("/*", (res, req) => {
		const corsOrigin = getCorsOrigin(req);

		res.cork(() => {
			sendJson(res, corsOrigin, { error: "Not Found" }, "404 Not Found");
		});
	})
	.listen("0.0.0.0", PORT, (token) => {
		if (token) {
			console.log(`Listening on port ${PORT}`);
		} else {
			console.log("Failed to listen");
		}
	});
