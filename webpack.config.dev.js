/* eslint-disable global-require */
// Код для помощи в определении ошибки
// (function() {
//   var childProcess = require("child_process");
//   var oldSpawn = childProcess.spawn;
//   function mySpawn() {
//       console.log('spawn called');
//       console.log(arguments);
//       var result = oldSpawn.apply(this, arguments);
//       return result;
//   }
//   childProcess.spawn = mySpawn;
// })();

const path = require("path");
const fs = require("fs");
const webpack = require('webpack');
const {
	CleanWebpackPlugin,
} = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const ImageminPlugin = require('imagemin-webpack-plugin').default;
const imageminMozjpeg = require('imagemin-mozjpeg');
const ImageminWebpWebpackPlugin = require("imagemin-webp-webpack-plugin");

function generateHtmlPlugins(templateDir) {
	const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
	return templateFiles.map((item) => {
		const parts = item.split(".");
		const name = parts[0];
		const extension = parts[1];
		return new HtmlWebpackPlugin({
			filename: `${name}.html`,
			template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
			inject: false,
		});
	});
}

const htmlPlugins = generateHtmlPlugins("./src/html/views");

const config = {
	entry: ["./src/js/index.js", "./src/scss/style.scss"],
	output: {
		filename: "./js/bundle.js",
	},
	devtool: "source-map",
	mode: "production",
	optimization: {
		minimizer: [
			new TerserPlugin({
				sourceMap: true, // false - Отключить построение карты для js
				extractComments: true, // Удаляем комментарии
				cache: true, // Кешируем результаты
				parallel: true, // Параллельная сборка
				terserOptions: {
					// https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
					// https://github.com/terser-js/terser#minify-options
					extractComments: 'all',
					compress: {
						drop_console: true, // Удаляем console.log из js
					},
				},
			}),
		],
	},
	module: {
		rules: [{
			test: /\.(sass|scss|css)$/,
			include: path.resolve(__dirname, "src/scss"),
			use: [{
				loader: MiniCssExtractPlugin.loader,
				options: {},
			},
			{
				loader: "css-loader",
				options: {
					sourceMap: true,
					url: false,
				},
			},
			{
				loader: "postcss-loader",
				options: {
					ident: "postcss",
					sourceMap: true,
					plugins: () => [
						require("cssnano")({
							preset: [
								"default",
								{
									discardComments: {
										removeAll: true,
									},
								},
							],
						}),
						// require('postcss-uncss')({
						// 	// html: ['src/html/**/*.html'],
						// 	html: ['dist/*.html'],
						// 	// ignore: ['.fade'],
						// }),
						require('autoprefixer'),
					],
				},
			},
			{
				loader: "sass-loader",
				options: {
					sourceMap: true,
				},
			},
			],
		},
		{
			test: /\.html$/,
			include: [path.resolve(__dirname, "src/html/includes"), path.resolve(__dirname, "src/html/template")],
			use: ["raw-loader"],
		},
			// Плагин "imagemin-webpack-plugin" (установлен)
			// {
			//   test: /\.(gif|png|jpe?g|svg)$/i,
			//   include: path.resolve(__dirname, "src/img"),
			//   use: [{
			//       loader: 'file-loader',
			//     },
			//     {
			//       loader: 'image-webpack-loader',
			//       options: {
			//         bypassOnDebug: true, // Пережатие только при окончательной сборке
			//         mozjpeg: {
			//           progressive: true,
			//           quality: 65
			//         },
			//         // optipng.enabled: false will disable optipng
			//         optipng: {
			//           enabled: true,
			//         },
			//         pngquant: {
			//           quality: '65-90',
			//           speed: 4
			//         },
			//         gifsicle: {
			//           interlaced: false,
			//         },
			//         // the webp option will enable WEBP
			//         webp: {
			//           quality: 75
			//         }
			//       }
			//     },
			//   ],
			// }
		],
	},
	plugins: [
		// Анализ бандла, сделать включение по необходимости
		// new BundleAnalyzerPlugin(),
		// Минифицируем CSS
		new MiniCssExtractPlugin({
			filename: "./css/style.bundle.css",
		}),
		// Копируем статические файлы в dist
		new CopyWebpackPlugin([{
			from: "./src/fonts",
			to: "./fonts",
		},
		{
			from: "./src/favicon",
			to: "./favicon",
		},

		{
			from: "./src/php",
			to: "./php",
		},
		{
			from: "./src/video",
			to: "./video",
		},
		{
			from: "./src/img",
			to: "./images",
		},
		]),
		// Преобразовываем картинки в webp
		new ImageminWebpWebpackPlugin({
			config: [{
				test: /\.(jpe?g|png)/,
				options: {
					quality: 75,
				},
			}],
			overrideExtension: true,
			detailedLogs: true,
			silent: false,
			strict: true,
		}),
		// Сжимаем картинки png/jpe?g/gif/svg
		new ImageminPlugin({
			plugins: [
				imageminMozjpeg({
					quality: 65,
					progressive: true,
				}),
			],
			optipng: {
				optimizationLevel: 3, // default: 3
			},
			gifsicle: {
				optimizationLevel: 1,
			},
		}),
		// Подключаем jQuery глобально
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
			'window.jQuery': 'jquery',
			'window.$': 'jquery',
		}),
	].concat(htmlPlugins),
};

module.exports = (env, argv) => {
	if (argv.mode === "production") {
		config.plugins.push(new CleanWebpackPlugin()); // Очищаем папку от старых файлов
	}
	return config;
};
