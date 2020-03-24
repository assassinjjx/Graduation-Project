/**
 * @version: V1.0
 * @author: jjx
 * @description: 用户路由，提供用户个人信息操作接口。
 * @data: 2020-03-08 9:00
 **/

'use strict';
var express = require('express');
var account = require('../public/javascripts/account');
var tools = require('../public/javascripts/tools');
var db = require('../public/javascripts/database');
var router = express.Router();

// POST 新用户注册
router.post('/register', function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    let nickname = req.body.nickname ? req.body.nickname : "";
    let gender = req.body.gender;
    let old = req.body.old;

    // 检查传入参数是否存在或者是否为空
    if (!username || !password || !gender || !old) {
        res.send(tools.returnjson(400, null));
        return;
    }

    // 检查用户名及密码格式的合法性
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

    // 检查用户名是否存在
    account.isuserexists(username, function (err, exist) {
        if (err) {
            res.send(tools.returnjson(500, null));
            return;
        }
        if (exist) {
            res.send(tools.returnjson(403, null));
            return;
        }
        // 注册用户信息并生成Token
        account.regist(username, password, nickname, gender, old, function (err, token) {
            if (err) {
                res.send(tools.returnjson(500, null));
                return;
            }
            // 注册成功返回用户Token
            res.send(tools.returnsjson(200, "token", token));
        });
    });
});

// POST 用户登录
router.post('/login', function (req, res) {
    let username = req.body.username;
    let password = req.body.password;

    // 检查传入参数是否存在或者是否为空
    if (!username || !password) {
        res.send(tools.returnjson(400, null));
        return;
    }

    // 检查用户名及密码格式的合法性
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

    // 验证用户密码
    account.verifypassword(username, password, function (err, token) {
        if (err) {
            res.send(tools.returnjson(500, null));
            return;
        }
        if (!token) {
            res.send(tools.returnjson(403, null));
            return;
        }
        // 密码正确返回用户Token
        res.send(tools.returnsjson(200, "token", token));
    });
});

// POST 更改用户信息
router.post('/:userid', function (req, res) {
    let userid = req.params.userid;
    let token = req.headers.authorization;
    let nickname = req.body.nickname;
    let gender = req.body.gender;
    let old = req.body.old;

    // 检查传入参数是否存在或者是否为空
    if (!userid || !token || !nickname || !gender || !old) {
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

// GET 获取用户信息
router.get('/:userid', function (req, res) {
    let userid = req.params.userid;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!userid || !token) {
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

// GET 获取用户本人的评论信息
router.get('/:userid/comments', function (req, res) {
    let userid = req.params.userid;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!userid || !token) {
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

// PUT 添加用户书架藏书信息
router.put('/:userid/shelf', function (req, res) {
    let userid = req.params.userid;
    let bookid = req.body.bookid;
    let status = req.body.status;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!userid || !bookid || !status || !token) {
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

// DELETE 删除用户书架藏书信息
router.delete('/:userid/shelf', function (req, res) {
    let userid = req.params.userid;
    let shelfid = req.body.shelfid;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!userid || !shelfid || !token) {
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

// POST 更改用户书架藏书信息
router.post('/:userid/shelf', function (req, res) {
    let userid = req.params.userid;
    let shelfid = req.body.shelfid;
    let status = req.body.status;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!userid || !shelfid || !status || !token) {
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

// GET 获取用户书架藏书信息
router.get('/:userid/shelf', function (req, res) {
    let userid = req.params.userid;
    let status = req.query.status;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!userid || !token || !status) {
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