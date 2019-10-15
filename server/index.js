require('dotenv').config();
const express = require('express');
const graphqlHTTP = require('express-graphql');
const graphqlAPI = require('./controller/graphqlAPI.js');
const bodyParser=require('body-parser');
const app = express();
const server = app.listen(3000,  () => {
    console.log('now listening for requests on port 3000');
});

app.use(express.static('/')); 
app.use(express.static('frontend')); 
app.use('/assets', express.static('assets')); 
app.use(bodyParser.json({limit: '10mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));

app.use('/graphql', 
    graphqlHTTP({
        schema: graphqlAPI,
        graphiql: true
    })
);

const notification = require('./notification.js');
notification.init();

const io = require('socket.io').listen(server);
const siofu = require('socketio-file-upload');
app.use(siofu.router);
require('./socket.js')(io, siofu);


