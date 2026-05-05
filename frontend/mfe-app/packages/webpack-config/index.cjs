const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

function shared(isHost) {
  const eager = Boolean(isHost);
  return {
    react: { singleton: true, eager, requiredVersion: false },
    'react-dom': { singleton: true, eager, requiredVersion: false },
    'react-router-dom': { singleton: true, eager, requiredVersion: false },
    'react-redux': { singleton: true, eager, requiredVersion: false },
    '@reduxjs/toolkit': { singleton: true, eager, requiredVersion: false },
    '@reduxjs/toolkit/query': { singleton: true, eager, requiredVersion: false },
    '@reduxjs/toolkit/query/react': { singleton: true, eager, requiredVersion: false },
    '@sportshop/mfe-store': { singleton: true, eager, requiredVersion: false },
  };
}

/**
 * @param {{
 *   appDir: string;
 *   name: string;
 *   port: number;
 *   isHost?: boolean;
 *   exposes?: Record<string, string>;
 *   remotes?: Record<string, string>;
 * }} opts
 */
function createMfeWebpackConfig({ appDir, name, port, isHost = false, exposes = {}, remotes = {} }) {
  const storeAlias = path.resolve(appDir, '../app-store/src');
  const publicOrigin = process.env.MFE_PUBLIC_ORIGIN ?? 'http://localhost';
  const gatewayTarget = process.env.MFE_API_GATEWAY_URL ?? 'http://localhost:3000';

  return {
    entry: path.join(appDir, 'src/index.tsx'),
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    devtool: 'source-map',
    output: {
      path: path.join(appDir, 'dist'),
      filename: '[name].[contenthash].js',
      publicPath: `${publicOrigin}:${port}/`,
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      alias: {
        '@sportshop/mfe-store': storeAlias,
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              // tsconfig has noEmit: true — without transpileOnly, ts-loader errors:
              // "TypeScript emitted no output"
              transpileOnly: true,
            },
          },
        },
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name,
        remotes,
        shared: shared(isHost),
        ...(Object.keys(exposes).length > 0
          ? { filename: 'remoteEntry.js', exposes }
          : {}),
      }),
      new HtmlWebpackPlugin({ template: path.join(appDir, 'public/index.html') }),
    ],
    devServer: {
      port,
      hot: true,
      historyApiFallback: true,
      headers: { 'Access-Control-Allow-Origin': '*' },
      static: path.join(appDir, 'public'),
      // webpack-dev-server v5: proxy must be an array (see devServer.proxy schema)
      proxy: [
        {
          context: ['/auth', '/products', '/orders'],
          target: gatewayTarget,
          changeOrigin: true,
        },
      ],
    },
  };
}

module.exports = { createMfeWebpackConfig };
