/**
 * @version: V1.0
 * @author: jjx
 * @description: �û�·�ɣ��ṩ�û�������Ϣ�����ӿڡ�
 * @data: 2020-03-08 9:00
 **/

'use strict';
var express = require('express');
var account = require('../public/javascripts/account');
var tools = require('../public/javascripts/tools');
var db = require('../public/javascripts/database');
var router = express.Router();

// POST ���û�ע��
router.post('/register', function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    let nickname = req.body.nickname ? req.body.nickname : "";
    let gender = req.body.gender;
    let old = req.body.old;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!username || !password || !gender || !old) {
        res.send(tools.returnjson(400, null));
        return;
    }

    // ����û����������ʽ�ĺϷ���
    let fcheck = account.checkusername(username);
    let scheck = account.checkpassword(password);
    if (fcheck) {
        res.send(tools.returnjson(fcheck, null));
        return;
    }
    if (scheck) {
        res.send(tools.returnjson(scheck, null));
        return;
    }

    // ����û����Ƿ����
    account.isuserexists(username, function (err, exist) {
        if (err) {
            res.send(tools.returnjson(500, null));
            return;
        }
        if (exist) {
            res.send(tools.returnjson(403, null));
            return;
        }
        // ע���û���Ϣ������Token
        account.regist(username, password, nickname, gender, old, function (err, token) {
            if (err) {
                res.send(tools.returnjson(500, null));
                return;
            }
            // ע��ɹ������û�Token
            res.send(tools.returnsjson(200, "token", token));
        });
    });
});

// POST �û���¼
router.post('/login', function (req, res) {
    let username = req.body.username;
    let password = req.body.password;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!username || !password) {
        res.send(tools.returnjson(400, null));
        return;
    }

    // ����û����������ʽ�ĺϷ���
    let fcheck = account.checkusername(username);
    let scheck = account.checkpassword(password);
    if (fcheck) {
        res.send(tools.returnjson(fcheck, null));
        return;
    }
    if (scheck) {
        res.send(tools.returnjson(scheck, null));
        return;
    }

    // ��֤�û�����
    account.verifypassword(username, password, function (err, token) {
        if (err) {
            res.send(tools.returnjson(500, null));
            return;
        }
        if (!token) {
            res.send(tools.returnjson(403, null));
            return;
        }
        // ������ȷ�����û�Token
        res.send(tools.returnsjson(200, "token", token));
    });
});

// POST �����û���Ϣ
router.post('/:userid', function (req, res) {
    let userid = req.params.userid;
    let token = req.headers.authorization;
    let nickname = req.body.nickname;
    let gender = req.body.gender;
    let old = req.body.old;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!userid || !token || !nickname || !gender || !old) {
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
        if (!id || userid != id) {
            res.send(tools.returnjson(403, null));
            return;
        }
        db.updateuser(id, nickname, gender, old, function (err) {
            if (err) {
                res.send(tools.returnjson(500, null));
                return;
            }
            res.send(tools.returnjson(200, null));
        });
    });
});

// GET ��ȡ�û���Ϣ
router.get('/:userid', function (req, res) {
    let userid = req.params.userid;
    let token = req.headers.authorization;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!userid || !token) {
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
        if (!id || userid != id) {
            res.send(tools.returnjson(403, null));
            return;
        }
        db.getuser(id, function (err, rows) {
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

// GET ��ȡ�û����˵�������Ϣ
router.get('/:userid/comments', function (req, res) {
    let userid = req.params.userid;
    let token = req.headers.authorization;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!userid || !token) {
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
        if (!id || userid != id) {
            res.send(tools.returnjson(403, null));
            return;
        }
        db.getucomment(id, function (err, rows) {
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

// PUT ����û���ܲ�����Ϣ
router.put('/:userid/shelf', function (req, res) {
    let userid = req.params.userid;
    let bookid = req.body.bookid;
    let status = req.body.status;
    let token = req.headers.authorization;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!userid || !bookid || !status || !token) {
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
        if (!id || userid != id) {
            res.send(tools.returnjson(403, null));
            return;
        }
        db.addshelf(id, bookid, status, function (err) {
            if (err) {
                res.send(tools.returnjson(500, null));
                return;
            }
            res.send(tools.returnjson(200, null));
        });
    });
});

// DELETE ɾ���û���ܲ�����Ϣ
router.delete('/:userid/shelf', function (req, res) {
    let userid = req.params.userid;
    let shelfid = req.body.shelfid;
    let token = req.headers.authorization;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!userid || !shelfid || !token) {
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
        if (!id || userid != id) {
            res.send(tools.returnjson(403, null));
            return;
        }
        db.deleteshelf(shelfid, function (err) {
            if (err) {
                res.send(tools.returnjson(500, null));
                return;
            }
            res.send(tools.returnjson(200, null));
        });
    });
});

// POST �����û���ܲ�����Ϣ
router.post('/:userid/shelf', function (req, res) {
    let userid = req.params.userid;
    let shelfid = req.body.shelfid;
    let status = req.body.status;
    let token = req.headers.authorization;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!userid || !shelfid || !status || !token) {
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
        if (!id || userid != id) {
            res.send(tools.returnjson(403, null));
            return;
        }
        db.updateshelf(shelfid, status, function (err) {
            if (err) {
                res.send(tools.returnjson(500, null));
                return;
            }
            res.send(tools.returnjson(200, null));
        });
    });
});

// GET ��ȡ�û���ܲ�����Ϣ
router.get('/:userid/shelf', function (req, res) {
    let userid = req.params.userid;
    let status = req.query.status;
    let token = req.headers.authorization;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!userid || !token || !status) {
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
        if (!id || userid != id) {
            res.send(tools.returnjson(403, null));
            return;
        }
        db.getshelf(id, status, function (err, rows) {
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