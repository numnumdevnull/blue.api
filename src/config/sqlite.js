import "dotenv/config";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

export const categoriesDbPath = resolve(
	process.env.CATEGORIES_DB_PATH || "data/categories.sqlite",
);

mkdirSync(dirname(categoriesDbPath), { recursive: true });

export function openCategoriesDb() {
	return new DatabaseSync(categoriesDbPath);
}
