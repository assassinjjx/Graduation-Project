/**
 * @version: V1.0
 * @author: jjx
 * @description: 书库路由，提供书库信息操作接口。
 * @data: 2020-03-11 13:00
 **/

'use strict';
var express = require('express');
var router = express.Router();
var account = require('../public/javascripts/account');
var tools = require('../public/javascripts/tools');
var db = require('../public/javascripts/database');

// GET 获取书库书籍信息
router.get('/', function (req, res) {
    let token = req.headers.authorization;
    let type = req.query.type !=  '0' ? req.query.type : null;
    let lwords = req.query.lwords != '0' ? req.query.lwords : null;
    let hwords = req.query.hwords != '0' ? req.query.hwords : null;
    let status = req.query.status != '-1' ? req.query.status : null;
    let order = req.query.order ? req.query.order  : "totalstar";

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
        db.selectbook(id, type, lwords, hwords, status, order, function (err, rows) {
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