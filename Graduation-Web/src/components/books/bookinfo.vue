<template>
    <a-layout id="layout">
        <div id="info">
            <img :src="this.icon" id="cover" />
            <div id="wordinfo">
                <h1>{{this.title}}</h1>
                <p>
                    作者：{{this.author}}&nbsp;&nbsp;&nbsp;
                    字数：{{this.words}} &nbsp;&nbsp;&nbsp;
                    {{this.status}}
                </p>
                <p>最新章节：<a :href="this.titlelink">{{this.latest}}</a></p>
                <p>
                    <a-button id="readbutton" type="primary" @click="read">
                        开始阅读
                    </a-button>
                    <a-dropdown>
                        <a-button>
                            {{this.shelfstatus}}
                        </a-button>
                        <a-menu slot="overlay">
                            <a-menu-item @click="menuclick(0)">{{this.show[0]}}</a-menu-item>
                            <a-menu-item @click="menuclick(1)">{{this.show[1]}}</a-menu-item>
                            <a-menu-item @click="menuclick(2)">{{this.show[2]}}</a-menu-item>
                            <a-menu-item @click="menuclick(3)">{{this.show[3]}}</a-menu-item>
                        </a-menu>
                    </a-dropdown>
                </p>
                <a-tag>{{this.type}}</a-tag>
            </div>
            <div id="mark">
                <h id="score">{{this.totalstar / this.totalpeople}}</h>
                <p>{{this.totalpeople / 1}}个评分</p>
            </div>
        </div>
        <div>
            <div id="commentblock">
                <a-tabs type="card" @change="onChange">
                    <a-tab-pane tab="书评" key="1">
                        <a-list itemLayout="vertical" size="small" :pagination="pagination" :dataSource="commentdata">
                            <a-list-item slot="renderItem" slot-scope="item, index" key="index">
                                <a-comment>
                                    <p>
                                        <b>{{item.nickname}}</b>
                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                        <a-rate v-model="item.star" size="small" disabled />
                                    </p>
                                    <p>{{item.content}}</p>
                                    <p>
                                        {{item.time}}
                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                        <a-icon type="like" :theme="item.praisestatus ? 'filled' : 'outlined'" @click="onClick(item)" />
                                        <span>{{item.praise}}</span>
                                    </p>
                                </a-comment>
                            </a-list-item>
                        </a-list>
                    </a-tab-pane>
                    <a-tab-pane tab="精品书评" key="2">
                        <a-list itemLayout="vertical" size="small" :pagination="pagination" :dataSource="commentdata">
                            <a-list-item slot="renderItem" slot-scope="item, index" key="index">
                                <a-comment>
                                    <p>
                                        <b>{{item.nickname}}</b>
                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                        <a-rate v-model="item.star" size="small" disabled />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        <a-icon type="audit" :style="{fontSize: '30px'}" />
                                    </p>
                                    <p>{{item.content}}</p>
                                    <p>
                                        {{item.time}}
                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                        <a-icon type="like" :theme="item.praisestatus ? 'filled' : 'outlined'" @click="onClick(item)" />
                                        <span>{{item.praise}}</span>
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        <span>挑战</span>
                                    </p>
                                </a-comment>
                            </a-list-item>
                        </a-list>
                    </a-tab-pane>
                    <a-tab-pane tab="书评打榜" key="3">

                    </a-tab-pane>
                </a-tabs>
            </div>
            <div id="mycomment">
                <h2 class="title">管理我的评论</h2>
                <a-list itemLayout="vertical" size="small" :dataSource="mydata">
                    <a-list-item slot="renderItem" slot-scope="item, index" key="index">
                        <a-comment>
                            <p>
                                <b>{{item.nickname}}</b>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <a-rate v-model="item.star" size="small" disabled />
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span :style="{visibility: item.quality ? 'visible' : 'hidden'}">
                                    <a-icon type="audit" :style="{fontSize: '30px'}" />
                                </span>
                            </p>
                            <p>{{item.content}}</p>
                            <p>
                                {{item.time}}
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <a-icon type="like" :theme="item.praisestatus ? 'filled' : 'outlined'" @click="onClick(item)" />
                                <span>{{item.praise}}</span>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <a-button @click="deletecomment(item.id, item.star)">删除</a-button>
                            </p>
                        </a-comment>
                    </a-list-item>
                </a-list>
                <h2 class="title">发表或修改评论</h2>
                <a-rate class="title" :value="mycommentstar" size="small" @change="changestar" />
                <a-form-item class="title">
                    <a-textarea :rows="4" @change="handleChange" :value="mycommentcontent"></a-textarea>
                    <a-button type="primary" @click="submit">
                        提交
                    </a-button>
                </a-form-item>
            </div>
        </div>
    </a-layout>
</template>

<script>
    import moment from 'moment';
    import qs from 'qs';

    const shelfstatuses = ["正在追读", "养肥待看", "已经看过", "不看屏蔽", "取消收藏"];
    const show = [];
    const commentdata = [];
    const mydata = [];

    export default {
        created() {
            this.getbookinfo();
            this.getmycomment()
            this.getbookcomment('/comments');
        },
        data() {
            return {
                id: 0,
                shelfid: 0,
                icon: "",
                title: "",
                author: "",
                type: "",
                status: "",
                words: 0,
                summarize: "",
                latest: "",
                totalstar: 0,
                totalpeople: 0,
                titlelink: "",
                latestlink: "",
                shelfstatus: "",
                mycommentid: 0,
                mycommentstar: 0,
                mycommentcontent: "",
                variance: 0,
                show,
                commentdata,
                mydata,
                moment,
                pagination: {
                    pageSize: 2
                },
            }
        },
        methods: {
            read() {
                window.location.href = this.titlelink;
            },
            changestar(num) {
                this.variance += num - this.mycommentstar;
                this.mycommentstar = num;
            },
            handleChange(e) {
                this.mycommentcontent = e.target.value;
            },
            onChange(key) {
                let commentstatus = "";
                if (key == "1") {
                    commentstatus = '/comments';
                } else {
                    commentstatus = '/qcomments';
                }
                this.getbookcomment(commentstatus);
            },
            submit() {
                let _this = this;
                const querydata = {
                    'star': this.mycommentstar,
                    'content': this.mycommentcontent,
                    'variance': this.variance,
                    'commentid': this.mycommentid
                };
                this.axios({
                    method: this.mycommentid ? 'POST' : 'PUT',
                    url: this.$store.state.host + this.$route.path + '/mycomment',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'Authorization': window.localStorage.getItem('token')
                    },
                    data: qs.stringify(querydata)
                }).then(function (res) {
                    let status = res.data.status;
                    if (status == 200) {
                        _this.variance = 0;
                        _this.getmycomment();
                        return;
                    }
                    switch (status) {
                        case 400:
                            alert("参数请求错误！");
                            break;
                        case 401:
                            alert("用户验证失败，请重新登录！");
                            window.localStorage.setItem('token', '');
                            _this.$store.commit('deletelogin');
                            window.location.href = "/login";
                            break;
                        case 403:
                            alert("服务器拒绝了您的请求，请稍后再试！");
                            break;
                        case 500:
                            alert("服务器连接错误，请稍后再试！");
                            break;
                        default:
                            alert("发生错误！");
                    }
                }).catch(function (err) {
                    alert(err);
                });
            },
            deletecomment(id, star) {
                let _this = this;
                const querydata = {
                    'commentid': id,
                    'star': star
                };
                this.axios({
                    method: 'DELETE',
                    url: this.$store.state.host + this.$route.path + '/mycomment',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'Authorization': window.localStorage.getItem('token')
                    },
                    data: qs.stringify(querydata)
                }).then(function (res) {
                    let status = res.data.status;
                    if (status == 200) {
                        _this.mydata.splice(0);
                        _this.mycommentid = 0;
                        _this.mycommentstar = 0;
                        _this.variance = 0;
                        _this.mycommentcontent = "";
                        return;
                    }
                    switch (status) {
                        case 400:
                            alert("参数请求错误！");
                            break;
                        case 401:
                            alert("用户验证失败，请重新登录！");
                            window.localStorage.setItem('token', '');
                            _this.$store.commit('deletelogin');
                            window.location.href = "/login";
                            break;
                        case 403:
                            alert("服务器拒绝了您的请求，请稍后再试！");
                            break;
                        case 500:
                            alert("服务器连接错误，请稍后再试！");
                            break;
                        default:
                            alert("发生错误！");
                    }
                }).catch(function (err) {
                    alert(err);
                });
            },
            onClick(item) {
                item.praisestatus = !item.praisestatus;
                item.praise += item.praisestatus ? 1 : -1;
                let _this = this;
                const querydata = {
                    'commentid': item.id
                };
                this.axios({
                    method: item.praisestatus ? 'POST' : 'DELETE',
                    url: this.$store.state.host + this.$route.path + '/praise',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'Authorization': window.localStorage.getItem('token')
                    },
                    data: qs.stringify(querydata)
                }).then(function (res) {
                    let status = res.data.status;
                    if (status == 200) {
                        return;
                    }
                    switch (status) {
                        case 400:
                            alert("参数请求错误！");
                            break;
                        case 401:
                            alert("用户验证失败，请重新登录！");
                            window.localStorage.setItem('token', '');
                            _this.$store.commit('deletelogin');
                            window.location.href = "/login";
                            break;
                        case 403:
                            alert("服务器拒绝了您的请求，请稍后再试！");
                            break;
                        case 500:
                            alert("服务器连接错误，请稍后再试！");
                            break;
                        default:
                            alert("发生错误！");
                    }
                }).catch(function (err) {
                    alert(err);
                });
            },
            menuclick(index) {
                let func = 'POST';
                if (this.shelfstatus == "加入书架") {
                    func = 'PUT';
                } else if (show[index] == "取消收藏") {
                    func = 'DELETE';
                }
                const querydata = {
                    'bookid': this.id,
                    'status': show[index],
                    'shelfid': this.shelfid,
                };
                let _this = this;
                this.axios({
                    method: func,
                    url: this.$store.state.host + '/users/' + this.$store.state.userid + '/shelf',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'Authorization': window.localStorage.getItem('token')
                    },
                    data: qs.stringify(querydata)
                }).then(function (res) {
                    let status = res.data.status;
                    if (status == 200) {
                        _this.shelfstatus = _this.show[index] == "取消收藏" ? "加入书架" : _this.show[index];
                        _this.show.length = 0;
                        for (let i = 0; i < 5; i++) {
                            _this.show.push(shelfstatuses[i]);
                            if (shelfstatuses[i] == _this.shelfstatus) {
                                _this.show.pop();
                            }
                        }
                        return;
                    }
                    switch (status) {
                        case 400:
                            alert("参数请求错误！");
                            break;
                        case 401:
                            alert("用户验证失败，请重新登录！");
                            window.localStorage.setItem('token', '');
                            _this.$store.commit('deletelogin');
                            window.location.href = "/login";
                            break;
                        case 403:
                            alert("服务器拒绝了您的请求，请稍后再试！");
                            break;
                        case 500:
                            alert("服务器连接错误，请稍后再试！");
                            break;
                        default:
                            alert("发生错误！");
                    }
                }).catch(function (err) {
                    alert(err);
                });
            },
            getbookinfo() {
                let _this = this;
                this.axios({
                    method: 'GET',
                    url: this.$store.state.host + this.$route.path,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'Authorization': window.localStorage.getItem('token')
                    }
                }).then(function (res) {
                    let status = res.data.status;
                    if (status == 200) {
                        _this.id = res.data.data[0].id;
                        _this.shelfid = res.data.data[0].shelfid ? res.data.data[0].shelfid : 0;
                        _this.icon = res.data.data[0].icon;
                        _this.title = res.data.data[0].title;
                        _this.author = res.data.data[0].author;
                        _this.type = res.data.data[0].type;
                        _this.status = res.data.data[0].status ? "已完结" : "连载中";
                        _this.words = res.data.data[0].words;
                        _this.summarize = res.data.data[0].summarize;
                        _this.latest = res.data.data[0].latest;
                        _this.totalstar = res.data.data[0].totalstar;
                        _this.totalpeople = res.data.data[0].totalpeople;
                        _this.titlelink = res.data.data[0].titlelink;
                        _this.latestlink = res.data.data[0].latestlink;
                        _this.shelfstatus = res.data.data[0].shelfstatus ? res.data.data[0].shelfstatus : "加入书架";
                        for (let i = 0; i < 5; i++) {
                            _this.show.push(shelfstatuses[i]);
                            if (shelfstatuses[i] == _this.shelfstatus) {
                                _this.show.pop();
                            }
                        }
                        return;
                    }
                    switch (status) {
                        case 400:
                            alert("参数请求错误！");
                            break;
                        case 401:
                            alert("用户验证失败，请重新登录！");
                            window.localStorage.setItem('token', '');
                            _this.$store.commit('deletelogin');
                            window.location.href = "/login";
                            break;
                        case 403:
                            alert("服务器拒绝了您的请求，请稍后再试！");
                            break;
                        case 404:
                            alert("没有该书籍信息，请稍后再试！");
                            window.location.href = "/booklist";
                            break;
                        case 500:
                            alert("服务器连接错误，请稍后再试！");
                            break;
                        default:
                            alert("发生错误！");
                    }
                }).catch(function (err) {
                    alert(err);
                });
            },
            getbookcomment(bc) {
                let _this = this;
                this.axios({
                    method: 'GET',
                    url: this.$store.state.host + this.$route.path + bc,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'Authorization': window.localStorage.getItem('token')
                    }
                }).then(function (res) {
                    let status = res.data.status;
                    _this.commentdata.splice(0);
                    if (status == 200) {
                        for (let i = 0; i < res.data.data.length; i++) {
                            let iteminfo = {
                                id: res.data.data[i].id,
                                nickname: res.data.data[i].nickname,
                                star: res.data.data[i].star,
                                content: res.data.data[i].content,
                                time: _this.moment(res.data.data[i].time).format("YYYY-MM-DD HH:mm:ss"),
                                praise: res.data.data[i].praise,
                                quality: res.data.data[i].quality,
                                praisestatus: res.data.data[i].praisestatus
                            }
                            _this.commentdata.push(iteminfo);
                        }
                        return;
                    } else if (status == 404) {
                        return;
                    }
                    switch (status) {
                        case 400:
                            alert("参数请求错误！");
                            break;
                        case 401:
                            alert("用户验证失败，请重新登录！");
                            window.localStorage.setItem('token', '');
                            _this.$store.commit('deletelogin');
                            window.location.href = "/login";
                            break;
                        case 403:
                            alert("服务器拒绝了您的请求，请稍后再试！");
                            break;
                        case 500:
                            alert("服务器连接错误，请稍后再试！");
                            break;
                        default:
                            alert("发生错误！");
                    }
                }).catch(function (err) {
                    alert(err);
                });
            },
            getmycomment() {
                let _this = this;
                this.axios({
                    method: 'GET',
                    url: this.$store.state.host + this.$route.path + '/mycomment',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'Authorization': window.localStorage.getItem('token')
                    }
                }).then(function (res) {
                    let status = res.data.status;
                    _this.mydata.splice(0);
                    if (status == 200) {
                        _this.mycommentid = res.data.data[0].id;
                        _this.mycommentstar = res.data.data[0].star;
                        _this.mycommentcontent = res.data.data[0].content;
                        let iteminfo = {
                            id: res.data.data[0].id,
                            nickname: res.data.data[0].nickname,
                            star: res.data.data[0].star,
                            content: res.data.data[0].content,
                            time: _this.moment(res.data.data[0].time).format("YYYY-MM-DD HH:mm:ss"),
                            praise: res.data.data[0].praise,
                            quality: res.data.data[0].quality,
                            praisestatus: res.data.data[0].praisestatus
                        }
                        _this.mydata.push(iteminfo);
                        return;
                    } else if (status == 404) {
                        return;
                    }
                    switch (status) {
                        case 400:
                            alert("参数请求错误！");
                            break;
                        case 401:
                            alert("用户验证失败，请重新登录！");
                            window.localStorage.setItem('token', '');
                            _this.$store.commit('deletelogin');
                            window.location.href = "/login";
                            break;
                        case 403:
                            alert("服务器拒绝了您的请求，请稍后再试！");
                            break;
                        case 500:
                            alert("服务器连接错误，请稍后再试！");
                            break;
                        default:
                            alert("发生错误！");
                    }
                }).catch(function (err) {
                    alert(err);
                });
            }
        }
    }
</script>

<style scoped>
    #layout {
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, .25);
    }
    #info {
        width: 100%;
        height: 30%;
        margin-top: 64px;
        padding: 15px 80px 0 80px;
        background-color: rgba(255, 255, 255, 1);
    }
    #cover {
        width: 150px;
        float: left;
        margin-right: 30px;
    }
    #wordinfo {
        float: left;
    }
    #readbutton {
        margin-right: 10px;
    }
    #mark{
        float: right;
        text-align: center;
    }
    #score {
        font-size: 80px;
    }
    #commentblock {
        width: 840px;
        height: 470px;
        border-radius: 20px;
        margin: 10px 0 0 20px;
        padding: 5px 20px;
        float: left;
        background-color: rgba(255, 255, 255, 1);
    }
    #mycomment {
        width: 630px;
        height: 470px;
        border-radius: 20px;
        margin: 10px 20px 0 0;
        padding: 5px 20px;
        float: right;
        background-color: rgba(255, 255, 255, 1);
    }
    #mycomment .title {
        margin: 5px 0 0 10px;
    }
</style>