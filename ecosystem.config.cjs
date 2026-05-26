module.exports = {
	apps: [
		{
			name: "blue-api",
			script: "src/index.js",
			interpreter: "node",
			instances: 1,
			exec_mode: "fork",
			watch: false,
			time: true,
			env: {
				NODE_ENV: "production",
			},
		},
	],
};
