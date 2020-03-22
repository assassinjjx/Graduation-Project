/**
 * @version: V1.2
 * @author: jjx
 * @description: ���ݿ������,���𹹽�SQL��䣬�����ݿ���н����������ɽӿ��ṩ����һ�㡣
 * @data: 2020-02-24 10:00
 **/

var mysql = require('mysql2');
var info = require('./settings');
var db = {};

/**
 * �������ݿ����ӳ�
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
 * �����ݿ�������ʱ����ʼ���������ݿ��ṹ�����ݿ��¼�
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
    // ���������Ϣ��ش���Ķ�ʱ�¼�
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
    // �����û������¼�����Ķ�ʱ�¼�
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
 * ������鼮��Ϣ�����鼮��
 * 
 * @param string title ����
 * @param string author �鼮����
 * @param string type �鼮����
 * @param boolean status �鼮����״̬
 * @param integer words �鼮����
 * @param string summarize �鼮����
 * @param string latest �����½���
 * @param string icon ����ͼ����
 * @param string titlelink ��������
 * @param string latestlink �����½�����
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
 * �����鼮���鼮������
 *
 * @param integer id �鼮id
 * @param integer variance �������仯��
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
 * �����鼮���鼮����������
 *
 * @param integer id �鼮id
 * @param integer variance �����������仯��
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
 * �����鼮id��ȡ�鼮��Ϣ
 *
 * @param integer id �鼮id
 * @param integer userid �û�id
 *
 * @return array rows �鼮��Ϣ,������ʱ����Null
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
 * ����ɸѡ������ȡ�鼮�б�
 * 
 * @param integer userid �û�id
 * @param string type �鼮����
 * @param integer lwords �������
 * @param integer hwords �������
 * @param boolean status �鼮����״̬
 * @param string order ��������
 * 
 * @return array rows �鼮��Ϣ,������ʱ����Null
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
 * ������û���Ϣ�����û���
 * 
 * @param string username �û���
 * @param string password �����ϣֵ
 * @param string nickname �û��ǳ�
 * @param boolean gender �û��Ա�
 * @param integer old �û�����
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
 * ɾ���û����û���Ϣ
 * 
 * @param integer id �û�id
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
 * �����û����û���Ϣ
 * 
 * @param integer id �û�id
 * @param string nickname �û��ǳ�
 * @param boolean gender �û��Ա�
 * @param integer old �û�����
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
 * �����û�����ȡ�û���Ϣ
 *
 * @param string username �û���
 *
 * @return array rows �û���Ϣ,������ʱ����Null
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
 * �����û�id��ȡ�û���Ϣ
 *
 * @param integer id �û�id
 *
 * @return array rows �û���Ϣ,������ʱ����Null
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
 * ����²�����Ϣ������ܱ�
 * 
 * @param integer userid �û�id
 * @param integer bookid �鼮id
 * @param string status �鼮�ղ�״̬
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
 * ɾ����ܱ������Ϣ
 * 
 * @param integer id ��ܼ�¼id
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
 * ������ܱ������Ϣ
 * 
 * @param integer id ��ܼ�¼id
 * @param string status ����״̬
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
 * �����û�id��ȡ��ܲ�����Ϣ
 *
 * @param integer userid �û�id
 * @param string status ����״̬
 *
 * @return array rows ��ܲ�����Ϣ,������ʱ����Null
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
 * �����������Ϣ����������
 * 
 * @param integer bookid �鼮id
 * @param integer userid �û�id
 * @param integer star �û���������
 * @param string content ��������
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
 * ɾ��������������Ϣ
 * 
 * @param integer id ����id
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
 * ����������������Ϣ
 * 
 * @param integer id ����id
 * @param integer variance ���������仯��
 * @param string content ��������
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
 * �����������������Ϣ
 * 
 * @param integer id ����id
 * @param integer variance �����������仯��
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
 * ����������������Ʒ״̬
 *
 * @param integer id ����id
 * @param boolean status ��Ʒ״̬
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
 * ��ȡ�������������Ϣ
 * 
 * @param integer id ����id
 * 
 * @return integet ����������
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
 * �����û�id��ȡ�û����˵�������Ϣ
 *
 * @param integer userid �û�id
 *
 * @return array rows �û�������Ϣ,������ʱ����Null
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
 * ��ȡ��ͨ������Ϣ
 *
 * @param integer userid �û�id
 * @param integer bookid �鼮id
 *
 * @return array rows ��ͨ������Ϣ,������ʱ����Null
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
 * ��ȡ��Ʒ������Ϣ
 *
 * @param integer userid �û�id
 * @param integer bookid �鼮id
 *
 * @return array rows ��ͨ������Ϣ,������ʱ����Null
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
 * ��ȡĳ�û����˵�������Ϣ
 *
 * @param integer userid �û�id
 * @param integer bookid �鼮id
 *
 * @return array rows �鼮������Ϣ,������ʱ����Null
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
 * ��ȡ������Ϣ
 *
 * @param integer userid �û�id
 * 
 * @return array rows ��ҳ������Ϣ,������ʱ����Null
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
 * ����µ�����Ϣ������ޱ�
 * 
 * @param integer commentid ����id
 * @param integer userid �û�id
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
 * ɾ�����ޱ������Ϣ
 * 
 * @param integer commentid ����id
 * @param integer userid �û�id
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
 * ����´����Ϣ�������
 * 
 * @param integer bookid �鼮id
 * @param integer fcommentid ����ս����id
 * @param integer scommentid ��ս����id
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
 * ���Ĵ���÷���Ϣ
 * 
 * @param integer id ���id
 * @param string scorekeeper �÷���
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
 * �����鼮id��ȡ�����Ϣ
 * 
 * @param integer userid �û�id
 * @param integer bookid �鼮id
 *
 * @return array rows �����Ϣ,������ʱ����Null
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
 * �����ͶƱ��Ϣ����ͶƱ��
 * 
 * @param integer vsid ���id
 * @param integer userid �û�id
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
 * �ж��û��Ƿ�Ըô����й�ͶƱ
 * 
 * @param integer vsid �û�id
 * @param integer userid �û�id
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