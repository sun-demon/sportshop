/**
 * Orders MFE — webpack конфигурация
 *
 * Экспортирует ./App для использования в host-приложении.
 * Запускается на порту 3002.
 */

const { ModuleFederationPlugin } = require('webpack').container;
const { merge } = require('webpack-merge');
const { createBaseConfig } = require('@sportshop/webpack-config');
const path = require('path');

module.exports = (env, argv) => {
  const isDev = argv.mode !== 'production';

  const base = createBaseConfig({
    context: __dirname,
    htmlTitle: 'Orders MFE',
  });

  return merge(base, {
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'eval-source-map' : false,

    entry: './src/index.ts',

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      publicPath: 'http://localhost:4002/',
      clean: true,
    },

    devServer: {
      port: 4002,
      historyApiFallback: true,
      hot: true,
      headers: { 'Access-Control-Allow-Origin': '*' },
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
        name: 'orders',
        filename: 'remoteEntry.js',
        exposes: {
          './App':       './src/App',
          // Catalog MFE импортирует cartStore чтобы добавлять товары в корзину.
          // Благодаря singleton: true для mobx — это тот же экземпляр что и в CartPage.
          './CartStore': './src/stores/CartStore',
        },
        shared: {
          react:              { singleton: true, requiredVersion: '^18.0.0' },
          'react-dom':        { singleton: true, requiredVersion: '^18.0.0' },
          'react-router-dom': { singleton: true, requiredVersion: '^6.0.0' },
          mobx:               { singleton: true },
          'mobx-react-lite':  { singleton: true },
          axios:              { singleton: true },
        },
      }),
    ],
  });
};
