'user strict';

let bluebird = require("bluebird");
let redis = require("redis");
  /* Values are hard-coded for this example, it's usually best to bring these in via file or environment variable for production */
// let client    = redis.createClient({
//     port      : 6379,               // replace with your port
//     host      : '100.64.0.2',        // replace with your hostanme or IP address
//     // password  : 'your password',    // replace with your password
//     // optional, if using SSL
//     // use `fs.readFile[Sync]` or another method to bring these values in
//     // tls       : {
//     //   key  : stringValueOfKeyFile,  
//     //   cert : stringValueOfCertFile,
//     //   ca   : [ stringValueOfCaCertFile ]
//     // }
//   });
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
let client = redis.createClient();
// let client = redis.createClient('6379', 'redis');

client.on('connect', function() {
        console.log('Redis client connected');
    });
client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});
module.exports = client;