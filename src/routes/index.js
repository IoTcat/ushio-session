var express = require('express');
var expressWs = require('express-ws');
var router = express.Router();
var redis = require('redis');
var md5 = require('md5');
var mysql = require('mysql');

/* mysql start */
var sql = mysql.createConnection(require('/mnt/config/dbKeys/auth.js'));
sql.connect();

/* redis start */
var rc = new redis.createClient({
    host: 'redis'
});


var getAddress = (mask) => {
    return new Promise((resolve, reject)=>{
        sql.query("SELECT * FROM mask where mask=?", [mask], (err, res, fields)=>{
            if(err || typeof res[0] == "undefined"){
                resolve(null);
                return;
            }
            var token = res[0]['token'];
            sql.query("SELECT * FROM token where token=?", [token], (err, res, fields)=>{
                if(err || typeof res[0] == "undefined"){
                    resolve(token);
                    return;
                }
                if(!res[0]['state']){
                    resolve(token);
                    return;
                }
                var hash = res[0]['hash'];
                resolve(hash);
            }) 
        });
    });
}


router.get('/set', async function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); 
    if(!req.query.key || !req.query.val || !req.query.t || !req.query.mask) {res.send({"code":"500"});;return;}
    let hash = await getAddress(req.query.mask);
    rc.hset('session/dialog/'+hash, req.query.key, req.query.val);
    rc.hset('session/dialog/'+hash, 'LastOperateTime', req.query.t);
    res.send({code:"200"}); 
});

router.get('/del', async function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    if(!req.query.del || !req.query.mask || !req.query.t) {res.send({"code":"500"});;return;}
    
    let hash = await getAddress(req.query.mask);
    rc.hdel('session/dialog/'+hash, req.query.del);
    rc.hset('session/dialog/'+hash, 'LastOperateTime', req.query.t);
    res.send({code:"200"}); 
});


router.get('/get', async function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    if(!req.query.mask) {res.send({"code":"500"});;return;}
    let hash = await getAddress(req.query.mask);
    var o = {};
           rc.hkeys('session/dialog/'+hash, function(err, keys){
           if(!err){
	     if(!keys.length){
                o['hash'] = hash;
                res.send(o);
             }
             keys.forEach(function(key, i){
               rc.hget('session/dialog/'+hash, key, function(err2, val){
                 if(!err2){
                   o[key] = val;
                   if(i == keys.length - 1){
                     o['hash'] = hash;
                     res.send(o);
                   }
                 }
               })
             });
           }
         });

});




expressWs(router);

router
  .ws('/', async function (ws, req){
     if(req.query.mask){
    var hash = await getAddress(req.query.mask);
     }else{
	ws.close();
     }
      ws.on('message', async function (msg) {
        if(msg == 'get'){
           var o = {};
           rc.hkeys('session/dialog/'+hash, function(err, keys){
           if(!err){

             keys.forEach(function(key, i){
               rc.hget('session/dialog/'+hash, key, function(err2, val){
                 if(!err2){
                   o[key] = val;
                   if(i == keys.length - 1){
                     o['hash'] = hash;
                     ws.send(JSON.stringify(o));
                   }
                 }
               })
             });
           }
         });
        }else if(isJson(msg)){
            obj = JSON.parse(msg);
            if(obj.del && obj.t){
               rc.hdel('session/dialog/'+hash, obj.del);
               rc.hset('session/dialog/'+hash, 'LastOperateTime', obj.t);
            }
            if(obj.key && obj.val && obj.t){
               rc.hset('session/dialog/'+hash, obj.key, obj.val);
               rc.hset('session/dialog/'+hash, 'LastOperateTime', obj.t);
            }
        }
      })
   })

module.exports = router;


function isJson(str) {
        try {
            if (typeof JSON.parse(str) == "object") {
                return true;
            }
        } catch(e) {
        }
        return false;
}
