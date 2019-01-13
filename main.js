/**
 * @fileoverview メイン・システム
 * @author       Ryoji Morita
 * @version      0.0.1
*/

// 必要なライブラリをロード
let http     = require('http');
let socketio = require('socket.io');
let fs       = require('fs');
let colors   = require('colors');
let schedule = require('node-schedule');
require('date-utils');

const ApiCmn        = require('./js/ApiCmn');
const ApiDocomo     = require('./js/ApiDocomo');
const ApiFileSystem = require('./js/ApiFileSystem');
const ApiPlayMusic  = require('./js/ApiPlayMusic');


// Ver. 表示
let now = new Date();
console.log("[main.js] " + now.toFormat("YYYY年MM月DD日 HH24時MI分SS秒").rainbow);
console.log("[main.js] " + "ver.01 : app.js".rainbow);

// サーバー・オブジェクトを生成
let server = http.createServer();

// request イベント処理関数をセット
server.on('request', doRequest);

// 待ち受けスタート
const PORT = 3001;
server.listen(process.env.VMC_APP_PORT || PORT);
console.log("[main.js] access to http://localhost:" + PORT);
console.log("[main.js] Server running!");

// request イベント処理
function doRequest(
  req,    // http.IncomingMessage オブジェクト : クライアントからのリクエストに関する機能がまとめられている
  res     // http.serverResponse  オブジェクト : サーバーからクライアントへ戻されるレスポンスに関する機能がまとめられている
){
  switch(req.url) {
  case '/':
    fs.readFile('./app/app.html', 'UTF-8', function(err, data) {
      if(err) {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.write('File Not Found.');
        res.end();
        return;
      }
      res.writeHead(200, {'Content-Type': 'text/html',
                          'Access-Control-Allow-Origin': '*'
                   });
      res.write(data);
      res.end();
    });
  break;
  case '/app.js':
  fs.readFile('./app/app.js', 'UTF-8', function(err, data) {
      res.writeHead(200, {'Content-Type': 'application/javascript',
                          'Access-Control-Allow-Origin': '*'
                   });
      res.write(data);
      res.end();
    });
  break;
  case '/style.css':
    fs.readFile('./app/style.css', 'UTF-8', function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/css',
                          'Access-Control-Allow-Origin': '*'
                   });
      res.write(data);
      res.end();
    });
  break;
  }
}


let io = socketio.listen(server);


//-----------------------------------------------------------------------------
// 起動の処理関数
//-----------------------------------------------------------------------------
let g_apiCmn        = new ApiCmn();
let g_apiDocomo     = new ApiDocomo();
let g_apiFileSystem = new ApiFileSystem();
let g_apiPlayMusic  = new ApiPlayMusic();


let music_pid = 0;


startSystem();


/**
 * システムを開始する
 * @param {void}
 * @return {void}
 * @example
 * startSystem();
*/
function startSystem() {
  console.log("[main.js] startSystem()");
  let job01 = runMusic('45   7     * * *');
};


/**
 * node-schedule の Job を登録する。
 * @param {string} when - Job を実行する時間
 * @return {object} job - node-schedule に登録した job
 * @example
 * runMusic( ' 0 0-23/1 * * *');
*/
function runMusic(when) {
  console.log("[main.js] runMusic()");
  console.log("[main.js] when = " + when);

  let job = schedule.scheduleJob(when, function() {
    console.log("[main.js] node-schedule が実行されました");

    let filenames = fs.readdirSync('../MyContents/');
    console.log("[main.js] filenames = " + filenames);
    let no = Math.floor(Math.random() * filenames.length);

    let filename = '../MyContents/' + filenames[no];
    g_apiPlayMusic.play(filename, function() {
      g_apiPlayMusic.changeStatus('STOP');
    });
  });

  return job;
};


//-----------------------------------------------------------------------------
// クライアントからコネクションが来た時の処理関数
//-----------------------------------------------------------------------------
io.sockets.on('connection', function(socket) {

  // 切断したときに送信
  socket.on('disconnect', function(){
    console.log("[main.js] " + 'disconnect');
//  io.sockets.emit('S_to_C_DATA', {value:'user disconnected'});
  });


  // Client to Server
  socket.on('C_to_S_NEW', function(data) {
    console.log("[main.js] " + 'C_to_S_NEW');
  });


  socket.on('C_to_S_DELETE', function(data) {
    console.log("[main.js] " + 'C_to_S_DELETE');
  });


  socket.on('C_to_S_GET_CMNT_ONE_DAY', function(date) {
    console.log("[main.js] " + 'C_to_S_GET_CMNT_ONE_DAY');
    console.log("[main.js] date = " + date);

    let ret = false;
    let jsonObj = null;
    let filename = '/media/pi/USBDATA/feedback/' + date + '.txt';
    console.log("[main.js] filename = " + filename);

    try {
      fs.statSync(filename);

      ret = fs.readFileSync(filename, 'utf8');
      jsonObj = (new Function("return " + ret))();

      ret = true;
    } catch(err) {
      if(err.code === 'ENOENT') {
        console.log("[main.js] file does not exist.");
      } else {
        console.log("[main.js] err = " + err);
      }
      ret = false;
    }

    io.sockets.emit('S_to_C_CMNT_ONE_DAY', {ret: ret, value: jsonObj});
  });


  socket.on('C_to_S_CMNT', function(jsonObj) {
    console.log("[main.js] " + 'C_to_S_CMNT');
    console.log("[main.js] data = " + JSON.stringify(jsonObj));

    let obj = new DataFeedback(jsonObj);
    console.log("[main.js] obj = " + JSON.stringify(obj));

    obj.writeFeedback(jsonObj.gid, jsonObj.email, jsonObj.area, jsonObj.cmnt);
    let info = obj.get();
    console.log("[main.js] info = " + JSON.stringify(info));
    g_arrayObj.push(info);

    let date = g_apiCmn.yyyymmdd();
    let filename = '/media/pi/USBDATA/feedback/' + date + '.txt';
    g_apiFileSystem.write(filename, g_arrayObj);
  });


  socket.on('C_to_S_MUSIC', function(data) {
    console.log("[main.js] " + 'C_to_S_MUSIC');

    if(data == 'GET PID') {
      g_apiPlayMusic.getPID(function(id) {
        music_pid = id;
        console.log("[main.js] " + "pid=" + music_pid);
      });
    } else if(data == 'PLAY') {
      let filenames = fs.readdirSync('../MyContents/');
      console.log("[main.js] filenames = " + filenames);
      let no = Math.floor(Math.random() * filenames.length);

      let filename = '../MyContents/' + filenames[no];
      g_apiPlayMusic.play(filename, function() {
        g_apiPlayMusic.changeStatus('STOP');
      });
    } else {
      g_apiPlayMusic.changeStatus(data);
    }
  });


  socket.on('C_to_S_TALK', function(cmnt) {
    console.log("[main.js] " + 'C_to_S_TALK');
    console.log("[main.js] cmnt = " + cmnt);

    g_apiDocomo.update('nozomi', 'hello');
    g_apiDocomo.talk(cmnt, function(){
      io.sockets.emit('S_to_C_TALK_CB', {value:true})
    });
  });


  socket.on('C_to_S_TALK_W_NAME', function(data) {
    console.log("[main.js] " + 'C_to_S_TALK_W_NAME');
    console.log("[main.js] data = " + data);
    console.log("[main.js] data.talker = " + data.talker);
    console.log("[main.js] data.cmnt   = " + data.cmnt);

    g_apiDocomo.update(data.talker , 'hello');
    g_apiDocomo.talk(data.cmnt, function(){
    });
  });


});


