

var path=require("path");

var tmpDir = path.join(process.cwd(), "src");

var express = require('express');
var fs=require("fs");

var https = require('https');
var bodyParser = require('body-parser');

var config = require('./config.js');

var prmoseChainTest= require('./src/examples/PromiseChain');
var listSampleTest= require('./src/examples/ListSample');
var webSocketTest= require('./src/examples/SocketServer');

var cases = new prmoseChainTest.PromiseChainCases();
cases.test().then((result)=>{
	result=result;
}
)

let listSample=new listSampleTest.ListSample();

let result=listSample.doSample();

let socketServer=new webSocketTest.SocketServerSample();

var requireModules={
	fs:fs,
	https:https

}

app = express();


app.use(bodyParser());

console.log("Server started at port : "+config.server.port)

// Access to files
//app.use(express.static('app'));
app.use("/site",express.static('./site'));
app.use("/css",express.static('./css'));

app.use("/", express.static('./site'));


app.get("/", function(req, res) {
//
	res.redirect('/index.html');
});

// Start the server
app.listen(config.server.port);


