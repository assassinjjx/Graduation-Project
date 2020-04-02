import qs from 'qs';
import axios from 'axios';

export const httprequest = function (method, url, data = {}) {
    const config = {
        method: method,
        url: url,
        timeout: 5000,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            'Authorization': window.localStorage.getItem('token')
        }
    }
    if (method == 'GET') {
        config.params = data;
    } else {
        config.data = qs.stringify(data);
    }
    return axios(config);
}