/**
 * @fileoverview データクラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
var fs = require( 'fs' );
var MongoClient  = require( 'mongodb' ).MongoClient;


/**
 * データ class
 * @param {void}
 * @constructor
 * @example
 * var obj = new DataCmnt();
*/
var DataCmnts = function(){
  /**
   * MongoDB のデータベース名
   * @type {string}
  */
  this.nameDatabase = 'comments';

  /**
   * MongoDB の URL
   * @type {string}
  */
  this.mongo_url = 'mongodb://localhost:27017/';
};


/**
 * ドキュメントを作成する。
 * @param {Object.<string, string>} data - JSON 文字列
 * @return {void}
 * @example
 * createDoc( {} );
*/
DataCmnts.prototype.createDoc = function( data ){
  console.log( "[DataCmnts.js] createDoc()" );
  console.log( "[DataCmnts.js] data = " + data );

//  var jsonObj = (new Function( 'return ' + data ))();

  var doc = { date: data.date, time: data.time, area: data.area, gid: data.gid, cmnt: data.cmnt };

  MongoClient.connect( this.mongo_url, function(err, db) {
    if( err ) throw err;

    var dbo = db.db( 'comments' );          // データベースを取得する
    var clo = dbo.collection( 'feedback' ); // コレクションを取得する

    // doc をデータベースに insert する
    clo.insertOne( doc, function(err, res) {
      try{
        if( err ) throw err;

        db.close();
      }
      catch( e ){
        console.log( "[DataSensors.js] e = " + e + " : " + e.message );
        db.close();
      }
    });
  });
}


/**
 * 指定した日付のコメントを取得する。
 * @param {string} date - 対象の日付。
 * @param {function(boolean, Object.<string, number>)} callback - データを取得するためのコールバック関数
 * @return {void}
 * @example
 * getOneDay( '2018-07-25', function( err, doc ){} );
*/
DataCmnts.prototype.getOneDay = function( date, callback ){
  console.log( "[DataCmnts.js] getOneDay()" );
  console.log( "[DataCmnts.js] date   = " + date );

  MongoClient.connect( this.mongo_url, function(err, db) {
    if( err ) throw err;

    var dbo = db.db( 'comments' );          // データベースを取得する
    var clo = dbo.collection( 'feedback' ); // コレクションを取得する

    var query = { date: date };

    // {date: date} のドキュメントを取得する
    clo.find( query ).toArray( function(err, docs){
      try{
        if( err ) throw err;

        db.close();
        console.log( "[DataCmnts.js] docs.length = " + docs.length );
//        console.log( "[DataBooks.js] docs        = " + JSON.stringify(docs) );
        callback( true, docs );
      }
      catch( e ){
        console.log( "[DataBooks.js] e = " + e + " : " + e.message );
        db.close();
        callback( false, docs );
      }
    });
  });
}


module.exports = DataCmnts;


