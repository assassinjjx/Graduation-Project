/**
 * @version: V1.0
 * @author: jjx
 * @description: �鼮·�ɣ��ṩ�鼮������Ϣ�����ӿڡ�
 * @data: 2020-03-10 13:00
 **/

'use strict';
var express = require('express');
var router = express.Router();
var account = require('../public/javascripts/account');
var tools = require('../public/javascripts/tools');
var db = require('../public/javascripts/database');

// POST ������鼮
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

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!title || !author || !type || !status || !words || !summarize || !latest || !icon || !titlelink || !latestlink || !token) {
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
        db.addbook(title, author, type, status, words, summarize, latest, icon, titlelink, latestlink, function (err) {
            if (err) {
                res.send(tools.returnjson(500, null));
                return;
            }
            res.send(tools.returnjson(200, null));
        });
    });
});

// GET ��ȡ�鼮����
router.get('/:bookid', function (req, res) {
    let bookid = req.params.bookid;
    let token = req.headers.authorization;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!bookid || !token) {
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

// PUT ����鼮������Ϣ
router.put('/:bookid/mycomment', function (req, res) {
    let bookid = req.params.bookid;
    let star = req.body.star;
    let content = req.body.content;
    let token = req.headers.authorization;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!bookid || !star || !content || !token) {
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

// DELETE ɾ���鼮������Ϣ
router.delete('/:bookid/mycomment', function (req, res) {
    let bookid = req.params.bookid;
    let commentid = req.body.commentid;
    let star = req.body.star;
    let token = req.headers.authorization;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!bookid || !star || !commentid || !token) {
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

// POST �����鼮������Ϣ
router.post('/:bookid/mycomment', function (req, res) {
    let bookid = req.params.bookid;
    let commentid = req.body.commentid;
    let content = req.body.content;
    let variance = req.body.variance;
    let token = req.headers.authorization;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!bookid || !commentid || !content || !variance || !token) {
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

// GET ��ȡ�鼮��ͨ������Ϣ
router.get('/:bookid/comments', function (req, res) {
    let bookid = req.params.bookid;
    let token = req.headers.authorization;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!bookid || !token) {
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

// GET ��ȡ�鼮��Ʒ������Ϣ
router.get('/:bookid/qcomments', function (req, res) {
    let bookid = req.params.bookid;
    let token = req.headers.authorization;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!bookid || !token) {
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

// GET ��ȡ�鼮�б��˵�������Ϣ
router.get('/:bookid/mycomment', function (req, res) {
    let bookid = req.params.bookid;
    let token = req.headers.authorization;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!bookid || !token) {
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

// POST ���������е���
router.post('/:bookid/praise', function (req, res) {
    let bookid = req.params.bookid;
    let commentid = req.body.commentid;
    let token = req.headers.authorization;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!bookid || !commentid || !token) {
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

// POST ������ȡ������
router.delete('/:bookid/praise', function (req, res) {
    let commentid = req.body.commentid;
    let token = req.headers.authorization;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!commentid || !token) {
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

// PUT ��Ӵ����Ϣ
router.put('/:bookid/vs', function (req, res) {
    let bookid = req.params.bookid;
    let fcommentid = req.body.fcommentid;
    let scommentid = req.body.scommentid;
    let token = req.headers.authorization;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!bookid || !fcommentid || !scommentid || !token) {
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
        db.addvs(bookid, fcommentid, scommentid, function (err) {
            if (err) {
                res.send(tools.returnjson(500, null));
                return;
            }
            res.send(tools.returnjson(200, null));
        });
    });
});

// POST �Դ����Ϣ����ͶƱ
router.post('/:bookid/vs', function (req, res) {
    let vsid = req.body.vsid;
    let scorekeeper = req.body.scorekeeper;
    let token = req.headers.authorization;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!vsid || !scorekeeper || !token) {
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

// GET ��ȡ�鼮�Ĵ����Ϣ
router.get('/:bookid/vs', function (req, res) {
    let bookid = req.params.bookid;
    let token = req.headers.authorization;

    // ��鴫������Ƿ���ڻ����Ƿ�Ϊ��
    if (!bookid || !token) {
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