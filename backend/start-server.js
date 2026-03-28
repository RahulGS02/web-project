// Debug server starter
try {
  console.log('Starting server...');
  require('./server.js');
} catch (error) {
  console.error('ERROR STARTING SERVER:');
  console.error(error);
  process.exit(1);
}

