var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var pg = require('pg');//2023.1.17　データベースオブジェクトの取得
const {transaction} = require('sequelize');
const { sequelize } = require('../models/index');
const db=require('../models/index');

/* GET users listing. */
//usersページを表示するための非同期処理
router.get('/', async function(req, res, next) {
  let transaction;//トランザクション変数を用意する。
    try{
      //sequelizeのトランザクションを設定する。
      transaction=await sequelize.transaction();
      await db.User.findAll({transaction}).then(user=>{
        var data={
          title:'Users/Index',
          content:user
        }
        res.render('users/index',data);
      });
    }catch(err){
      if(transaction) {
        await transaction.rollback();
     }
    }
});

//新規作成ページを表示する処理
router.get('/add',(req,res,next)=>{
  var data={
    title:'Users/Add'
  }
  res.render('users/add',data);
});

//新規登録を実行する処理
router.post('/add',async function(req,res,next){
  let transaction;
  try{
    //トランザクション処理を追加する。
    transaction=await sequelize.transaction();
    //formから取得した値をUserテーブルへ登録する。
    await db.User.create({
      name:req.body.name,
      pass:req.body.pass,
      mail:req.body.mail,
      age:req.body.age  
    },
    {transaction});
    console.log("success");
    //処理をコミットする。
    await transaction.commit();
    //コミット後、usersページへリダイレクトする。
    res.redirect('/users');
  }catch(err){
    if(transaction){
      await transaction.rollback();
    }
  }
});

//編集ページを表示する処理
router.get('/edit',async function(req,res,next){
  let transaction;//トランザクション変数を用意する。
    try{
      //sequelizeのトランザクションを設定する。
      transaction=await sequelize.transaction();
      await db.User.findByPk(req.query.id,{transaction}).then(user=>{
        var data={
          title:'Users/Edit',
          form:user
        }
        res.render('users/edit',data);
      });
    }catch(err){
      if(transaction) {
        await transaction.rollback();
     }
    }
});

//編集を実行する関数
router.post('/edit',async function(req,res,next){
  let transaction;
  try{
    //トランザクション処理を追加する。
    transaction=await sequelize.transaction();
    //formから取得した値をUserテーブルへ登録する。
    await db.User.update({
      name:req.body.name,
      pass:req.body.pass,
      mail:req.body.mail,
      age:req.body.age  
    },
    {where:{id:req.body.id}},
    {transaction});
    console.log("success");
    //処理をコミットする。
    await transaction.commit();
    //コミット後、usersページへリダイレクトする。
    res.redirect('/users');
  }catch(err){
    if(transaction){
      await transaction.rollback();
    }
  }
});

//削除ページを表示する処理
router.get('/delete',async function(req,res,next){
  let transaction;//トランザクション変数を用意する。
    try{
      //sequelizeのトランザクションを設定する。
      transaction=await sequelize.transaction();
      await db.User.findByPk(req.query.id,{transaction}).then(user=>{
        var data={
          title:'Users/Delete',
          form:user
        }
        res.render('users/delete',data);
      });
    }catch(err){
      if(transaction) {
        await transaction.rollback();
     }
    }
});

//削除する処理
router.post('/delete',async function(req,res,next){
  let transaction;
  try{
    //トランザクション処理を追加する。
    transaction=await sequelize.transaction();
    //formから取得した値をUserテーブルへ登録する。
    await db.User.destroy({
      where:{id:req.body.id}  
    },
    {transaction});
    console.log("success");
    //処理をコミットする。
    await transaction.commit();
    //コミット後、usersページへリダイレクトする。
    res.redirect('/users');
  }catch(err){
    if(transaction){
      await transaction.rollback();
    }
  }
});

module.exports = router;
