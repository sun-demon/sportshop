import { PrismaClient } from "@prisma/client";
import { Server } from "http";

export const setupGracefulShutdown = (server: Server, prisma: PrismaClient) => {
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
    
    server.close(async (err) => {
      if (err) {
        console.error('❌ Error closing server:', err);
        process.exit(1);
      }

      console.log('✅ HTTP server closed');

      try {
        await prisma.$disconnect();
        console.log('✅ Prisma disconnected');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error disconnecting Prisma:', error);
        process.exit(1);
      }
    });
    
    setTimeout(() => {
      console.error('⚠️ Forced shutdown after timeout');
      process.exit(1);
    }, 5000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};
