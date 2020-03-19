/**
 * @version: V1.0
 * @author: jjx
 * @description: ��Ҫ�������û���ز��ֵ����ݿ���н����������߼��жϣ��Խ����û���¼��֤��
 * @data: 2020-03-03 20:00
 **/

var md5 = require('md5');
var jwt = require('jsonwebtoken');
var info = require('./settings');
var db = require('./database');
var account = {};

/**
 * �����û�������Token
 * 
 * @param string username �û���(��������֤�Ƿ����)
 * @param string password �����Hashֵ
 * 
 * @return string ���ɵ�Token
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
 * ��֤�Ѵ��ڵ��û����������Ƿ�ƥ��
 * 
 * @param string username �û���(��������֤�Ƿ����)
 * @param string password �û�����(����)
 * 
 * @return string �ɹ�ʱ����Token��ʧ�ܷ���null
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
 * ����Token�Ƿ�Ϸ�
 * 
 * @param string mytoken Token
 * 
 * @return string �ɹ�ʱ�����û�����ʧ��ʱ����null
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
 * ����û����Ƿ����
 * 
 * @param string username �û���
 * 
 * @return boolean ���û����Ѵ��ڷ���true,�����ڷ���false
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
 * ִ��ע�����
 * 
 * @param string username �û���
 * @param string password ����
 * @param string nickname �û��ǳ�
 * @param boolean gender �û��Ա�
 * @param integer old �û�����
 * 
 * @return string ���ɵ�Token
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
 * ����ɢ�к�������������������Hash����
 * 
 * @param string password ����
 * 
 * @return string �������Hash���
 */
account.passwordhash = function (password) {
    return md5(md5(password) + info.PASSWORD_SALT);
}

/**
 * ��ȡ�û���Ӧ��������Ϣ��������Token
 * 
 * @param string password �û�������Hashֵ
 * 
 * @return string ��֤�ַ���
 */
account.getcaptcha = function (password) {
    return password.substring(password - 8, password.length);
}

/**
 * ����û�����ʽ�Ϸ���
 * 
 * @param string username �û���
 * 
 * @return boolean �Ƿ񱨴�
 */
account.checkusername = function (username) {
    let str = username.toLowerCase();

    // ���ע���û�������
    if (str.length < 4) return 1001;
    if (str.length >= 20) return 1003;

    // ���ע���û������ݸ�ʽ
    let regexp = /^[a-z]\w{3,19}$/is;
    let check = regexp.exec(str);
    if (!check) return 1005;

    return false;
}

/**
 * ��������ʽ�Ϸ���
 * 
 * @param string password �û�����
 * 
 * @return boolean �Ƿ񱨴�
 */
account.checkpassword = function (password) {
    let str = password.toLowerCase();

    // ���ע�����볤��
    if (str.length < 8) return 1002;
    if (str.length >= 20) return 1004;

    // ���ע���������ݸ�ʽ
    let regexp = /^\w{8,20}$/is;
    let check = regexp.exec(str);
    if (!check) return 1005;

    return false;
}

module.exports = account;