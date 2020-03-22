/**
 * @version: V1.2
 * @author: jjx
 * @description: 数据库管理类,负责构建SQL语句，与数据库进行交互，并生成接口提供给上一层。
 * @data: 2020-02-24 10:00
 **/

var mysql = require('mysql2');
var info = require('./settings');
var db = {};

/**
 * 创建数据库连接池
 * 
 * @return var
 */
var pool = mysql.createPool({
    host: info.DB_HOST,
    user: info.DB_USER,
    password: info.DB_PASS,
    database: info.DB_NAME,
    port: 3306,
    charset: 'utf8mb4'
});

/**
 * 当数据库无内容时，初始化创建数据库表结构和数据库事件
 *
 * @return var
 */
pool.getConnection(function (err, connection) {
    if (err) {
        console.log(err);
        return;
    }
    connection.query("CREATE TABLE IF NOT EXISTS books(" +
        "id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY, " +
        "title VARCHAR(255) NOT NULL, " +
        "author VARCHAR(50) NOT NULL, " +
        "type VARCHAR(10) NOT NULL, " +
        "status BOOLEAN NOT NULL, " +
        "words INTEGER UNSIGNED NOT NULL, " +
        "summarize VARCHAR(255) NOT NULL, " +
        "latest VARCHAR(30) NOT NULL, " +
        "totalstar DECIMAL(10,1) DEFAULT 0, " +
        "totalpeople DECIMAL(10,1) DEFAULT 0, " +
        "icon VARCHAR(255) NOT NULL, " +
        "titlelink VARCHAR(255) NOT NULL, " +
        "latestlink VARCHAR(255) NOT NULL, " +
        "CONSTRAINT un_books UNIQUE (title, author))", function (err) {
            if (err) {
                console.log(err);
                return;
            }
        });
    connection.query("CREATE TABLE IF NOT EXISTS users(" +
        "id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY, " +
        "username VARCHAR(32) UNIQUE NOT NULL, " +
        "password VARCHAR(255) NOT NULL, " +
        "nickname VARCHAR(255) NOT NULL, " +
        "gender BOOLEAN NOT NULL, " +
        "old INTEGER UNSIGNED NOT NULL)", function (err) {
            if (err) {
                console.log(err);
                return;
            }
        });
    connection.query("CREATE TABLE IF NOT EXISTS shelf(" +
        "id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY, " +
        "userid INTEGER UNSIGNED NOT NULL, " +
        "bookid INTEGER UNSIGNED NOT NULL, " +
        "status VARCHAR(10) NOT NULL, " +
        "CONSTRAINT un_shelf UNIQUE (userid, bookid), " +
        "CONSTRAINT s_u_fk FOREIGN KEY (userid) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE, " +
        "CONSTRAINT s_b_fk FOREIGN KEY (bookid) REFERENCES books(id) ON UPDATE CASCADE ON DELETE CASCADE)", function (err) {
            if (err) {
                console.log(err);
                return;
            }
        });
    connection.query("CREATE TABLE IF NOT EXISTS comments(" +
        "id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY, " +
        "bookid INTEGER UNSIGNED NOT NULL, " +
        "userid INTEGER UNSIGNED NOT NULL, " +
        "time DATETIME NOT NULL, " +
        "star INTEGER UNSIGNED NOT NULL, " +
        "content VARCHAR(255) NOT NULL, " +
        "praise INTEGER UNSIGNED DEFAULT 0, " +
        "quality BOOLEAN DEFAULT false, " +
        "CONSTRAINT un_comments UNIQUE (bookid, userid), " +
        "CONSTRAINT c_b_fk FOREIGN KEY (bookid) REFERENCES books(id) ON UPDATE CASCADE ON DELETE CASCADE, " +
        "CONSTRAINT c_u_fk FOREIGN KEY (userid) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE)", function (err) {
            if (err) {
                console.log(err);
                return;
            }
        });
    connection.query("CREATE TABLE IF NOT EXISTS praise(" +
        "commentid INTEGER UNSIGNED NOT NULL, " +
        "userid INTEGER UNSIGNED NOT NULL, " +
        "CONSTRAINT pk_praise PRIMARY KEY (commentid, userid), " +
        "CONSTRAINT p_c_fk1 FOREIGN KEY (commentid) REFERENCES comments(id) ON UPDATE CASCADE ON DELETE CASCADE, " +
        "CONSTRAINT p_u_fk2 FOREIGN KEY (userid) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE)", function (err) {
            if (err) {
                console.log(err);
                return;
            }
        });
    connection.query("CREATE TABLE IF NOT EXISTS vs(" +
        "id INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY, " +
        "bookid INTEGER UNSIGNED NOT NULL, " +
        "fcommentid INTEGER UNSIGNED NOT NULL, " +
        "scommentid INTEGER UNSIGNED NOT NULL, " +
        "fscore INTEGER UNSIGNED DEFAULT 0, " +
        "sscore INTEGER UNSIGNED DEFAULT 0, " +
        "endtime DATETIME NOT NULL, " +
        "CONSTRAINT un_vs UNIQUE (bookid, fcommentid), " +
        "CONSTRAINT v_b_fk FOREIGN KEY (bookid) REFERENCES books(id) ON UPDATE CASCADE ON DELETE CASCADE, " +
        "CONSTRAINT v_c_fk1 FOREIGN KEY (fcommentid) REFERENCES comments(id) ON UPDATE CASCADE ON DELETE CASCADE, " +
        "CONSTRAINT v_c_fk2 FOREIGN KEY (scommentid) REFERENCES comments(id) ON UPDATE CASCADE ON DELETE CASCADE)", function (err) {
            if (err) {
                console.log(err);
                return;
            }
        });
    connection.query("CREATE TABLE IF NOT EXISTS encourage(" +
        "vsid INTEGER UNSIGNED NOT NULL, " +
        "userid INTEGER UNSIGNED NOT NULL, " +
        "CONSTRAINT pk_encourage PRIMARY KEY (vsid, userid), " +
        "CONSTRAINT e_v_fk FOREIGN KEY (vsid) REFERENCES vs(id) ON UPDATE CASCADE ON DELETE CASCADE, " +
        "CONSTRAINT e_u_fk FOREIGN KEY (userid) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE)", function (err) {
            if (err) {
                console.log(err);
                return;
            }
        });

    connection.query("SET GLOBAL event_scheduler = 1", function (err) {
        if (err) {
            console.log(err);
            return;
        }
    });
    // 创建打榜信息相关处理的定时事件
    connection.query("CREATE EVENT IF NOT EXISTS eventone " +
        "ON SCHEDULE EVERY 1 DAY STARTS '2020-02-25 03:00:00.001' " +
        "ON COMPLETION NOT PRESERVE ENABLE DO BEGIN " +
        "UPDATE comments c SET c.quality = false WHERE c.id IN (SELECT v.fcommentid FROM vs v WHERE v.endtime <= NOW() AND v.fscore < v.sscore); " +
        "UPDATE comments c SET c.quality = true WHERE c.id IN (SELECT v.scommentid FROM vs v WHERE v.endtime <= NOW() AND v.fscore < v.sscore); " +
        "DELETE FROM vs WHERE endtime <= NOW(); " +
        "END;", function (err) {
            if (err) {
                console.log(err);
                return;
            }
        });
    // 创建用户年龄记录增长的定时事件
    connection.query("CREATE EVENT IF NOT EXISTS eventtwo " +
        "ON SCHEDULE EVERY 1 YEAR STARTS '2020-01-01 00:00:00.001' " +
        "ON COMPLETION NOT PRESERVE ENABLE " +
        "DO UPDATE users SET old = old + 1;", function (err) {
            if (err) {
                console.log(err);
                return;
            }
        });
    connection.release();
});

/**
 * 添加新书籍信息进入书籍表
 * 
 * @param string title 书名
 * @param string author 书籍作者
 * @param string type 书籍分类
 * @param boolean status 书籍连载状态
 * @param integer words 书籍字数
 * @param string summarize 书籍概述
 * @param string latest 最新章节名
 * @param string icon 封面图链接
 * @param string titlelink 标题链接
 * @param string latestlink 最新章节链接
 *
 * @return var
 */
db.addbook = function (title, author, type, status, words, summarize, latest, icon, titlelink, latestlink, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        connection.query("INSERT INTO books(title, author, type, status, words, " +
            "summarize, latest, icon, titlelink, latestlink) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [title, author, type, status, words, summarize, latest, icon, titlelink, latestlink], function (err) {
                if (err) {
                    console.log(err);
                    connection.release();
                    callback(err);
                    return;
                }
                connection.release();
                callback(null);
            });
    });
}
/**
 * 更改书籍表书籍总星数
 *
 * @param integer id 书籍id
 * @param integer variance 总星数变化量
 *
 * @return var
 */
db.updatebstar = function (id, variance, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        connection.query("UPDATE books SET totalstar = totalstar + ? WHERE id = ?", [variance, id], function (err) {
            if (err) {
                console.log(err);
                connection.release();
                callback(err);
                return;
            }   
            connection.release();
            callback(null);
        });
    });
}
/**
 * 更改书籍表书籍总评分人数
 *
 * @param integer id 书籍id
 * @param integer variance 总评分人数变化量
 *
 * @return var
 */
db.updatebpeople = function (id, variance, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        connection.query("UPDATE books SET totalpeople = totalpeople + ? WHERE id = ?", [variance, id], function (err) {
            if (err) {
                console.log(err);
                connection.release();
                callback(err);
                return;
            }
            connection.release();
            callback(null);
        });
    });
}
/**
 * 根据书籍id获取书籍信息
 *
 * @param integer id 书籍id
 * @param integer userid 用户id
 *
 * @return array rows 书籍信息,不存在时返回Null
 */
db.getbook = function (id, userid, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        connection.query("SELECT b.*, (SELECT s.id FROM shelf s WHERE s.userid = ? AND s.bookid = b.id) AS shelfid, " +
            "(SELECT s.status FROM shelf s WHERE s.userid = ? AND s.bookid = b.id) AS shelfstatus FROM books b WHERE b.id = ? ",
            [userid, userid, id], function (err, rows) {
                if (err) {
                    console.log(err);
                    connection.release();
                    callback(err, null);
                    return;
                }
                if (rows.length == 0) {
                    connection.release();
                    callback(null, null);
                    return;
                }
                connection.release();   
                callback(null, rows);
            });
    });
}
/**
 * 根据筛选条件获取书籍列表
 * 
 * @param integer userid 用户id
 * @param string type 书籍分类
 * @param integer lwords 最低字数
 * @param integer hwords 最高字数
 * @param boolean status 书籍连载状态
 * @param string order 排序条件
 * 
 * @return array rows 书籍信息,不存在时返回Null
 */
db.selectbook = function (userid, type, lwords, hwords, status, order, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        connection.query("SELECT b.*, (SELECT s.id FROM shelf s WHERE s.userid = ? AND s.bookid = b.id) AS shelfid, " +
            "(SELECT s.status FROM shelf s WHERE s.userid = ? AND s.bookid = b.id) AS shelfstatus FROM books b " +
            "WHERE b.type = IFNULL(?, b.type) AND b.words >= IFNULL(?, b.words) AND b.words < IFNULL(?, b.words + 1) AND b.status = IFNULL(?, b.status) " +
            "ORDER BY " + order + " DESC, id DESC", [userid, userid, type, lwords, hwords, status], function (err, rows) {
                if (err) {
                    console.log(err); 
                    connection.release();
                    callback(err, null);
                    return;
                }
                if (rows.length == 0) {  
                    connection.release();
                    callback(null, null);
                    return;
                } 
                connection.release();  
                callback(null, rows);
            });
    });
}

/**
 * 添加新用户信息进入用户表
 * 
 * @param string username 用户名
 * @param string password 密码哈希值
 * @param string nickname 用户昵称
 * @param boolean gender 用户性别
 * @param integer old 用户年龄
 * 
 * @return var
 */
db.adduser = function (username, password, nickname, gender, old, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        connection.query("INSERT INTO users(username, password, nickname, gender, old) VALUES (?, ?, ?, ?, ?)",
            [username, password, nickname, gender, old], function (err, rows) {
                if (err) {
                    console.log(err);
                    connection.release();
                    callback(err, null);
                    return;
                }
                connection.release();
                callback(null, rows.insertId);
            });
    });
}
/**
 * 删除用户表用户信息
 * 
 * @param integer id 用户id
 * 
 * @return var
 */
db.deleteuser = function (id, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        connection.query("DELETE FROM users WHERE id = ?", [id], function (err) {
            if (err) {
                console.log(err);
                connection.release();
                callback(err);
                return;
            }
            connection.release(); 
            callback(null);
        });
    });
}
/**
 * 更改用户表用户信息
 * 
 * @param integer id 用户id
 * @param string nickname 用户昵称
 * @param boolean gender 用户性别
 * @param integer old 用户年龄
 * 
 * @return var
 */
db.updateuser = function (id, nickname, gender, old, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        connection.query("UPDATE users SET nickname = ?, gender = ?, old = ? WHERE id = ?",
            [nickname, gender, old, id], function (err) {
                if (err) {
                    console.log(err);
                    connection.release();
                    callback(err);
                    return;
                }  
                connection.release(); 
                callback(null);
            });
    });
}
/**
 * 根据用户名获取用户信息
 *
 * @param string username 用户名
 *
 * @return array rows 用户信息,不存在时返回Null
 */
db.getuserpass = function (username, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        connection.query("SELECT * FROM users WHERE username = ?", [username], function (err, rows) {
            if (err) {
                console.log(err);
                connection.release();
                callback(err, null);
                return;
            }
            if (rows.length == 0) {
                connection.release();
                callback(null, null);
                return;
            }  
            connection.release();  
            callback(null, rows);
        });
    });
}
/**
 * 根据用户id获取用户信息
 *
 * @param integer id 用户id
 *
 * @return array rows 用户信息,不存在时返回Null
 */
db.getuser = function (id, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        connection.query("SELECT * FROM users WHERE id = ?", [id], function (err, rows) {
            if (err) {
                console.log(err);
                connection.release();
                callback(err, null);
                return;
            }
            if (rows.length == 0) {
                connection.release();
                callback(null, null);
                return;
            }
            connection.release(); 
            callback(null, rows);
        });
    });
}

/**
 * 添加新藏书信息进入书架表
 * 
 * @param integer userid 用户id
 * @param integer bookid 书籍id
 * @param string status 书籍收藏状态
 * 
 * @return var
 */
db.addshelf = function (userid, bookid, status, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        connection.query("INSERT INTO shelf(userid, bookid, status) VALUES (?, ?, ?)",
            [userid, bookid, status], function (err) {
                if (err) {
                    console.log(err);
                    connection.release();
                    callback(err);
                    return;
                }  
                connection.release(); 
                callback(null);
            });
    });
}
/**
 * 删除书架表藏书信息
 * 
 * @param integer id 书架记录id
 * 
 * @return var
 */
db.deleteshelf = function (id, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        connection.query("DELETE FROM shelf WHERE id = ?", [id], function (err) {
            if (err) {
                console.log(err);
                connection.release();
                callback(err);
                return;
            }   
            connection.release();  
            callback(null);
        });
    });
}
/**
 * 更改书架表藏书信息
 * 
 * @param integer id 书架记录id
 * @param string status 藏书状态
 * 
 * @return var
 */
db.updateshelf = function (id, status, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        connection.query("UPDATE shelf SET status = ? WHERE id = ?", [status, id], function (err) {
            if (err) {
                console.log(err);
                connection.release();
                callback(err);
                return;
            }  
            connection.release();  
            callback(null);
        });
    });
}
/**
 * 根据用户id获取书架藏书信息
 *
 * @param integer userid 用户id
 * @param string status 藏书状态
 *
 * @return array rows 书架藏书信息,不存在时返回Null
 */
db.getshelf = function (userid, status, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        connection.query("SELECT (SELECT s.id FROM shelf s WHERE s.userid = ? AND s.bookid = b.id) AS id, b.id AS bookid, b.title, " +
            "b.author, b.type, b.status, b.words, (SELECT c.star FROM comments c WHERE c.userid = ? AND c.bookid = b.id) AS star, b.icon, " +
            "b.titlelink FROM books b WHERE b.id in (SELECT s.bookid FROM shelf s WHERE s.userid = ? AND s.status = ?) ORDER BY id DESC",
            [userid, userid, userid, status], function (err, rows) {
                if (err) {
                    console.log(err);
                    connection.release();
                    callback(err, null);
                    return;
                }
                if (rows.length == 0) { 
                    connection.release();
                    callback(null, null);
                    return;
                }   
                connection.release();   
                callback(null, rows);
            });
    });
}

/**
 * 添加新书评信息进入书评表
 * 
 * @param integer bookid 书籍id
 * @param integer userid 用户id
 * @param integer star 用户书评评分
 * @param string content 书评内容
 * 
 * @return var
 */
db.addcomment = function (bookid, userid, star, content, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        connection.query("INSERT INTO comments(bookid, userid, time, star, content) VALUES (?, ?, NOW(), ?, ?)",
            [bookid, userid, star, content], function (err) {
                if (err) {
                    console.log(err);
                    connection.release();
                    callback(err);
                    return;
                }  
                connection.release();   
                callback(null);
            });
    });
}
/**
 * 删除书评表书评信息
 * 
 * @param integer id 书评id
 * 
 * @return var
 */
db.deletecomment = function (id, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        connection.query("DELETE FROM comments WHERE id = ?", [id], function (err) {
            if (err) {
                console.log(err);
                connection.release();
                callback(err);
                return;
            }  
            connection.release();  
            callback(null);
        });
    });
}
/**
 * 更改书评表书评信息
 * 
 * @param integer id 书评id
 * @param integer variance 书评星数变化量
 * @param string content 书评内容
 * 
 * @return var
 */
db.updatecomment = function (id, variance, content, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        connection.query("UPDATE comments SET time = NOW(), star = star + ?, content = ? WHERE id = ?",
            [variance, content, id], function (err) {
                if (err) {
                    console.log(err);
                    connection.release();
                    callback(err);
                    return;
                } 
                connection.release();   
                callback(null);
            });
    });
}
/**
 * 更改书评表点赞数信息
 * 
 * @param integer id 书评id
 * @param integer variance 书评点赞数变化量
 * 
 * @return var
 */
db.updatecpraise = function (id, variance, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        connection.query("UPDATE comments SET praise = praise + ? WHERE id = ?", [variance, id], function (err) {
            if (err) {
                console.log(err);
                connection.release();
                callback(err);
                return;
            }
            connection.release();   
            callback(null);
        });
    });
}
/**
 * 更改书评表书评精品状态
 *
 * @param integer id 书评id
 * @param boolean status 精品状态
 *
 * @return var
 */
db.updatecquality = function (id, status, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        connection.query("UPDATE comments SET quality = ? WHERE id = ?", [status, id], function (err) {
            if (err) {
                console.log(err);
                connection.release();
                callback(err);
                return;
            }  
            connection.release();  
            callback(null);
        });
    });
}
/**
 * 获取书评表点赞数信息
 * 
 * @param integer id 书评id
 * 
 * @return integet 书评点赞数
 */
db.getcpraise = function (id, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        connection.query("SELECT * FROM comments WHERE id = ?", [id], function (err, rows) {
            if (err) {
                console.log(err);
                connection.release();
                callback(err, null);
                return;
            }
            if (rows.length == 0) {
                connection.release();
                callback(null, null);
                return;
            } 
            connection.release();   
            callback(null, rows[0].praise);
        });
    });
}
/**
 * 根据用户id获取用户个人的书评信息
 *
 * @param integer userid 用户id
 *
 * @return array rows 用户书评信息,不存在时返回Null
 */
db.getucomment = function (userid, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        connection.query("SELECT c.*, (SELECT b.title FROM books b WHERE b.id = c.bookid) AS title, " +
            "(IF((SELECT COUNT(*) FROM praise p WHERE p.commentid = c.id AND p.userid = c.userid) > 0, 1, 0)) AS praisestatus " +
            "FROM comments c WHERE c.userid = ? ORDER BY time DESC, id DESC",
            [userid], function (err, rows) {
                if (err) {
                    console.log(err);
                    connection.release();
                    callback(err, null);
                    return;
                }
                if (rows.length == 0) {
                    connection.release();
                    callback(null, null);
                    return;
                }
                connection.release();   
                callback(null, rows);
            });
    });
}
/**
 * 获取普通书评信息
 *
 * @param integer userid 用户id
 * @param integer bookid 书籍id
 *
 * @return array rows 普通书评信息,不存在时返回Null
 */
db.getbcomment = function (userid, bookid, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        connection.query("SELECT c.*, (SELECT u.nickname FROM users u WHERE u.id = c.userid) AS nickname, " +
            "(IF((SELECT COUNT(*) FROM praise p WHERE p.commentid = c.id AND p.userid = ?) > 0, 1, 0)) AS praisestatus " +
            "FROM comments c WHERE c.bookid = ? AND c.quality = false ORDER BY time DESC, id DESC",
            [userid, bookid], function (err, rows) {
                if (err) {
                    console.log(err);
                    connection.release();
                    callback(err, null);
                    return;
                }
                if (rows.length == 0) {
                    connection.release();
                    callback(null, null);
                    return;
                } 
                connection.release();   
                callback(null, rows);
            });
    });
}
/**
 * 获取精品书评信息
 *
 * @param integer userid 用户id
 * @param integer bookid 书籍id
 *
 * @return array rows 普通书评信息,不存在时返回Null
 */
db.getbqcomment = function (userid, bookid, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        connection.query("SELECT c.*, (SELECT u.nickname FROM users u WHERE u.id = c.userid) AS nickname, " +
            "(IF((SELECT COUNT(*) FROM praise p WHERE p.commentid = c.id AND p.userid = ?) > 0, 1, 0)) AS praisestatus " +
            "FROM comments c WHERE c.bookid = ? AND c.quality = true ORDER BY time DESC, id DESC",
            [userid, bookid], function (err, rows) {
                if (err) {
                    console.log(err);
                    connection.release();
                    callback(err, null);
                    return;
                }
                if (rows.length == 0) {
                    connection.release();
                    callback(null, null);
                    return;
                }   
                connection.release();   
                callback(null, rows);
            });
    });
}
/**
 * 获取某用户本人的书评信息
 *
 * @param integer userid 用户id
 * @param integer bookid 书籍id
 *
 * @return array rows 书籍书评信息,不存在时返回Null
 */
db.getubcomment = function (userid, bookid, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        connection.query("SELECT c.*, (SELECT u.nickname FROM users u WHERE u.id = c.userid) AS nickname, " +
            "(IF((SELECT COUNT(*) FROM praise p WHERE p.commentid = c.id AND p.userid = c.userid) > 0, 1, 0)) AS praisestatus " +
            "FROM comments c WHERE c.userid = ? AND c.bookid = ? ORDER BY time DESC, id DESC",
            [userid, bookid], function (err, rows) {
                if (err) {
                    console.log(err);
                    connection.release();
                    callback(err, null);
                    return;
                }
                if (rows.length == 0) {
                    connection.release();
                    callback(null, null);
                    return;
                } 
                connection.release();  
                callback(null, rows);
            });
    });
}
/**
 * 获取书评信息
 *
 * @param integer userid 用户id
 * 
 * @return array rows 首页书评信息,不存在时返回Null
 */
db.selectcomment = function (userid, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        connection.query("SELECT c.*, (SELECT u.nickname FROM users u WHERE u.id = c.userid) AS nickname, " +
            "(SELECT b.title FROM books b WHERE b.id = c.bookid) AS title, " +
            "(IF((SELECT COUNT(*) FROM praise p WHERE p.commentid = c.id AND p.userid = ?) > 0, 1, 0)) AS praisestatus " +
            "FROM comments c ORDER BY time DESC, id DESC LIMIT 500", [userid], function (err, rows) {
                if (err) {
                    console.log(err);
                    connection.release();
                    callback(err, null);
                    return;
                }
                if (rows.length == 0) {
                    connection.release();
                    callback(null, null);
                    return;
                } 
                connection.release();  
                callback(null, rows);
            });
    });
}

/**
 * 添加新点赞信息进入点赞表
 * 
 * @param integer commentid 书评id
 * @param integer userid 用户id
 *
 * @return var
 */
db.addpraise = function (commentid, userid, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        connection.query("INSERT INTO praise(commentid, userid) VALUES(?, ?)", [commentid, userid],
            function (err) {
                if (err) {
                    console.log(err);
                    connection.release();
                    callback(err);
                    return;
                } 
                connection.release();  
                callback(null);
            });
    });
}
/**
 * 删除点赞表点赞信息
 * 
 * @param integer commentid 书评id
 * @param integer userid 用户id
 *
 * @return var
 */
db.deletepraise = function (commentid, userid, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        connection.query("DELETE FROM praise WHERE commentid = ? AND userid = ?", [commentid, userid],
            function (err) {
                if (err) {
                    console.log(err);
                    connection.release();
                    callback(err);
                    return;
                } 
                connection.release();   
                callback(null);
            });
    });
}

/**
 * 添加新打榜信息进入打榜表
 * 
 * @param integer bookid 书籍id
 * @param integer fcommentid 被挑战书评id
 * @param integer scommentid 挑战书评id
 *
 * @return var
 */
db.addvs = function (bookid, fcommentid, scommentid, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        connection.query("INSERT INTO vs(bookid, fcommentid, scommentid, endtime) VALUES(?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
            [bookid, fcommentid, scommentid],
            function (err) {
                if (err) {
                    console.log(err);
                    connection.release();
                    callback(err);
                    return;
                } 
                connection.release();  
                callback(null);
            });
    });
}
/**
 * 更改打榜表得分信息
 * 
 * @param integer id 打榜id
 * @param string scorekeeper 得分者
 * 
 * @return var
 */
db.updatevs = function (id, scorekeeper, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        connection.query("UPDATE vs SET " + scorekeeper + " = " + scorekeeper + " + 1 WHERE id = ?",
            [id], function (err) {
                if (err) {
                    console.log(err);
                    connection.release();
                    callback(err);
                    return;
                }   
                connection.release();    
                callback(null);
            });
    });
}
/**
 * 根据书籍id获取打榜信息
 * 
 * @param integer userid 用户id
 * @param integer bookid 书籍id
 *
 * @return array rows 打榜信息,不存在时返回Null
 */
db.getvs = function (userid, bookid, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        connection.query("SELECT v.*, (SELECT u.nickname FROM users u WHERE u.id IN (SELECT c.userid FROM comments c WHERE c.id = v.fcommentid)) AS fname, " +
            "(SELECT u.nickname FROM users u WHERE u.id IN (SELECT c.userid FROM comments c WHERE c.id = v.scommentid)) AS sname, " +
            "(SELECT c.content FROM comments c WHERE c.id = v.fcommentid) AS fcontent, " +
            "(SELECT c.content FROM comments c WHERE c.id = v.scommentid) AS scontent, " +
            "IF((SELECT COUNT(*) FROM encourage e WHERE e.vsid = v.id AND e.userid = ?) > 0, 1, 0) AS votestatus " +
            "FROM vs v WHERE bookid = ? AND endtime > NOW() ORDER BY endtime DESC, id DESC",
            [userid, bookid], function (err, rows) {
            if (err) {
                console.log(err);
                connection.release();
                callback(err, null);
                return;
            }
            if (rows.length == 0) {
                connection.release();
                callback(null, null);
                return;
            } 
            connection.release(); 
            callback(null, rows);
        });
    });
}

/**
 * 添加新投票信息进入投票表
 * 
 * @param integer vsid 打榜id
 * @param integer userid 用户id
 * 
 * @return var
 */
db.addencourage = function (vsid, userid, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        connection.query("INSERT INTO encourage(vsid, userid) VALUES (?, ?)", [vsid, userid], function (err) {
            if (err) {
                console.log(err);
                connection.release();
                callback(err);
                return;
            }  
            connection.release();  
            callback(null);
        });
    });
}
/**
 * 判断用户是否对该打榜进行过投票
 * 
 * @param integer vsid 用户id
 * @param integer userid 用户id
 * 
 * @return var
 */
db.judgeencourage = function (vsid, userid, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err, null);
            return;
        }
        connection.query("SELECT * FROM encourage WHERE vsid = ? AND userid = ?", [vsid, userid], function (err, rows) {
            if (err) {
                console.log(err);
                connection.release();
                callback(err, null);
                return;
            }
            if (rows.length == 0) {
                connection.release();
                callback(null, false);
                return;
            }  
            connection.release();  
            callback(null, true);
        });
    });
}

module.exports = db;