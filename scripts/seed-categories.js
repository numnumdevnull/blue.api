import { openCategoriesDb } from "../src/config/sqlite.js";

const categories = [
	{ id: 1, parentId: null, slug: "clothes", name: "Одяг", sortOrder: 10 },
	{ id: 2, parentId: 1, slug: "t-shirts", name: "Футболки", sortOrder: 10 },
	{ id: 3, parentId: 1, slug: "hoodies", name: "Худі", sortOrder: 20 },
	{ id: 4, parentId: 1, slug: "jeans", name: "Джинси", sortOrder: 30 },
	{ id: 5, parentId: null, slug: "shoes", name: "Взуття", sortOrder: 20 },
	{ id: 6, parentId: 5, slug: "sneakers", name: "Кросівки", sortOrder: 10 },
	{ id: 7, parentId: 5, slug: "boots", name: "Черевики", sortOrder: 20 },
	{
		id: 8,
		parentId: null,
		slug: "accessories",
		name: "Аксесуари",
		sortOrder: 30,
	},
	{ id: 9, parentId: 8, slug: "bags", name: "Сумки", sortOrder: 10 },
	{ id: 10, parentId: 8, slug: "caps", name: "Кепки", sortOrder: 20 },
	{
		id: 11,
		parentId: null,
		slug: "electronics",
		name: "Електроніка",
		sortOrder: 40,
	},
	{
		id: 12,
		parentId: 11,
		slug: "headphones",
		name: "Навушники",
		sortOrder: 10,
	},
];

const db = openCategoriesDb();

try {
	db.exec(`
		CREATE TABLE IF NOT EXISTS categories (
			id INTEGER PRIMARY KEY,
			parent_id INTEGER REFERENCES categories(id),
			slug TEXT NOT NULL UNIQUE,
			name TEXT NOT NULL,
			sort_order INTEGER NOT NULL DEFAULT 0,
			is_active INTEGER NOT NULL DEFAULT 1
		);
	`);

	const insertCategory = db.prepare(`
		INSERT INTO categories (id, parent_id, slug, name, sort_order, is_active)
		VALUES (?, ?, ?, ?, ?, 1)
		ON CONFLICT(id) DO UPDATE SET
			parent_id = excluded.parent_id,
			slug = excluded.slug,
			name = excluded.name,
			sort_order = excluded.sort_order,
			is_active = excluded.is_active
	`);

	db.exec("BEGIN");

	try {
		for (const category of categories) {
			insertCategory.run(
				category.id,
				category.parentId,
				category.slug,
				category.name,
				category.sortOrder,
			);
		}

		db.exec("COMMIT");
	} catch (error) {
		db.exec("ROLLBACK");
		throw error;
	}

	console.log(`Seeded ${categories.length} categories`);
} finally {
	db.close();
}
