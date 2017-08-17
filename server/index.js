import bodyParser from 'koa-bodyparser';
import Koa from 'koa';
import logger from 'koa-logger';
import helmet from 'koa-helmet';
import routing from './routes/';
import { port } from './config';
import winston from 'winston';

// Setup logging
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {colorize: true});

// Create Koa Application
const app = new Koa();

app
  .use(logger())
  .use(bodyParser())
  .use(helmet());

routing(app);

// Start the application
app.listen(port, () => winston.log('info', `Lighthouse API server is running at http://localhost:${port}/`));

export default app;
