import { Application } from '@nocobase/server';
import { IncomingMessage } from 'http';

const app = new Application({
  database: {
    logging: process.env.DB_LOGGING === 'on' ? console.log : false,
    dialect: process.env.DB_DIALECT as any,
    storage: process.env.DB_STORAGE,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT as any,
    timezone: process.env.DB_TIMEZONE,
    tablePrefix: process.env.DB_TABLE_PREFIX,
  },
  resourcer: {
    prefix: '/api',
  },
  plugins: [],
});

if (require.main === module) {
  app.runAsCLI();
}

const subApp1 = app.appManager.createApplication('sub1', {
  database: app.db,
  resourcer: {
    prefix: '/sub1/api/',
  },
});

app.resourcer.define({
  name: 'test',
  actions: {
    async list(ctx) {
      ctx.body = 'test list';
    },
  },
});

subApp1.resourcer.define({
  name: 'test',
  actions: {
    async list(ctx) {
      ctx.body = 'sub1 test list';
    },
  },
});

app.appManager.setAppSelector((req: IncomingMessage) => {
  if (req.url.startsWith('/sub1/api')) {
    return subApp1;
  }
  return null;
});

export default app;

// http://localhost:13000/api/test:list
// http://localhost:13000/sub1/api/test:list
