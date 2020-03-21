<template>
    <a-layout id="layout">
        <a-list id="list" itemLayout="vertical" size="large" :pagination="pagination" :dataSource="data">
            <a-list-item slot="renderItem" slot-scope="item, index" key="index">
                <a-comment>
                    <p>
                        <b><a :href="'http://localhost:1337/books/' + item.bookid" @click="toBook">{{item.title}}</a></b>
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
                        <a :href="'http://localhost:1337/books/' + item.bookid" @click="toBook">编辑</a>
                    </p>
                </a-comment>
            </a-list-item>
        </a-list>
    </a-layout>
</template>
<script>
    import moment from 'moment';
    import qs from 'qs';
    const data = [];

    export default {
        created() {
            this.$store.commit('selectfunc', '2');
            this.getusercomments();
        },
        data() {
            return {
                data,
                moment,
                pagination: {
                    pageSize: 3
                },
            };
        },
        methods: {
            onClick(item) {
                item.praisestatus = !item.praisestatus;
                item.praise += item.praisestatus ? 1 : -1;
                let _this = this;
                const querydata = {
                    'commentid': item.id
                };
                this.axios({
                    method: item.praisestatus ? 'POST' : 'DELETE',
                    url: this.$store.state.host + '/books/' + item.bookid + '/praise',
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
            toBook() {
                this.$store.commit('select', '2');
            },
            getusercomments() {
                let _this = this;
                this.axios({
                    method: 'GET',
                    url: this.$store.state.host + '/users/' + this.$store.state.userid + '/comments',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'Authorization': window.localStorage.getItem('token')
                    }
                }).then(function (res) {
                    let status = res.data.status;
                    _this.data.splice(0);
                    if (status == 200) {
                        for (let i = 0; i < res.data.data.length; i++) {
                            let iteminfo = {
                                id: res.data.data[i].id,
                                bookid: res.data.data[i].bookid,
                                title: "<<" + res.data.data[i].title + ">>",
                                star: res.data.data[i].star,
                                content: res.data.data[i].content,
                                time: _this.moment(res.data.data[i].time).format("YYYY-MM-DD HH:mm:ss"),
                                praise: res.data.data[i].praise,
                                quality: res.data.data[i].quality,
                                praisestatus: res.data.data[i].praisestatus
                            }
                            _this.data.push(iteminfo);
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
            }
        }
    }
</script>
<style scoped>
    #layout {
        z-index: -2;
        width: 100%;
        height: 100%;
        padding: 114px 30px 10px 150px;
        background-color: rgba(0, 0, 0, .25);
    }
    #list {
        border-radius: 20px;
        background-color: rgba(255, 255, 255, 1);
    }
</style>
