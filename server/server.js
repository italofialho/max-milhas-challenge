const dotenv = require("dotenv");

dotenv.config({ silent: true });

const express = require("express");
const next = require("next");
const cors = require("cors");
const bodyParser = require("body-parser");
const LRUCache = require("lru-cache");

const { parse } = require("url");
const path = require("path");
const compression = require("compression");
const minifyHtml = require("express-minify-html");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.ENVIRONMENT !== "production";
const app = next({ dev });

const apiRouter = require("./api");

const handle = app.getRequestHandler();
const moment = require("moment");

const ssrCache = new LRUCache({
	max: 100 * 1024 * 1024 /* cache size will be 100 MB using `return n.length` as length() function */,
	length: (n, key) => {
		return n.length;
	},
	maxAge: 1000 * 60 * 60 * 24 * 7, //! 7 dias de cache
});

function getCacheMaxAge() {
	// ? Calcula a diferença entre quando o cache iniciou e quantos dias faltam para o proximo domingo as 3 da manha
	const now = moment();
	const maxCacheDay = moment()
		.day("Sunday")
		.add(1, "week")
		.set({ h: 3, m: 0, s: 0 });
	return maxCacheDay.valueOf() - now.valueOf();
}

function getCacheKey(req) {
	return `${req.path}`;
}

async function renderAndCache(req, res, component, params = null) {
	const key = getCacheKey(req);

	if (process.env.ENVIRONMENT === "production" && ssrCache.has(key)) {
		res.setHeader("x-cache", "HIT");
		res.send(ssrCache.get(key));
		return;
	}

	try {
		const html = await app.renderToHTML(req, res, component, params || req.query);

		if (res.statusCode !== 200) {
			res.send(html);

			return;
		}

		if (process.env.ENVIRONMENT === "production") {
			ssrCache.set(key, html, getCacheMaxAge());
			res.setHeader("x-cache", "MISS");
		}

		res.send(html);
	} catch (err) {
		console.log("err:", err);
		app.renderError(err, req, res, req.path, req.query);
	}
}

app.prepare()
	.then(() => {
		const server = express();

		server.use(bodyParser.json());
		server.use(bodyParser.urlencoded({ extended: true }));

		server.use("/api", apiRouter);

		if (process.env.ENVIRONMENT === "production") {
			// ? Compress responses
			server.use(compression());

			// ? Minify html responses
			server.use(
				minifyHtml({
					override: true,
					htmlMinifier: {
						removeComments: true,
						collapseWhitespace: true,
						collapseBooleanAttributes: true,
						removeAttributeQuotes: true,
						removeEmptyAttributes: true,
						minifyJS: true,
					},
				}),
			);
		}

		server.get("/", (req, res) => {
			console.log("requested /");
			return renderAndCache(req, res, "/components/Home");
		});

		server.get("/home", (req, res) => {
			console.log("requested /home");
			return renderAndCache(req, res, "/components/Home");
		});

		server.get("*", (req, res) => {
			console.log("req.url:", req.url);
			const parsedUrl = parse(req.url, true);
			return handle(req, res, parsedUrl);
		});

		server.listen(port, err => {
			if (err) throw err;
			console.log(`Ready on port: ${port} - env: ${process.env.ENVIRONMENT}`);
		});
	})
	.catch(e => {
		console.error("app prepare error:", e);
	});
