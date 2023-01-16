const express=require('express');
const router=express.Router();
//const postgresql = require('pg');//2023.1.14 postgreSQLパッケージをインポート
var pg = require('pg');//2023.1.14　データベースオブジェクトの取得

router.get('/', function(req, res, next) {
      var pool = new pg.Pool({ //【★大事★】poolクラスをnewする。
      database: 'expressDb', //PostgreSQLに作成したデータベース名
      user: 'postgres', //ユーザー名はデフォルト以外を利用している人は適宜変更してください。
      password: 'postgres', //PASSWORDにはPostgreSQLをインストールした際に設定したパスワードを記述。
      host: 'localhost',
      port: 5432,
    });
 
    pool.connect( function(err, client) {
      if (err) {
        console.log(err);
      } else {
        client.query('SELECT * FROM mydata', function (err, result) {
          res.render('hello/index', {
            title: 'Express',
            content: result.rows,
          });
          console.log(result); //コンソール上での確認用なため、この1文は必須ではない。
        });
      }
    });
  });

//新規作成ページ「/hello/add」を表示する処理
router.get('/add',(req,res,next)=>{
  var data={
    title:'Hello/Add',
    content:'新しいレコードを入力'
  }
  res.render('hello/add',data);
});

//新規作成ページ「/hello/add」からデータベースに登録する処理
router.post('/add',(req,res,next)=>{

  var pool = new pg.Pool({ //【★大事★】poolクラスをnewする。
    database: 'expressDb', //PostgreSQLに作成したデータベース名
    user: 'postgres', //ユーザー名はデフォルト以外を利用している人は適宜変更してください。
    password: 'postgres', //PASSWORDにはPostgreSQLをインストールした際に設定したパスワードを記述。
    host: 'localhost',
    port: 5432,
  });

  //リクエストで送信された各情報を変数に格納する。
  const inputName=req.body.name;
  const inputMail=req.body.mail;
  const inputAge=req.body.age;

  //INSERTクエリを作成する。※Value値は必ず「$1,$2,$3,...」とすること！(ほかの変数にすると構文エラーになる。)
  const text = 'INSERT INTO mydata(name, mail,age) VALUES($1, $2, $3) RETURNING *'
  //INSERTクエリのVALUE値に入れる各情報を配列で定義する。
  const values = [inputName, inputMail,inputAge]

  //データベースへの登録処理
  pool.connect( function(err, client) {
    try{
      //トランザクションを開始する。
      client.query("START TRANSACTION");
      //INSERTクエリを実行する。
      client.query(text, values);
      //登録処理をコミットする。
      client.query("COMMIT");
      
    }catch(err){
      client.rollback(); //登録が失敗したらロールバックする。
    }finally{
      client.release(); //データベースの接続を切る。
      res.redirect('/hello'); //「/hello」ページへリダイレクトする。
    }

    /*
    if (err) {
      console.log(err);
    } else {
      client.query(text, values, (err, res) => {
        if (err) {
          console.log(err.stack)
        } else {
          
        }
      })
      res.redirect('/hello');
    }
    */

  });
 
});

//詳細ページ「show.ejs」を実行する処理。
router.get('/show',(req,res,next)=>{

  var pool = new pg.Pool({ //【★大事★】poolクラスをnewする。
    database: 'expressDb', //PostgreSQLに作成したデータベース名
    user: 'postgres', //ユーザー名はデフォルト以外を利用している人は適宜変更してください。
    password: 'postgres', //PASSWORDにはPostgreSQLをインストールした際に設定したパスワードを記述。
    host: 'localhost',
    port: 5432,
  });

  //リクエストパラメータからidを取得する。
  const id=req.query.id;
  //SELECTクエリを生成する。
  const text='select * from mydata where id = $1';
  //where句にidをつめる。
  const values=id;

  //データベースへの登録処理
  pool.connect( function(err, client) {
    try{
      //トランザクションを開始する。
      client.query("START TRANSACTION");
      //SELECTクエリを実行する。第一引数：SELECTクエリを入力、第二引数：リクエストパラメータの配列を入力、第三引数：関数
      client.query(text, [values], function (err, result) {
        res.render('hello/show', {
          title: 'Hello/Show',
          content:'id=のレコード',
          mydata: result.rows[0],//←取得したレコード「row」のIndex 0番目を指定する。
        });
        
        console.log(result); //コンソール上での確認用なため、この1文は必須ではない。
      });

      //コミットする。
      client.query("COMMIT");
      
    }catch(err){
      client.rollback(); //失敗したらロールバックする。
    }finally{
      client.release(); //データベースの接続を切る。
      
    }
  });

});

//編集「edit.ejs」を表示する処理。
router.get('/edit',(req,res,next)=>{

  var pool = new pg.Pool({ //【★大事★】poolクラスをnewする。
    database: 'expressDb', //PostgreSQLに作成したデータベース名
    user: 'postgres', //ユーザー名はデフォルト以外を利用している人は適宜変更してください。
    password: 'postgres', //PASSWORDにはPostgreSQLをインストールした際に設定したパスワードを記述。
    host: 'localhost',
    port: 5432,
  });
  //リクエストパラメータからid値を取得する。
  const id= req.query.id;
  //SELECTクエリを生成する。
  const text= 'select * from mydata where id = $1';
  //where句にidをつめる。
  const values=id;
  
  pool.connect(function(err,client){
    try{
      client.query('START TRANSACTION');
      //クエリを実行する。第一引数：SELECTクエリを入力、第二引数：リクエストパラメータの配列を入力、第三引数：関数
      client.query(text,[values],function(err,result){
        res.render('hello/edit',{
          title:'hello/edit',
          content:'id='+id+'のレコードを編集する。',
          mydata:result.rows[0]
        });
      console.log(result);
      console.log("正常に処理完了。");
    });
      client.query('COMMIT');
  
    }catch(err){
      client.rollback();
    }finally{
      client.release();
    }
  });

});

//更新を実行する処理
router.post('/edit',(req,res,next)=>{

  var pool = new pg.Pool({ //【★大事★】poolクラスをnewする。
    database: 'expressDb', //PostgreSQLに作成したデータベース名
    user: 'postgres', //ユーザー名はデフォルト以外を利用している人は適宜変更してください。
    password: 'postgres', //PASSWORDにはPostgreSQLをインストールした際に設定したパスワードを記述。
    host: 'localhost',
    port: 5432,
  });

  //リクエストで送信された各情報を変数に格納する。
  const inputId=req.body.id;
  const inputName=req.body.name;
  const inputMail=req.body.mail;
  const inputAge=req.body.age;

  //UPDATEクエリを生成する。
  const text='update mydata set name=$1,mail=$2,age=$3 where id=$4;';
  const values=[inputName,inputMail,inputAge,inputId];

  pool.connect(function(err,client){
    try{
      client.query('START TRANSACTION');
      client.query(text,values,function(err,result){
        console.log("正常に処理完了。");
      });
      client.query('COMMIT');
      //helloページにリダイレクト
      res.redirect('/hello');
    }catch(err){
      client.rollback();
    }finally{
      client.release();
    }
  });
});

//削除ページ[delete.ejs]を表示する処理
router.get('/delete',(req,res,next)=>{

  var pool = new pg.Pool({ //【★大事★】poolクラスをnewする。
    database: 'expressDb', //PostgreSQLに作成したデータベース名
    user: 'postgres', //ユーザー名はデフォルト以外を利用している人は適宜変更してください。
    password: 'postgres', //PASSWORDにはPostgreSQLをインストールした際に設定したパスワードを記述。
    host: 'localhost',
    port: 5432,
  });

  //リクエストパラメーターからid値を取得する。
  const id =req.query.id;
  //SELECTクエリを生成する。
  const text='select * from mydata where id = $1';
  const values =id;

  pool.connect(function(err,client){
    try{
      client.query('START TRANSACTION');
      client.query(text,[values],function(err,result){
        res.render('hello/delete',{
          title:'hello/delete',
          content:'id='+id+'のレコード',
          mydata:result.rows[0]
      });
      });
      client.query('COMMIT');
    }catch(err){
      client.rollback();
    }finally{
      client.release();
    }
  });

});

//登録データの削除処理
router.post('/delete',(req,res,next)=>{
  var pool = new pg.Pool({ //【★大事★】poolクラスをnewする。
    database: 'expressDb', //PostgreSQLに作成したデータベース名
    user: 'postgres', //ユーザー名はデフォルト以外を利用している人は適宜変更してください。
    password: 'postgres', //PASSWORDにはPostgreSQLをインストールした際に設定したパスワードを記述。
    host: 'localhost',
    port: 5432,
  });

  //リクエストで送信された各情報を変数に格納する。
  const inputId=req.body.id;

  //DELETEクエリを生成する。
  const text='delete from mydata where id = $1';
  const values=inputId;

  pool.connect(function(err,client){
    try{
      client.query('START TRANSACTION');
      client.query(text,[values],function(err,result){
        console.log("削除処理完了");
      });
      client.query('COMMIT');
      //helloページへリダイレクトする。
      res.redirect('/hello');
    }catch(err){
      client.rollback();
    }finally{
      client.release();
    }
  });
});

//検索「find」ページを表示する処理
router.get('/find',(req,res,next)=>{
  var pool = new pg.Pool({ //【★大事★】poolクラスをnewする。
    database: 'expressDb', //PostgreSQLに作成したデータベース名
    user: 'postgres', //ユーザー名はデフォルト以外を利用している人は適宜変更してください。
    password: 'postgres', //PASSWORDにはPostgreSQLをインストールした際に設定したパスワードを記述。
    host: 'localhost',
    port: 5432,
  });

  pool.connect( function(err, client) {
    if (err) {
      console.log(err);
    } else {
      client.query('SELECT * FROM mydata', function (err, result) {
        res.render('hello/find', {
          title: 'Express',
          find:'',
          content: '検索条件を入力してください。',
          mydata:result.rows
        });
        console.log(result); //コンソール上での確認用なため、この1文は必須ではない。
      });
    }
  });
});

//検索ページ「find.ejs」の検索フォームにテキストを入力して結果を取得する処理
router.post('/find',(req,res,next)=>{

  var pool = new pg.Pool({ //【★大事★】poolクラスをnewする。
    database: 'expressDb', //PostgreSQLに作成したデータベース名
    user: 'postgres', //ユーザー名はデフォルト以外を利用している人は適宜変更してください。
    password: 'postgres', //PASSWORDにはPostgreSQLをインストールした際に設定したパスワードを記述。
    host: 'localhost',
    port: 5432,
  });

  //リクエストパラメーター「find」から値を取得する。
  var findInputText = req.body.find;

  //リクエストパラメーターで取得した変数「findInputText」を追加したSELECTクエリを生成する。
  const text='select * from mydata where '+ findInputText;
  console.log(text);
  
  pool.connect(function(err,client){
    try{
      //トランザクションを開始する。
      client.query('START TRANSACTION');
      //クエリを実行する。第一引数にformから取得したテキストを追加したSELECTクエリ、第二引数に関数を追加。
      client.query(text,function(err,result){
        res.render('hello/find',{
          title:'hello/find',
          find:findInputText,
          content:'検索条件：'+findInputText+'のレコード',
          mydata:result.rows
        });
      });
      //処理をコミットする。
      client.query('COMMIT');
    }catch(err){
      client.rollback();
    }finally{
      client.release();
    }
  });

});

/*
router.post('/post',(req,res,next)=>{
    var msg=req.body['message'];
    req.session.message=msg;
    var data={
        title:'Hello!',
        content:"Last Message:"+req.session.message
    }
    res.render('hello',data);
});
*/

module.exports=router;