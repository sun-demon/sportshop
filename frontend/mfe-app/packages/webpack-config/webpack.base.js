/**
 * @sportshop/webpack-config — базовая конфигурация сборки
 *
 * Используется всеми пакетами монорепо.
 * Каждое приложение вызывает createBaseConfig() и расширяет результат
 * своими настройками (ModuleFederationPlugin, devServer, entry и т.д.)
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

/**
 * @param {object} options
 * @param {string} options.context        — корень пакета (обычно __dirname)
 * @param {string} [options.htmlTemplate] — путь к index.html (по умолчанию ./public/index.html)
 * @param {string} [options.htmlTitle]    — <title> страницы
 */
function createBaseConfig({ context, htmlTemplate, htmlTitle = 'Sportshop' } = {}) {
  return {
    // Режим задаётся в вызывающем конфиге (development / production)
    context,

    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },

    module: {
      rules: [
        // TypeScript / TSX
        // transpileOnly: true — отключает проверку типов в ts-loader,
        // чтобы Module Federation remote-модули не вызывали TS2307.
        // Типы проверяются отдельно через tsc или IDE.
        {
          test: /\.tsx?$/,
          use: { loader: 'ts-loader', options: { transpileOnly: true } },
          exclude: /node_modules/,
        },
        // CSS
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        // Статика (картинки, шрифты)
        {
          test: /\.(png|svg|jpg|jpeg|gif|woff2?)$/i,
          type: 'asset/resource',
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: htmlTemplate || path.resolve(context, 'public/index.html'),
        title: htmlTitle,
      }),
    ],
  };
}

module.exports = { createBaseConfig };
