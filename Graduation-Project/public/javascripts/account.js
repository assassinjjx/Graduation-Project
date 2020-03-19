/**
 * @version: V1.0
 * @author: jjx
 * @description: 主要负责与用户相关部分的数据库进行交互并进行逻辑判断，以进行用户登录验证。
 * @data: 2020-03-03 20:00
 **/

var md5 = require('md5');
var jwt = require('jsonwebtoken');
var info = require('./settings');
var db = require('./database');
var account = {};

/**
 * 根据用户名生成Token
 * 
 * @param string username 用户名(须事先验证是否存在)
 * @param string password 密码的Hash值
 * 
 * @return string 生成的Token
 */
account.generatetoken = function (id, username, password) {
    let payload = {
        jti: id,
        urn: username,
        iss: info.HOST_NAME,
        aud: info.HOST_NAME,
        iat: Math.floor(Date.now() / 1000),
        nbf: Math.floor(Date.now() / 1000) + 1,
        exp: Math.floor(Date.now() / 1000) + info.EXPIRE_TIME
    };
    let mytoken = jwt.sign(payload, info.PRIVATE_KEY + account.getcaptcha(password));
    return mytoken;
}

/**
 * 验证已存在的用户名与密码是否匹配
 * 
 * @param string username 用户名(须事先验证是否存在)
 * @param string password 用户密码(明文)
 * 
 * @return string 成功时返回Token，失败返回null
 */
account.verifypassword = function (username, password, callback) {
    db.getuserpass(username, function (err, rows) {
        if (err) {
            callback(err, null);
            return;
        }
        if (!rows || rows[0].password != account.passwordhash(password)) {
            callback(null, null);
            return;
        }
        let token = account.generatetoken(rows[0].id, username, rows[0].password);
        callback(null, token);
    });
} 

/**
 * 检验Token是否合法
 * 
 * @param string mytoken Token
 * 
 * @return string 成功时返回用户名，失败时返回null
 */
account.verifytoken = function (mytoken, callback) {
    let payload = mytoken.split('.')[1];
    let id = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8')).jti;
    db.getuser(id, function (err, rows) {
        if (err) {
            callback(err, null);
            return;
        }
        if (!rows) {
            callback(null, null);
            return;
        }
        jwt.verify(mytoken, info.PRIVATE_KEY + account.getcaptcha(rows[0].password), function (err) {
            if (err) {
                callback(err, id);
                return;
            }
            callback(null, id);
        });
    });
}

/**
 * 检查用户名是否存在
 * 
 * @param string username 用户名
 * 
 * @return boolean 该用户名已存在返回true,不存在返回false
 */
account.isuserexists = function (username, callback) {
    db.getuserpass(username, function (err, rows) {
        if (err) {
            callback(err, null);
            return;
        }
        if (!rows) {
            callback(null, false);
            return;
        }
        callback(null, true);
    });
}

/**
 * 执行注册操作
 * 
 * @param string username 用户名
 * @param string password 密码
 * @param string nickname 用户昵称
 * @param boolean gender 用户性别
 * @param integer old 用户年龄
 * 
 * @return string 生成的Token
 */
account.regist = function (username, password, nickname, gender, old, callback) {
    let hpassword = account.passwordhash(password);
    db.adduser(username, hpassword, nickname, gender, old, function (err, id) {
        if (err) {
            callback(err, null);
            return;
        }
        let mytoken = account.generatetoken(id, username, hpassword);
        callback(null, mytoken);
    });
}

/**
 * 密码散列函数，对输入的密码进行Hash运算
 * 
 * @param string password 密码
 * 
 * @return string 该密码的Hash结果
 */
account.passwordhash = function (password) {
    return md5(md5(password) + info.PASSWORD_SALT);
}

/**
 * 获取用户对应的特殊信息，以生成Token
 * 
 * @param string password 用户的密码Hash值
 * 
 * @return string 验证字符串
 */
account.getcaptcha = function (password) {
    return password.substring(password - 8, password.length);
}

/**
 * 检查用户名格式合法性
 * 
 * @param string username 用户名
 * 
 * @return boolean 是否报错
 */
account.checkusername = function (username) {
    let str = username.toLowerCase();

    // 检查注册用户名长度
    if (str.length < 4) return 1001;
    if (str.length >= 20) return 1003;

    // 检查注册用户名内容格式
    let regexp = /^[a-z]\w{3,19}$/is;
    let check = regexp.exec(str);
    if (!check) return 1005;

    return false;
}

/**
 * 检查密码格式合法性
 * 
 * @param string password 用户密码
 * 
 * @return boolean 是否报错
 */
account.checkpassword = function (password) {
    let str = password.toLowerCase();

    // 检查注册密码长度
    if (str.length < 8) return 1002;
    if (str.length >= 20) return 1004;

    // 检查注册密码内容格式
    let regexp = /^\w{8,20}$/is;
    let check = regexp.exec(str);
    if (!check) return 1005;

    return false;
}

module.exports = account;