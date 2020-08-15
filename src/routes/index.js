var express = require('express');
var expressWs = require('express-ws');
var router = express.Router();
var redis = require('redis');
var md5 = require('md5');


/* redis start */
var rc = new redis.createClient({
    host: 'redis'
});


var checkRedirect = (id, resolve, reject) => {
    rc.get('session/redirect/'+id, (err, val) => {
        if(err || !val){
            setTimeout(checkRedirect, 20, id, resolve, reject);
        }else{
           checkRedirect2(val, resolve, reject);
        }
    });
}

var checkRedirect2 = (token, resolve, reject) => {
    rc.get('auth/token/'+token, (err, val) => {
        if(!val){
            resolve(token);
        }else{
           resolve(val); 
        }
    });
}


var getAddress = (fp, mask) => {
    let id = md5(fp+mask);
    return new Promise((resolve, reject) => {
        checkRedirect(id, resolve, reject);
    });
}

router.get('/set', async function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); 
    if(!req.query.key || !req.query.val || !req.query.fp || !req.query.t || !req.query.mask) {res.send({"code":"500"});;return;}
    let hash = await getAddress(req.query.fp, req.query.mask);
    rc.hset('session/dialog/'+hash, req.query.key, req.query.val);
    rc.hset('session/dialog/'+hash, 'LastOperateTime', req.query.t);
    res.send({code:"200"}); 
});

router.get('/del', async function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    if(!req.query.del || !req.query.fp || !req.query.mask || !req.query.t) {res.send({"code":"500"});;return;}
    
    let hash = await getAddress(req.query.fp, req.query.mask);
    rc.hdel('session/dialog/'+hash, req.query.del);
    rc.hset('session/dialog/'+hash, 'LastOperateTime', req.query.t);
    res.send({code:"200"}); 
});


router.get('/get', async function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    if(!req.query.fp || !req.query.mask) {res.send({"code":"500"});;return;}
    let hash = await getAddress(req.query.fp, req.query.mask);
    var o = {};
           rc.hkeys('session/dialog/'+hash, function(err, keys){
           if(!err){
	     if(!keys.length){
                res.send(o);
             }
             keys.forEach(function(key, i){
               rc.hget('session/dialog/'+hash, key, function(err2, val){
                 if(!err2){
                   o[key] = val;
                   if(i == keys.length - 1){
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
     if(req.query.fp.length == 6 && req.query.mask){
	var fp = req.query.fp;
	var mask = req.query.mask;
    var hash = await getAddress(req.query.fp, req.query.mask);
     }else{
	ws.close();
     }
      ws.on('message', async function (msg) {
        hash = await getAddress(req.query.fp, req.query.mask);
        if(msg == 'get'){
           var o = {};
           rc.hkeys('session/dialog/'+hash, function(err, keys){
           if(!err){

             keys.forEach(function(key, i){
               rc.hget('session/dialog/'+hash, key, function(err2, val){
                 if(!err2){
                   o[key] = val;
                   if(i == keys.length - 1){
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
