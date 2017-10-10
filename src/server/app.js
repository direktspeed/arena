const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const handlebars = require('handlebars');
const exphbs = require('express-handlebars');


const hbs = exphbs.create({
  defaultLayout: `${__dirname}/views/layout`,
  handlebars,
  partialsDir: `${__dirname}/views/partials/`,
  extname: 'hbs'
});

require('handlebars-helpers')({handlebars});
require('./views/helpers/handlebars')(handlebars);

const app = express();

const defaultConfig = require(path.join(__dirname, 'config', 'index.json'));

const Queues = require('./queue');
app.locals.Queues = new Queues();
app.locals.basePath = '';

app.set('views', `${__dirname}/views`);
app.set('view engine', 'hbs');
app.set('json spaces', 2);

app.engine('hbs', hbs.engine);

const queueList = require('./views/dashboard/queueList');
const queueDetails = require('./views/dashboard/queueDetails');
const queueJobsByState = require('./views/dashboard/queueJobsByState');
const jobDetails = require('./views/dashboard/jobDetails');

app.get('/', queueList);
app.get('/:queueHost/:queueName', queueDetails);
app.get('/:queueHost/:queueName/:state(waiting|active|completed|succeeded|failed|delayed)', queueJobsByState);
app.get('/:queueHost/:queueName/:id', jobDetails);

const jobRetry = require('./views/api/jobRetry');
const jobRemove = require('./views/api/jobRemove');
const bulkJobsRemove = require('./views/api/bulkAction')('remove');
const bulkJobsRetry = require('./views/api/bulkAction')('retry');

app.use(bodyParser.json());
app.post('api/queue/:queueHost/:queueName/job/bulk', bulkJobsRemove);
app.patch('api/queue/:queueHost/:queueName/job/bulk', bulkJobsRetry);
app.patch('api/queue/:queueHost/:queueName/job/:id', jobRetry);
app.delete('api/queue/:queueHost/:queueName/job/:id', jobRemove);

module.exports = app

