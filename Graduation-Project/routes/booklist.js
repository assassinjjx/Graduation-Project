/**
 * @version: V1.0
 * @author: jjx
 * @description: ���·�ɣ��ṩ�����Ϣ�����ӿڡ�
 * @data: 2020-03-11 13:00
 **/

'use strict';
var express = require('express');
var router = express.Router();
var account = require('../public/javascripts/account');
var tools = require('../public/javascripts/tools');
var db = require('../public/javascripts/database');

// GET ��ȡ����鼮��Ϣ
router.get('/', function (req, res) {
    let token = req.headers.authorization;
    let type = req.query.type !=  '0' ? req.query.type : null;
    let lwords = req.query.lwords != '0' ? req.query.lwords : null;
    let hwords = req.query.hwords != '0' ? req.query.hwords : null;
    let status = req.query.status != '-1' ? req.query.status : null;
    let order = req.query.order ? req.query.order  : "totalstar";

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!token) {
        res.send(tools.returnjson(400, null));
        return;
    }

    // ��֤�û�Token
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