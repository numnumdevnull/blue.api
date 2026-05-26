import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

import * as categoriesController from "./controllers/categories.js";
import * as productsController from "./controllers/products.js";
import { getCorsOrigin, sendJson, sendOptions } from "./helpers/response.js";
import { loadCategories } from "./models/categories.js";

const PORT = Number(process.env.PORT || 3001);

loadCategories();

const app = new Hono();

app.options("/*", (c) => {
	const corsOrigin = getCorsOrigin(c.req);
	return sendOptions(corsOrigin);
});

app.get("/v1/categories", categoriesController.getCategories);
app.post("/v1/categories/reload", categoriesController.reloadCategories);
app.get("/v1/products", productsController.getProducts);
app.get("/v1/products/:id", productsController.getProductById);
app.all("/*", (c) => {
	const corsOrigin = getCorsOrigin(c.req);
	return sendJson({ error: "Not Found" }, corsOrigin, 404);
});

serve({ fetch: app.fetch.bind(app), port: PORT }, (info) => {
	const port = typeof info === "number" ? info : info?.port || PORT;
	console.log(`Listening on port ${port}`);
});
