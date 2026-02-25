import { createApp } from './server.js';
import { config } from './config.js';
import logger from './shared/logger.js';

const app = createApp();

app.listen(config.port, () => {
  logger.info(`Server running on http://localhost:${config.port}`);
  logger.info(`Download CSV at http://localhost:${config.port}/api/export/candidates`);
});
