require('dotenv').config();
const AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env["AWS_ID"], secretAccessKey: process.env["AWS_KEY"] });

const s3 = new AWS.S3();
module.exports = s3;
