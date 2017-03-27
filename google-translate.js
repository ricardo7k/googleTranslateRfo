'use strict';

const HttpDispatcher = require('httpdispatcher');
const dispatcher     = new HttpDispatcher();
const http = require('http')
const https = require('https')
const fs = require('fs');
const querystring = require('querystring');
const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./crt.pem')
};


function handleRequest(request, response){
  try{
    dispatcher.dispatch(request, response);
  } catch(err) {
    console.log(err);
  }
}

dispatcher.onGet("/",function(req,res){
  fs.readFile('index.html', function (err, html) {
    res.writeHeader(200, {"Content-Type": "text/html"});
    res.write(html);
    res.end();
  });
});

dispatcher.onPost("/translate",function(req, res){

  var options = {
    host: 'translate.googleapis.com',
    port: 443,
    path: '/translate_a/single',
    method: 'POST'
  };

  var httpreq = https.request(options, function (response) {
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      console.info(">>>>>!!!!!!" + chunk);
      var arr = String(eval(chunk)).split(",");
      var frase = '{"translations": [{"translation": "' + arr[0] + ";" + arr[1] + '"}]}'
      res.writeHeader(200, {"Content-Type": "text/plain"});
      res.write(frase);
      res.end();
    });
  });

  httpreq.on('error', (e) => {
    console.log('problem with request:' + e.message);
  });

  httpreq.write(querystring.stringify({
    q: req.params.text,
    client:"gtx",
    sl:"en",
    tl:"pt",
    dt:"t"
  }));
  httpreq.end();
});

// http.createServer(options, (req, res) => {
//   console.log("Server listening on: https://localhost:%s", 8084);
//   handleRequest(req, res);
// }).listen(8084);

http.createServer(handleRequest).listen(8084, function(){
    console.log("Server listening on: http://localhost:%s", 8084);
});
