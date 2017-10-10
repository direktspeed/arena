const path = require('path');
const app = require('./src/server/app');
const routes = require('./src/server/views/routes');
const Queues = app.locals.Queues;
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(routes);

function setup(config) {  

  if (config.queues) {
    config.queues.map(Queues.addQueue)
  }

  return app;
}

module.exports = setup;

if (require.main === module) {
  let instance = setup({
    port: 4567,
    queues: [{
      "name": "my_queue",
      "port": 6381,
      "host": "127.0.0.1",
      "hostId": "AWS Server 2"
    }]
  });
  instance.listen(port, () => console.log(`Arena is running on port ${port}`));  
}

