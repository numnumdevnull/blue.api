import { openCategoriesDb } from "../config/sqlite.js";

let categoriesCache = {
	items: [],
	loadedAt: null,
};

function buildCategoryTree(rows) {
	const categoriesById = new Map();
	const roots = [];

	for (const row of rows) {
		categoriesById.set(row.id, {
			id: String(row.id),
			parentId: row.parent_id === null ? null : String(row.parent_id),
			slug: row.slug,
			name: row.name,
			sortOrder: row.sort_order,
			children: [],
		});
	}

	for (const category of categoriesById.values()) {
		if (category.parentId === null) {
			roots.push(category);
			continue;
		}

		const parent = categoriesById.get(Number(category.parentId));

		if (parent) {
			parent.children.push(category);
		}
	}

	return roots;
}

export function loadCategories() {
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

		const rows = db
			.prepare(`
				SELECT id, parent_id, slug, name, sort_order
				FROM categories
				WHERE is_active = 1
				ORDER BY parent_id IS NOT NULL, parent_id, sort_order, id
			`)
			.all();

		categoriesCache = {
			items: buildCategoryTree(rows),
			loadedAt: new Date().toISOString(),
		};

		return categoriesCache;
	} finally {
		db.close();
	}
}

export function getCategories() {
	return categoriesCache;
}
