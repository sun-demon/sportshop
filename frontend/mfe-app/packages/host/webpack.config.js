/**
 * Host — webpack конфигурация
 *
 * Использует ModuleFederationPlugin для подключения удалённых MFE:
 *   catalog  → http://localhost:4001/remoteEntry.js
 *   orders   → http://localhost:4002/remoteEntry.js
 *
 * Все синглтон-зависимости (react, react-router-dom, mobx и т.д.)
 * объявлены shared, чтобы между host и MFE работал один экземпляр.
 */

const { ModuleFederationPlugin } = require('webpack').container;
const { merge } = require('webpack-merge');
const { createBaseConfig } = require('@sportshop/webpack-config');
const path = require('path');

module.exports = (env, argv) => {
  const isDev = argv.mode !== 'production';

  const base = createBaseConfig({
    context: __dirname,
    htmlTitle: 'Sportshop',
  });

  return merge(base, {
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'eval-source-map' : false,

    entry: './src/index.ts',

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      publicPath: 'http://localhost:4000/',
      clean: true,
    },

    devServer: {
      port: 4000,
      historyApiFallback: true,
      hot: true,
      headers: { 'Access-Control-Allow-Origin': '*' },
      // Отключаем overlay полностью — ScriptExternalLoadError от недоступных MFE
      // летит как 'error'-событие (не unhandledrejection), поэтому runtimeErrors-фильтр
      // его не перехватывает. Ошибки компиляции по-прежнему видны в терминале.
      client: {
        overlay: false,
      },
      // Проксируем API-запросы на Docker gateway (порт 3000)
      proxy: [
        {
          context: ['/auth', '/products', '/orders'],
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      ],
    },

    plugins: [
      new ModuleFederationPlugin({
        name: 'host',
        remotes: {
          // Синтаксис: "<имя>@<URL>/remoteEntry.js"
          catalog: 'catalog@http://localhost:4001/remoteEntry.js',
          orders:  'orders@http://localhost:4002/remoteEntry.js',
        },
        shared: {
          react:              { singleton: true, requiredVersion: '^18.0.0', eager: true },
          'react-dom':        { singleton: true, requiredVersion: '^18.0.0', eager: true },
          'react-router-dom': { singleton: true, requiredVersion: '^6.0.0',  eager: true },
          mobx:               { singleton: true, eager: true },
          'mobx-react-lite':  { singleton: true, eager: true },
          axios:              { singleton: true, eager: true },
        },
      }),
    ],
  });
};
