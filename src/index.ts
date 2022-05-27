import { createServer } from './server';
import { ConfigService } from './services/config.service';

const configService = new ConfigService();
const server = createServer();

server.listen(configService.loadConfig().API_PORT,'0.0.0.0', (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
