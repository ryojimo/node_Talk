/**
 * @fileoverview データクラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
let fs = require('fs');


/**
 * API class
 * @param {void}
 * @constructor
 * @example
 * let obj = new ApiPlayMusic();
*/
class ApiPlayMusic {
  constructor() {
    /**
     * データ
     * @type {Object}
    */
    this.status = 'STOP';
    this.filename;
    this.child = null;
  }


  /**
   * 引数の filename を再生する
   * @param {string} filename - 再生するファイル
   * @return {void}
   * @example
   * play("Pink\ -\ Blow\ Me.mp3");
  */
  play(filename) {
    console.log("[ApiPlayMusic.js] play()");
    console.log("[ApiPlayMusic.js] filename = " + filename);

    if(this.status == 'STOP') {
      this.status = 'PLAY';
      this.filename = filename;
      let cmd = 'play';
      let args = ['-v', '0.4', this.filename];

      let spawn = require('child_process').spawn;
      this.child = spawn(cmd, args);

      this.child.on('exit', function() {
        console.log("[ApiPlayMusic.js] " + "PLAYING" + ": (      ) exit");
  //    process.exit(0);
      });

      this.child.stdout.setEncoding('utf-8');
      this.child.stdout.on('data', function(data) {
        console.log("[ApiPlayMusic.js] " + "PLAYING" + ": (stdout) " + data);
      });

      this.child.stderr.setEncoding('utf-8');
      this.child.stderr.on('data', function(data) {
        console.log("[ApiPlayMusic.js] " + "PLAYING" + ": (stderr) " + data);
      });
    } else{
      console.log("[ApiPlayMusic.js] this.status is not 'STOP'.");
      console.log("[ApiPlayMusic.js] this.status = " + this.status);
    }
  }


  /**
   * 状態を STOP/PAUSE/RESTART に変更してシグナルを this.child へ送る
   * @param {string} status - 'STOP' or 'PAUSE' or 'RESTART'
   * @return {void}
   * @example
   * changeStatus('PLAY');
  */
  changeStatus(status) {
    console.log("[ApiPlayMusic.js] changeStatus()");
    console.log("[ApiPlayMusic.js] status = " + status);
    this.status = status;

    let signal = 'SIGKILL';
    switch(status) {
    case 'STOP'   : signal = 'SIGKILL'; break;   // this.child プロセスを終了する
    case 'PAUSE'  : signal = 'SIGSTOP'; break;   // this.child プロセスを一時停止する
    case 'RESUME' : signal = 'SIGCONT'; break;   // this.child プロセスを再開する
    }

    if(this.child != null) {
      this.child.kill(signal);
    }
  }


  /**
   * play プロセスのプロセス ID を取得する
   * @param {function(string)} callback - GID を渡すための callback 関数
   * @return {void}
   * @example
   * getPID(function(id) {});
  */
  getPID(callback) {
    console.log("[ApiPlayMusic.js] getPID()");

    let cmd  = 'ps  aux  |  grep  play\\ -v';

    let exec = require('child_process').exec;
    let ret  = exec(cmd, function(err, stdout, stderr) {
        if(err) {
          console.log("[ApiPlayMusic.js] " + err);
        }

        let array = stdout.split(/\s+/);
        if(callback != undefined) {
          callback(array[1]);
        }
      });
  }


};


module.exports = ApiPlayMusic;


