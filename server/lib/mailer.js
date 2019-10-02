require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env["EMAIL_USER"],
    pass: process.env["EMAIL_PASSWORD"]
  }
});

const options = {
    from: process.env["EMAIL_USER"],
	  subject: 'Asker 購買訂單',
    text: '恭喜訂單付款成功!',
};

module.exports={
	transporter:transporter,
	options:options
};