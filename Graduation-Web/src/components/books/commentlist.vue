<template>
    <a-layout id="layout">
        <div id="background">
            <a-list id="list" itemLayout="vertical" size="large" :pagination="pagination" :dataSource="data">
                <a-list-item slot="renderItem" slot-scope="item, index" key="index">
                    <a-comment>
                        <h2>{{item.nickname}}</h2>
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
                        </p>
                    </a-comment>
                </a-list-item>
            </a-list>
        </div>
    </a-layout>    
</template>

<script>
    import moment from 'moment';
    import qs from 'qs';

    const data = [];

    export default {
        created() {
            this.getcomments();
        },
        data() {
            return {
                moment,
                data,
                pagination: {
                    pageSize: 20
                }
            }
        },
        methods: {
            toBook() {
                this.$store.commit('select', '2');
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
                    url: this.$store.state.host + '/books/' + item.bookid + '/praise',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'Authorization': window.localStorage.getItem('token')
                    },
                    data: qs.stringify(querydata)
                }).then(function (res) {
                    let status = res.data.status;
                    switch (status) {
                        case 200:
                            break;
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
            getcomments() {
                let _this = this;
                this.axios({
                    method: 'GET',
                    url: this.$store.state.host + '/comments',
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
                                nickname: res.data.data[i].nickname,
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
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 1);
    }

    #background {
        width: 100%;
        min-height: 100%;
        padding: 0 0 25px 0;
        background-color: rgba(0, 0, 0, .25);
        position: absolute;
    }
    #list {
        width: 65%;
        border-radius: 10px;
        margin: 30px auto 5px;
        padding: 0 10px 10px 0;
        background-color: rgba(255, 255, 255, 1);
    }
</style>