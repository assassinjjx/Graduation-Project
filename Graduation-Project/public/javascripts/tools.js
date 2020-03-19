/**
 * @version: V1.0
 * @author: jjx
 * @description: ��Ҫ������¼���ֹ���ģ��
 * @data: 2020-03-05 21:00
 **/

var tools = {};

// ״̬���б�
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
 * Ϊ���ݿ���������״̬�벢���ΪJson����
 *
 * @param integer code Http״̬��
 * @param array rows ��Ҫ���ص�����
 * 
 * @return jsonobj ������״̬���Json����
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
 * Ϊ�������󸽼�״̬�벢���ΪJson����
 *
 * @param integer code Http״̬��
 * @param string name ��Ҫ���ض����������
 * @param object extra ��Ҫ���صĶ���
 * 
 * @return jsonobj ������״̬���Json����
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