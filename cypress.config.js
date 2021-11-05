const aureliaConfig = require('./aurelia_project/aurelia.json');

const PORT = aureliaConfig.platform.port;
const HOST = aureliaConfig.platform.host;

module.exports = {
  config: {
    baseUrl: `http://${HOST}:${PORT}`,
    fixturesFolder: 'test/e2e/fixtures',
    integrationFolder: 'test/e2e/integration',
    screenshotsFolder: 'test/e2e/screenshots',
    supportFile: 'test/e2e/support/index.js',
    videosFolder: 'test/e2e/videos',
  },
};
