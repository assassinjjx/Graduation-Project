/**
 * @version: V1.0
 * @author: jjx
 * @description: 书籍路由，提供书籍详情信息操作接口。
 * @data: 2020-03-10 13:00
 **/

'use strict';
var express = require('express');
var router = express.Router();
var account = require('../public/javascripts/account');
var tools = require('../public/javascripts/tools');
var db = require('../public/javascripts/database');

// POST 添加新书籍
router.post('/', function (req, res) {
    let title = req.body.title;
    let author = req.body.author;
    let type = req.body.type;
    let status = req.body.status;
    let words = req.body.words;
    let summarize = req.body.summarize;
    let latest = req.body.latest;
    let icon = req.body.icon;
    let titlelink = req.body.titlelink;
    let latestlink = req.body.latestlink;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!title || !author || !type || !status || !words || !summarize || !latest || !icon || !titlelink || !latestlink || !token) {
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
        db.addbook(title, author, type, status, words, summarize, latest, icon, titlelink, latestlink, function (err) {
            if (err) {
                res.send(tools.returnjson(500, null));
                return;
            }
            res.send(tools.returnjson(200, null));
        });
    });
});

// GET 获取书籍详情
router.get('/:bookid', function (req, res) {
    let bookid = req.params.bookid;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!bookid || !token) {
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
        db.getbook(bookid, id, function (err, rows) {
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

// PUT 添加书籍书评信息
router.put('/:bookid/mycomment', function (req, res) {
    let bookid = req.params.bookid;
    let star = req.body.star;
    let content = req.body.content;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!bookid || !star || !content || !token) {
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
        db.addcomment(bookid, id, star, content, function (err) {
            if (err) {
                res.send(tools.returnjson(500, null));
                return;
            }
            db.updatebstar(bookid, star, function (err) {
                if (err) {
                    res.send(tools.returnjson(500, null));
                    return;
                }
                db.updatebpeople(bookid, 1, function (err) {
                    if (err) {
                        res.send(tools.returnjson(500, null));
                        return;
                    }
                    res.send(tools.returnjson(200, null));
                });
            });
        });
    });
});

// DELETE 删除书籍书评信息
router.delete('/:bookid/mycomment', function (req, res) {
    let bookid = req.params.bookid;
    let commentid = req.body.commentid;
    let star = req.body.star;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!bookid || !star || !commentid || !token) {
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
        db.deletecomment(commentid, function (err) {
            if (err) {
                res.send(tools.returnjson(500, null));
                return;
            }
            db.updatebstar(bookid, -star, function (err) {
                if (err) {
                    res.send(tools.returnjson(500, null));
                    return;
                }
                db.updatebpeople(bookid, -1, function (err) {
                    if (err) {
                        res.send(tools.returnjson(500, null));
                        return;
                    }
                    res.send(tools.returnjson(200, null));
                });
            });
        });
    });
});

// POST 更改书籍书评信息
router.post('/:bookid/mycomment', function (req, res) {
    let bookid = req.params.bookid;
    let commentid = req.body.commentid;
    let content = req.body.content;
    let variance = req.body.variance;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!bookid || !commentid || !content || !variance || !token) {
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
        db.updatecomment(commentid, variance, content, function (err) {
            if (err) {
                res.send(tools.returnjson(500, null));
                return;
            }
            db.updatebstar(bookid, variance, function (err) {
                if (err) {
                    res.send(tools.returnjson(500, null));
                    return;
                }
                res.send(tools.returnjson(200, null));
            });
        });
    });
});

// GET 获取书籍普通书评信息
router.get('/:bookid/comments', function (req, res) {
    let bookid = req.params.bookid;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!bookid || !token) {
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
        db.getbcomment(id, bookid, function (err, rows) {
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

// GET 获取书籍精品书评信息
router.get('/:bookid/qcomments', function (req, res) {
    let bookid = req.params.bookid;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!bookid || !token) {
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
        db.getbqcomment(id, bookid, function (err, rows) {
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

// GET 获取书籍中本人的书评信息
router.get('/:bookid/mycomment', function (req, res) {
    let bookid = req.params.bookid;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!bookid || !token) {
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
        db.getubcomment(id, bookid, function (err, rows) {
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

// POST 对书评进行点赞
router.post('/:bookid/praise', function (req, res) {
    let bookid = req.params.bookid;
    let commentid = req.body.commentid;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!bookid || !commentid || !token) {
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
        db.addpraise(commentid, id, function (err) {
            if (err) {
                res.send(tools.returnjson(500, null));
                return;
            }
            db.updatecpraise(commentid, 1, function (err) {
                if (err) {
                    res.send(tools.returnjson(500, null));
                    return;
                }
                db.getcpraise(commentid, function (err, num) {
                    if (err) {
                        res.send(tools.returnjson(500, null));
                        return;
                    }
                    if (num === null) {
                        res.send(tools.returnjson(404, null));
                        return;
                    }
                    if (num < 100) {
                        res.send(tools.returnjson(200, null));
                        return;
                    }
                    db.getbqcomment(id, bookid, function (err, rows) {
                        if (err) {
                            res.send(tools.returnjson(500, null));
                            return;
                        }
                        if (!rows || rows.length < 10) {
                            db.updatecquality(commentid, true, function (err) {
                                if (err) {
                                    res.send(tools.returnjson(500, null));
                                    return;
                                }
                            });
                        }
                        res.send(tools.returnjson(200, null));
                    });
                });
            });
        });
    });
});

// POST 对书评取消点赞
router.delete('/:bookid/praise', function (req, res) {
    let commentid = req.body.commentid;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!commentid || !token) {
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
        db.deletepraise(commentid, id, function (err) {
            if (err) {
                res.send(tools.returnjson(500, null));
                return;
            }
            db.updatecpraise(commentid, -1, function (err) {
                if (err) {
                    res.send(tools.returnjson(500, null));
                    return;
                }
                res.send(tools.returnjson(200, null));
            });
        });
    });
});

// PUT 添加打榜信息
router.put('/:bookid/vs', function (req, res) {
    let bookid = req.params.bookid;
    let fcommentid = req.body.fcommentid;
    let scommentid = req.body.scommentid;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!bookid || !fcommentid || !scommentid || !token) {
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
        db.addvs(bookid, fcommentid, scommentid, function (err) {
            if (err) {
                res.send(tools.returnjson(500, null));
                return;
            }
            res.send(tools.returnjson(200, null));
        });
    });
});

// POST 对打榜信息进行投票
router.post('/:bookid/vs', function (req, res) {
    let vsid = req.body.vsid;
    let scorekeeper = req.body.scorekeeper;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!vsid || !scorekeeper || !token) {
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
        db.judgeencourage(vsid, id, function (err, judge) {
            if (err) {
                res.send(tools.returnjson(500, null));
                return;
            }
            if (judge) {
                res.send(tools.returnjson(403, null));
                return;
            }
            db.updatevs(vsid, scorekeeper, function (err) {
                if (err) {
                    res.send(tools.returnjson(500, null));
                    return;
                }
                db.addencourage(vsid, id, function (err) {
                    if (err) {
                        res.send(tools.returnjson(500, null));
                        return;
                    }
                    res.send(tools.returnjson(200, null));
                });
            });
        });
    });
});

// GET 获取书籍的打榜信息
router.get('/:bookid/vs', function (req, res) {
    let bookid = req.params.bookid;
    let token = req.headers.authorization;

    // 检查传入参数是否存在或者是否为空
    if (!bookid || !token) {
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
        db.getvs(id, bookid, function (err, rows) {
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