var env = process.env.NODE_ENV || 'development';

if(env === 'development' || env === 'test') {
  const configJSON = require('./config.json');
  const envConfig = configJSON[env];
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}