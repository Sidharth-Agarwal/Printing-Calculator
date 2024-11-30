const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'famous-letterpress',
  location: 'asia-south1'
};
exports.connectorConfig = connectorConfig;

