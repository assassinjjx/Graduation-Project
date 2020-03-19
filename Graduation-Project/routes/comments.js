/**
 * @version: V1.0
 * @author: jjx
 * @description: �Ƽ�·�ɣ��ṩ�Ƽ����������ӿڡ�
 * @data: 2020-03-11 15:00
 **/

'use strict';
var express = require('express');
var router = express.Router();
var account = require('../public/javascripts/account');
var tools = require('../public/javascripts/tools');
var db = require('../public/javascripts/database');

// GET ��ȡ�Ƽ�����
router.get('/', function (req, res) {
    let token = req.headers.authorization;

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