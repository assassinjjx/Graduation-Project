/**
 * @version: V1.0
 * @author: jjx
 * @description: 推荐路由，提供推荐书评操作接口。
 * @data: 2020-03-11 15:00
 **/

'use strict';
var express = require('express');
var router = express.Router();
var account = require('../public/javascripts/account');
var tools = require('../public/javascripts/tools');
var db = require('../public/javascripts/database');

// GET 获取推荐书评
router.get('/', function (req, res) {
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!token) {
        res.send(tools.returnjson(400, null));
        return;
    }

    // 验证用户Token
    account.verifytoken(token, function (err, id) {
        if (err) {
            if (id) {
                res.send(tools.returnjson(401, null));
                return;
            }
            res.send(tools.returnjson(500, null));
            return;
        }
        if (!id) {
            res.send(tools.returnjson(403, null));
            return;
        }
        db.selectcomment(id, function (err, rows) {
            if (err) {
                res.send(tools.returnjson(500, null));
                return;
            }
            if (!rows) {
                res.send(tools.returnjson(404, null));
                return;
            }
            res.send(tools.returnjson(200, rows));
        });
    });
});

module.exports = router;