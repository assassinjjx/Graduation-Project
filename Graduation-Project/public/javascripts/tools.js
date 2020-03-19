/**
 * @version: V1.0
 * @author: jjx
 * @description: 主要负责收录部分工具模块
 * @data: 2020-03-05 21:00
 **/

var tools = {};

// 状态码列表
tools.STATUS_CODE = new Map()
    .set(200, 'OK')
    .set(201, 'Created')
    .set(400, 'Bad Request')
    .set(401, 'Unauthorized')
    .set(403, 'Forbidden')
    .set(404, 'Not Found')
    .set(429, 'Too Many Requests')
    .set(500, 'Internal Server Error')
    .set(502, 'Bad Gateway')
    .set(504, 'Gateway Timeout')
    .set(1001, 'Username Length Too Short(<4)')
    .set(1002, 'Password Length Too Short(<8)')
    .set(1003, 'Username Length Too Long(>=20)')
    .set(1004, 'Password Length Too Long(>=20)')
    .set(1005, 'Invaild Username')
    .set(1006, 'Invaild Password')
    .set(1010, 'Invaild Token')
    .set(1011, 'Token Already Expired');

/**
 * 为数据库结果集附加状态码并打包为Json对象
 *
 * @param integer code Http状态码
 * @param array rows 需要返回的数据
 * 
 * @return jsonobj 附加了状态码的Json对象
 */
tools.returnjson = function (code, rows) {
    let obj = new Object();
    obj.status = code;
    obj.msg = tools.STATUS_CODE.get(code);
    if (!rows) return JSON.stringify(obj);
    obj.data = [];
    for (let i = 0; i < rows.length; i++) {
        obj.data.push(rows[i]);
    }
    let jsonobj = JSON.stringify(obj);
    return jsonobj;
}

/**
 * 为单个对象附加状态码并打包为Json对象
 *
 * @param integer code Http状态码
 * @param string name 需要返回对象的属性名
 * @param object extra 需要返回的对象
 * 
 * @return jsonobj 附加了状态码的Json对象
 */
tools.returnsjson = function (code, name, extra) {
    let obj = new Object();
    obj.status = code;
    obj.msg = tools.STATUS_CODE.get(code);
    obj.data = new Object();
    obj.data[name] = extra; 
    let jsonobj = JSON.stringify(obj);
    return jsonobj;
}

module.exports = tools;