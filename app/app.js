/**
 * @fileoverview アプリケーション UI
 * @author       Ryoji Morita
 * @version      0.0.1
*/
//let sv_ip   = 'sensor.rp.lfx.sony.co.jp';   // node.js server の IP アドレス
//let sv_ip   = '43.2.100.152';               // node.js server の IP アドレス
let sv_ip   = '192.168.91.140';                // node.js server の IP アドレス
let sv_port = 3001;                           // node.js server の port 番号

let server = io.connect('http://' + sv_ip + ':' + sv_port); //ローカル


//-----------------------------------------------------------------------------
//-------------------------------------
// ブラウザオブジェクトから受け取るイベント
window.onload = function() {
  console.log("[app.js] window.onloaded");
};


window.onunload = function() {
  console.log("[app.js] window.onunloaded");
};


//-----------------------------------------------------------------------------
// サーバから受け取るイベント
server.on('connect', function() {               // 接続時
  console.log("[app.js] " + 'connected');
});


server.on('disconnect', function(client) {    // 切断時
  console.log("[app.js] " + 'disconnected');
});


server.on('S_to_C_DATA', function(data) {
  console.log("[app.js] " + 'S_to_C_DATA');
  console.log("[app.js] data = " + data.value);
//  window.alert('コマンドを送信しました。\n\r' + data.value);
});


server.on('S_to_C_CMNT_ONE_DAY', function(data) {
  console.log("[app.js] " + 'S_to_C_CMNT_ONE_DAY');
  console.log("[app.js] data = " + JSON.stringify(data.value));

  if(data.value == false) {
    str = 'コメントがありません。';
    document.getElementById('val_data_daily').innerHTML = str;
  } else{
    showUpdatedCmnt(data.value, 'val_data_daily', 'up');
  }
});


server.on('S_to_C_TALK_CB', function() {
  console.log("[app.js] " + 'S_to_C_TALK_CB');
//    window.alert('play  ****.wav が完了しました。\n\r');
  recognition.start();
});


//-------------------------------------
/**
 * 引数のコメントを指定した id に表示する
 * @param {string} data - コメントの文字列
 * @param {string} id - コメントを表示する先の id
 * @param {string} dir - "up" or "down"
 * @return {void}
 * @example
 * showUpdatedCmnt(data, "val_data_today", "down");
*/
function showUpdatedCmnt(data, id, dir) {
  console.log("[app.js] showUpdatedCmnt()");
  console.log("[app.js] data = " + JSON.stringify(data));
  console.log("[app.js] id   = " + id);
  console.log("[app.js] dir  = " + dir);

  console.log("[app.js] data.length = " + data.length);

  // 表示する文字列を生成
  let str = '';

  if(dir === 'up') {
    for(i=0; i<data.length; i++) {
      str += data[i].time + ' : ' + data[i].cmnt + '\n';
    }
  } else if(dir === 'down') {
    for(i=data.length - 1; i>=0; i--) {
      str += data[i].time + ' : ' + data[i].cmnt + '\n';
    }
  } else{
    str = '';
  }

  // 文字列を表示
  document.getElementById(id ).innerHTML = str;
}


//-----------------------------------------------------------------------------
// ドキュメント・オブジェクトから受け取るイベント


//-----------------------------------------------------------------------------
/**
 * 指定した 1 日の、全コメントを取得するためのコマンドを送る。
 * @param {void}
 * @return {void}
 * @example
 * sendGetCmntOneDay();
*/
function sendGetCmntOneDay() {
  console.log("[app.js] sendGetCmntOneDay()");

  let date = document.getElementById('val_date').value;
  console.log("[app.js] date =" + date);

  if(date < '2018-08-01') {
    alert('2018/08/01 以降を指定してください。');
  }

  console.log("[app.js] server.emit(" + 'C_to_S_GET_CMNT_ONE_DAY' + ")");
  server.emit('C_to_S_GET_CMNT_ONE_DAY', date);
}


/**
 * コメントのデータを送信する
 * @param {void}
 * @return {void}
 * @example
 * sendCmnt();
*/
function sendCmnt() {
  console.log("[app.js] sendCmnt()");

  // データをチェック
  let cmnt = document.getElementById('val_cmnt');

  let data = {area:'', gid:'', email:'', cmnt:''};
  data.cmnt  = cmnt.value;

  // サーバーへデータを送信
  if(cmnt.value == '') {
    alert('ご要望・ご意見を記入してください。');
  } else{
    console.log("[app.js] server.emit(" + 'C_to_S_CMNT' + ")");
    server.emit('C_to_S_CMNT', cmnt.value);
  }

  // データをクリア
  clearCmnt();
}


/**
 * コメントをクリアする
 * @param {void}
 * @return {void}
 * @example
 * clearCmnt();
*/
function clearCmnt() {
  console.log("[app.js] clearCmnt()");
  let cmnt = document.getElementById('val_cmnt');
  cmnt.value = '';
}


/**
 * Music コマンド (PLAY, PAUSE, STOP, RESUME ) を送る。
 * @param {string} cmd - 'start'/'stop'
 * @return {void}
 * @example
 * sendMusicCmd('PLAY');
*/
function sendMusicCmd(cmd) {
  console.log("[app.js] sendMusicCmd()");
  console.log("[app.js] cmd = " + cmd);

  console.log("[app.js] server.emit(" + 'C_to_S_MUSIC' + ")");
  server.emit('C_to_S_MUSIC', cmd);
}


/**
 * しゃべる文字データを送る。
 * @param {string} cmnt - しゃべる文字列
 * @return {void}
 * @example
 * sendTalkData(cmnt);
*/
function sendTalkData(cmnt) {
  console.log("[app.js] sendTalkData()");
  console.log("[app.js] cmnt = " + cmnt);

  console.log("[app.js] server.emit(" + 'C_to_S_TALK' + ")");
  server.emit('C_to_S_TALK', cmnt);
}


/**
 * Mic 入力 / 停止
 * @param {void}
 * @return {void}
 * @example
 * submitMicStart(); / submitMicStop();
*/
window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
let recognition = new webkitSpeechRecognition();
recognition.lang = 'ja';


// 録音終了時トリガー
recognition.addEventListener('result', function(event) {
    let text = event.results.item(0).item(0).transcript;
    console.log("[app.js] text = " + text);
    $('#val_cmnt').val(text);
}, false);


function submitMicStart() {
  console.log("[app.js] submitMicStart()");

  let hi = 'ご用件をどうぞ';

  sendTalkData(hi);
//  recognition.start();
}


function submitMicStop() {
  console.log("[app.js] submitMicStop()");
  recognition.stop();
}


/**
 * トークのデータを送信する
 * @param {void}
 * @return {void}
 * @example
 * sendTalk();
*/
function sendTalk() {
  console.log("[app.js] sendTalk()");

  let talker = $('#val_talker').val();
  let cmnt   = $('#val_talk').val();
  console.log("[app.js] talker = " + talker);
  console.log("[app.js] cmnt   = " + cmnt);

  // サーバーへデータを送信
  if(cmnt == '') {
    alert('話す内容を記入してください。');
  } else{
    let obj = {talker:talker, cmnt:cmnt};
    console.log("[app.js] server.emit(" + 'C_to_S_TALK_W_NAME' + ")");
    server.emit('C_to_S_TALK_W_NAME', obj);
  }
}


