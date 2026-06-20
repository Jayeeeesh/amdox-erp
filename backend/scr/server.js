const app = require('./app');
const { connectDB } = require('./config/database');

require('dotenv').config();

const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || 'development';

let server;

const startServer = async () => {
  try {
    // Database Connection
    await connectDB();

    // Start HTTP Server
    server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════╗
║     Amdox ERP API Started      ║
╠════════════════════════════════╣
║ 🚀 Port    : ${PORT}                
║ 🌍 Env     : ${ENV}          
║ 🏥 Health  : http://localhost:${PORT}/health
║ 📚 Docs    : http://localhost:${PORT}/api/docs
╚════════════════════════════════╝
      `);
    });

  } catch (error) {
    console.error('❌ Server failed to start:', error.message);
    process.exit(1);
  }
};

// Graceful Shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Unhandled Errors
process.on('uncaughtException', (error) => {
  console.error('🔥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('🔥 Unhandled Promise Rejection:', error);
  process.exit(1);
});

startServer();