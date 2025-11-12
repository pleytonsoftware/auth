import { createServer } from './presentation/server';

// Load environment variables
const envPath = new URL('../.env', import.meta.url).pathname;
try {
  const envFile = await Bun.file(envPath).text();
  const lines = envFile.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  }
} catch (error) {
  console.warn('No .env file found, using environment variables');
}

// Start the server
createServer();
