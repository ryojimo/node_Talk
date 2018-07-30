/**
 * @fileoverview アプリケーション UI
 * @author       Ryoji Morita
 * @version      0.0.1
*/
//var sv_ip   = 'sensor.rp.lfx.sony.co.jp';   // node.js server の IP アドレス
//var sv_ip   = '43.31.78.45';                // node.js server の IP アドレス
var sv_ip   = '192.168.91.11';                // node.js server の IP アドレス
var sv_port = 6000;                           // node.js server の port 番号

var server = io.connect( 'http://' + sv_ip + ':' + sv_port ); //ローカル


//-----------------------------------------------------------------------------
//-------------------------------------
// ブラウザオブジェクトから受け取るイベント
window.onload = function(){
  console.log( "[app.js] window.onloaded" );
};


window.onunload = function(){
  console.log( "[app.js] window.onunloaded" );
};


//-----------------------------------------------------------------------------
// サーバから受け取るイベント
server.on( 'connect', function(){               // 接続時
  console.log( "[app.js] " + 'connected' );
});


server.on( 'disconnect', function( client ){    // 切断時
  console.log( "[app.js] " + 'disconnected' );
});


server.on( 'S_to_C_DATA', function( data ){
  console.log( "[app.js] " + 'S_to_C_DATA' );
  console.log( "[app.js] data = " + data.value );
//  window.alert( 'コマンドを送信しました。\n\r' + data.value );

  document.getElementById('val_sensor').innerHTML = data.value; // 数値を表示
});


//-----------------------------------------------------------------------------
// ドキュメント・オブジェクトから受け取るイベント


//-----------------------------------------------------------------------------
/**
 * Get コマンドを送る。
 * @param {string} cmd - コマンドの文字列
 * @return {void}
 * @example
 * sendGetCmd( 'sudo ./board.out temp1' );
*/
function sendGetCmd( cmd ){
  console.log( "[app.js] sendGetCmd()" );
  console.log( "[app.js] cmd = " + cmd );

  console.log( "[app.js] server.emit(" + 'C_to_S_GET' + ")" );
  server.emit( 'C_to_S_GET', cmd );
}


/**
 * Set コマンドを送る。
 * @param {string} cmd - コマンドの文字列
 * @return {void}
 * @example
 * sendSetCmd( 'sudo ./board.out relay on' );
*/
function sendSetCmd( cmd ){
  console.log( "[app.js] sendSetCmd()" );
  console.log( "[app.js] cmd = " + cmd );

  console.log( "[app.js] server.emit(" + 'C_to_S_SET' + ")" );
  server.emit( 'C_to_S_SET', cmd );
}


/**
 * コメントのデータを送信する
 * @param {void}
 * @return {void}
 * @example
 * sendCmnt();
*/
function sendCmnt(){
  console.log( "[app.js] sendCmnt()" );

  // データをチェック
  var cmnt = document.getElementById( 'val_cmnt' );
//  console.log( "[app.js] cmnt.value =" + cmnt.value );

  // サーバーへデータを送信
  if( cmnt.value == '' ){
    alert( 'ご要望・ご意見を記入してください。' );
  } else{
    console.log( "[app.js] server.emit(" + 'C_to_S_CMNT' + ")" );
    server.emit( 'C_to_S_CMNT', cmnt.value );
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
function clearCmnt(){
  console.log( "[app.js] clearCmnt()" );
  var cmnt = document.getElementById( 'val_cmnt' );
  cmnt.value = '';
}


/**
 * Music コマンド ( PLAY, PAUSE, STOP, RESUME ) を送る。
 * @param {string} cmd - 'start'/'stop'
 * @return {void}
 * @example
 * sendMusicCmd( 'PLAY' );
*/
function sendMusicCmd( cmd ){
  console.log( "[app.js] sendMusicCmd()" );
  console.log( "[app.js] cmd = " + cmd );

  console.log( "[app.js] server.emit(" + 'C_to_S_MUSIC' + ")" );
  server.emit( 'C_to_S_MUSIC', cmd );
}


/**
 * しゃべる文字データを送る。
 * @param {string} cmnt - しゃべる文字列
 * @return {void}
 * @example
 * sendTalkData( cmnt );
*/
function sendTalkData( cmnt ){
  console.log( "[app.js] sendTalkData()" );
  console.log( "[app.js] cmnt = " + cmnt );

  console.log( "[app.js] server.emit(" + 'C_to_S_TALK' + ")" );
  server.emit( 'C_to_S_TALK', cmnt );
}


/**
 * Mic 入力 / 停止
 * @param {void}
 * @return {void}
 * @example
 * submitMicStart(); / submitMicStop();
*/
window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
var recognition = new webkitSpeechRecognition();
recognition.lang = 'ja';


// 録音終了時トリガー
recognition.addEventListener( 'result', function(event){
    var text = event.results.item(0).item(0).transcript;
    console.log( "[app.js] text = " + text );
    $('#val_cmnt').val( text );
}, false );


function submitMicStart(){
  console.log( "[app.js] submitMicStart()" );

  var hi = 'ご用件をどうぞ';

  sendTalkData( hi );
//  recognition.start();
}


function submitMicStop(){
  console.log( "[app.js] submitMicStop()" );
  recognition.stop();
}


/**
 * トークのデータを送信する
 * @param {void}
 * @return {void}
 * @example
 * sendTalk();
*/
function sendTalk(){
  console.log( "[app.js] sendTalk()" );

  var talker = $('#val_talker').val();
  var cmnt   = $('#val_talk').val();
  console.log( "[app.js] talker = " + talker );
  console.log( "[app.js] cmnt   = " + cmnt );

  // サーバーへデータを送信
  if( cmnt == '' ){
    alert( '話す内容を記入してください。' );
  } else{
    var obj = { talker:talker, cmnt:cmnt };
    console.log( "[app.js] server.emit(" + 'C_to_S_TALK_W_NAME' + ")" );
    server.emit( 'C_to_S_TALK_W_NAME', obj );
  }
}


