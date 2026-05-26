import { getRedis } from "../config/redis.js";

const PRODUCTS_KEY = process.env.REDIS_PRODUCTS_KEY || "products";

export async function getProducts() {
	const client = await getRedis();
	const rawProducts = await client.get(PRODUCTS_KEY);

	if (!rawProducts) {
		return [];
	}

	const products = JSON.parse(rawProducts);

	if (!Array.isArray(products)) {
		throw new Error(`Redis key "${PRODUCTS_KEY}" must contain a JSON array`);
	}

	return products;
}

export async function getProduct(id) {
	const products = await getProducts();

	return products.find((product) => String(product.id) === String(id));
}
