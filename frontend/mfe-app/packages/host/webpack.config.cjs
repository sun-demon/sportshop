const { createMfeWebpackConfig } = require('@sportshop/webpack-mfe-config');

module.exports = createMfeWebpackConfig({
  appDir: __dirname,
  name: 'host',
  port: 4200,
  isHost: true,
  exposes: {},
  remotes: {
    catalog: `catalog@${process.env.MFE_REMOTE_ORIGIN ?? 'http://localhost'}:4201/remoteEntry.js`,
    orders: `orders@${process.env.MFE_REMOTE_ORIGIN ?? 'http://localhost'}:4202/remoteEntry.js`,
  },
});
