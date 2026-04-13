import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, '../logs');

// Create logs directory if doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const getTimestamp = () => {
  return new Date().toISOString();
};

const logToFile = (level, message, data = null) => {
  const logFile = path.join(logsDir, 'app.log');
  const timestamp = getTimestamp();
  const logMessage = `[${timestamp}] [${level}] ${message}${data ? ` ${JSON.stringify(data)}` : ''}\n`;
  
  fs.appendFileSync(logFile, logMessage);
};

const logger = {
  info: (message, data = null) => {
    console.log(`[INFO] ${message}`, data || '');
    logToFile('INFO', message, data);
  },

  error: (message, error = null) => {
    console.error(`[ERROR] ${message}`, error || '');
    logToFile('ERROR', message, error);
  },

  warn: (message, data = null) => {
    console.warn(`[WARN] ${message}`, data || '');
    logToFile('WARN', message, data);
  },

  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data || '');
      logToFile('DEBUG', message, data);
    }
  },
};

export default logger;
