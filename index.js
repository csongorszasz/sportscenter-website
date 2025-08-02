import { join } from 'path';
import express from 'express';
import helpers from 'handlebars-helpers';
import { engine } from 'express-handlebars';
import Handlebars from 'handlebars';
import session from 'express-session';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { secret } from './config.js';
import mainrequestsRoutes from './routes/mainrequests.js';
import formRoutes from './routes/formhandler.js';
import palyaRoutes from './routes/palyak.js';
import errorMiddleWare from './middleware/error.js';
import apiRoutes from './api/index.js';

const app = express();

// a public mappából adjuk a HTML állományokat
app.use(express.static(join(process.cwd(), 'public')));

// bootstrap css bekotese
app.use(express.static(join(process.cwd(), 'node_modules/bootstrap/dist/css')));
app.use(express.static(join(process.cwd(), 'node_modules/bootstrap-datepicker/dist/css')));

// jquery bekotese
app.use(express.static(join(process.cwd(), '/node_modules/jquery/dist/')));

// a feltoltott allomanyok statikussa tetele
app.use(express.static(join(process.cwd(), 'uploadDir')));

// beállítjuk a handlebars-t, mint sablonmotor
app.set('view engine', 'hbs');
app.set('views', join(process.cwd(), 'views'));
app.engine(
  'hbs',
  engine({
    extname: 'hbs',
    defaultView: 'main',
    layoutsDir: join(process.cwd(), 'views/layouts'),
    partialsDir: join(process.cwd(), 'views/partials'),
    helpers: helpers(),
  }),
);
Handlebars.registerHelper('ifEquals', (arg1, arg2, options) => {
  const outerContext = options.data.root;
  return arg1 === arg2 ? options.fn(outerContext) : options.inverse(outerContext);
});

app.use(cookieParser());

// session middleware beallitasa
app.use(
  session({
    secret,
    resave: false,
    saveUninitialized: false,
  }),
);

// naplózás
app.use(morgan('dev'));

// routerek bekotese
app.use(mainrequestsRoutes);
app.use('/palyak', palyaRoutes);
app.use('/submit-form', formRoutes);
app.use('/api', apiRoutes);

// hibakezelo bekotese
app.use(errorMiddleWare);

app.listen(8080, () => {
  console.log('Server listening on http://localhost:8080/ ...');
});
