var express = require('express');
var expressWs = require('express-ws');
var router = express.Router();
var redis = require('redis');


/* redis start */
var rc = new redis.createClient();

router.get('/set', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); 
    if(!req.query.key || !req.query.val || !req.query.fp || !req.query.t) {res.send({"code":"500"});;return;}
    
    rc.hset('session/'+req.query.fp, req.query.key, req.query.val);
    rc.hset('session/'+req.query.fp, 'LastOperateTime', req.query.t);
    res.send({code:"200"}); 
});

router.get('/del', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    if(!req.query.del || !req.query.fp || !req.query.t) {res.send({"code":"500"});;return;}
    
    rc.hdel('session/'+req.query.fp, req.query.del);
    rc.hset('session/'+req.query.fp, 'LastOperateTime', req.query.t);
    res.send({code:"200"}); 
});


router.get('/get', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    if(!req.query.fp) {res.send({"code":"500"});;return;}
    var o = {};
           rc.hkeys('session/'+req.query.fp, function(err, keys){
           if(!err){
	     if(!keys.length){
                res.send(o);
             }
             keys.forEach(function(key, i){
               rc.hget('session/'+req.query.fp, key, function(err2, val){
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
  .ws('/', function (ws, req){
     if(req.query.fp.length == 8){
	var fp = req.query.fp;
     }else{
	ws.close();
     }
      ws.on('message', function (msg) {
        if(msg == 'get'){
           var o = {};
           rc.hkeys('session/'+fp, function(err, keys){
           if(!err){

             keys.forEach(function(key, i){
               rc.hget('session/'+fp, key, function(err2, val){
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
               rc.hdel('session/'+fp, obj.del);
               rc.hset('session/'+fp, 'LastOperateTime', obj.t);
            }
            if(obj.key && obj.val && obj.t){
               rc.hset('session/'+fp, obj.key, obj.val);
               rc.hset('session/'+fp, 'LastOperateTime', obj.t);
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
