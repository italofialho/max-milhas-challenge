// next.config.js
const withImages = require("next-images");
const webpack = require("webpack");
const withCSS = require("@zeit/next-css");
const withPlugins = require("next-compose-plugins");
const withSourceMaps = require("@zeit/next-source-maps");

module.exports = withPlugins(
	[
		[
			withSourceMaps,
			{
				devtool: "hidden-source-map",
			},
		],
		[withImages],
		[withCSS],
	],
	{
		distDir: "build",
		useFileSystemPublicRoutes: false,
		publicRuntimeConfig: {},
		assetPrefix: "",
		webpack: (config, options) => {
			config.plugins.push(
				new webpack.DefinePlugin({
					"process.env.BUILD_ID": JSON.stringify(options.buildId),
				}),
			);
			return config;
		},
	},
);
