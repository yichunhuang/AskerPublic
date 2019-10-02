'user strict';

const bluebird = require("bluebird");
const redis = require("redis");

// let client    = redis.createClient({
//     port      : 6379,               // replace with your port
//     host      : '100.64.0.2',        // replace with your hostanme or IP address
//   });
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const client = redis.createClient();
// let client = redis.createClient('6379', 'redis');

client.on('connect', function() {
        console.log('Redis client connected');
    });
client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});
module.exports = client;