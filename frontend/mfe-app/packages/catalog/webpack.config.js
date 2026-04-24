/**
 * Catalog MFE — webpack конфигурация
 *
 * Экспортирует ./App для использования в host-приложении.
 * Запускается на порту 3001.
 */

const { ModuleFederationPlugin } = require('webpack').container;
const { merge } = require('webpack-merge');
const { createBaseConfig } = require('@sportshop/webpack-config');
const path = require('path');

module.exports = (env, argv) => {
  const isDev = argv.mode !== 'production';

  const base = createBaseConfig({
    context: __dirname,
    htmlTitle: 'Catalog MFE',
  });

  return merge(base, {
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'eval-source-map' : false,

    entry: './src/index.ts',

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      publicPath: 'http://localhost:4001/',
      clean: true,
    },

    devServer: {
      port: 4001,
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
        name: 'catalog',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/App',
        },
        remotes: {
          // Берём CartStore из Orders MFE (singleton mobx — тот же экземпляр)
          orders: 'orders@http://localhost:4002/remoteEntry.js',
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
