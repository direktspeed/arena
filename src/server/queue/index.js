const _ = require('lodash');
const path = require('path');

class Queues {
  // Bee,
  constructor(config = {}) {
    this._queues = {};
    if (config.Bee) {
      this.Bee = config.Bee
    }
    this.setConfig();
  }

  list() {
    return this._config.queues;
  }

  addQueue(config) {
    this._config.queues.push(config);
  }
  
  setConfig(queues = []) {
    this._config.queues = queues;
  }

  async get(queueName, queueHost) {
    const queueConfig = _.find(this._config.queues, {
      name: queueName,
      hostId: queueHost
    });
    if (!queueConfig) return null;

    if (this._queues[queueHost] && this._queues[queueHost][queueName]) {
      return this._queues[queueHost][queueName];
    }

    const { type, name, port, host, db, password, prefix, url } = queueConfig;

    const isBee = type === 'bee';

    const options = {
      prefix,
      redis: url || { port, host, db, password }
    };

    let queue;
    if (isBee) {
      if (!this.Bee) {
        Object.assign(options, {
          isWorker: false,
          getEvents: false,
          sendEvents: false,
          storeJobs: false
        });
        this.Bee = require('bee-queue');
      } 
      queue = new this.Bee(name, options);
    } else {
      let Bull = require('bull');
      queue = new Bull(name, options);
    }

    queue.IS_BEE = isBee;

    this._queues[queueHost] = this._queues[queueHost] || {};
    this._queues[queueHost][queueName] = queue;

    return queue;
  }
}

module.exports = Queues;
