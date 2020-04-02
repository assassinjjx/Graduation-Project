<template>
    <a-layout id="layout">
        <a-tabs type="card" @change="onChange">
            <a-tab-pane tab="正在追读" key="1">
                <a-list :grid="{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 4, xxl: 4 }"
                        size="large"
                        :pagination="pagination"
                        :dataSource="data">
                    <a-list-item slot="renderItem" slot-scope="item, index">
                        <a-card>
                            <img alt="example"
                                 :src="item.icon"
                                 height="270"
                                 slot="cover" />
                            <p><a :href="'http://localhost:1337/books/'+item.bookid" @click="toBook"><b>{{item.title}}</b></a></p>
                            <p>作者：{{item.author}}</p>
                            <p>字数：{{item.words}}</p>
                            <p>分类：{{item.type}}</p>
                            <p>星级：<a-rate v-model="item.star" disabled /></p>
                            <p>连载状态：{{item.status}}</p>
                            <a :href="item.titlelink">立即阅读</a>
                            &nbsp;&nbsp;
                            <a-dropdown>
                                <a-button>修改</a-button>
                                <a-menu slot="overlay">
                                    <a-menu-item @click="updateShelf(item.id, index, '养肥待看')">养肥待看</a-menu-item>
                                    <a-menu-item @click="updateShelf(item.id, index, '已经看过')">已经看过</a-menu-item>
                                    <a-menu-item @click="updateShelf(item.id, index, '不看屏蔽')">不看屏蔽</a-menu-item>
                                    <a-menu-item @click="deleteShelf(item.id, index)">取消收藏</a-menu-item>
                                </a-menu>
                            </a-dropdown>
                        </a-card>
                    </a-list-item>
                </a-list>
            </a-tab-pane>
            <a-tab-pane tab="养肥待看" key="2">
                <a-list :grid="{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 4, xxl: 4 }"
                        size="large"
                        :pagination="pagination"
                        :dataSource="data">
                    <a-list-item slot="renderItem" slot-scope="item, index">
                        <a-card>
                            <img alt="example"
                                 :src="item.icon"
                                 height="270"
                                 slot="cover" />
                            <p><a :href="'http://localhost:1337/books/'+item.bookid" @click="toBook"><b>{{item.title}}</b></a></p>
                            <p>作者：{{item.author}}</p>
                            <p>字数：{{item.words}}</p>
                            <p>分类：{{item.type}}</p>
                            <p>星级：<a-rate v-model="item.star" disabled /></p>
                            <p>连载状态：{{item.status}}</p>
                            <a :href="item.titlelink">立即阅读</a>
                            &nbsp;&nbsp;
                            <a-dropdown>
                                <a-button>修改</a-button>
                                <a-menu slot="overlay">
                                    <a-menu-item @click="updateShelf(item.id, index, '正在追读')">正在追读</a-menu-item>
                                    <a-menu-item @click="updateShelf(item.id, index, '已经看过')">已经看过</a-menu-item>
                                    <a-menu-item @click="updateShelf(item.id, index, '不看屏蔽')">不看屏蔽</a-menu-item>
                                    <a-menu-item @click="deleteShelf(item.id, index)">取消收藏</a-menu-item>
                                </a-menu>
                            </a-dropdown>
                        </a-card>
                    </a-list-item>
                </a-list>
            </a-tab-pane>
            <a-tab-pane tab="已经看过" key="3">
                <a-list :grid="{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 4, xxl: 4 }"
                        size="large"
                        :pagination="pagination"
                        :dataSource="data">
                    <a-list-item slot="renderItem" slot-scope="item, index">
                        <a-card>
                            <img alt="example"
                                 :src="item.icon"
                                 height="300"
                                 slot="cover" />
                            <p><a :href="'http://localhost:1337/books/'+item.bookid" @click="toBook"><b>{{item.title}}</b></a></p>
                            <p>作者：{{item.author}}</p>
                            <p>字数：{{item.words}}</p>
                            <p>分类：{{item.type}}</p>
                            <p>星级：<a-rate v-model="item.star" disabled /></p>
                            <p>连载状态：{{item.status}}</p>
                            <a :href="item.titlelink">立即阅读</a>
                            &nbsp;&nbsp;
                            <a-dropdown>
                                <a-button>修改</a-button>
                                <a-menu slot="overlay">
                                    <a-menu-item @click="updateShelf(item.id, index, '正在追读')">正在追读</a-menu-item>
                                    <a-menu-item @click="updateShelf(item.id, index, '养肥待看')">养肥待看</a-menu-item>
                                    <a-menu-item @click="updateShelf(item.id, index, '不看屏蔽')">不看屏蔽</a-menu-item>
                                    <a-menu-item @click="deleteShelf(item.id, index)">取消收藏</a-menu-item>
                                </a-menu>
                            </a-dropdown>
                        </a-card>
                    </a-list-item>
                </a-list>
            </a-tab-pane>
        </a-tabs>
    </a-layout>

</template>

<script>
    import { httprequest } from '../../../http';
    const data = [];

    export default {
        created() {
            this.$store.commit('selectfunc', '1');
            this.getusershelf("正在追读");
        },
        data() {
            return {
                data,
                pagination: {
                    pageSize: 12
                },
            };
        },
        methods: {
            onChange(key) {
                let bookstatus = "";
                switch (key) {
                    case "2":
                        bookstatus = "养肥待看";
                        break;
                    case "3":
                        bookstatus = "已经看过";
                        break;
                    default:
                        bookstatus = "正在追读";
                        break;
                }
                this.getusershelf(bookstatus);
            },
            toBook() {
                this.$store.commit('select', '2');
            },
            updateShelf(id, index, s) {
                let _this = this;
                const resdata = {
                    'shelfid': id,
                    'status': s
                };
                httprequest('POST', this.$store.state.host + '/users/' + this.$store.state.userid + '/shelf', resdata)
                .then(function (res) {
                    let status = res.data.status;
                    if (status == 200) {
                        _this.data.splice(index, 1);
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
            deleteShelf(id, index) {
                let _this = this;
                const resdata = {
                    'shelfid': id,
                };
                httprequest('DELETE', this.$store.state.host + '/users/' + this.$store.state.userid + '/shelf', resdata)
                .then(function (res) {
                    let status = res.data.status;
                    if (status == 200) {
                        _this.data.splice(index, 1);
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
            getusershelf(s) {
                let _this = this;
                const resdata = {
                    'status': s
                };
                httprequest('GET', this.$store.state.host + '/users/' + this.$store.state.userid + '/shelf', resdata)
                .then(function (res) {
                    let status = res.data.status;
                    _this.data.splice(0);
                    if (status == 200) {
                        for (let i = 0; i < res.data.data.length; i++) {
                            let iteminfo = {
                                id: res.data.data[i].id,
                                bookid: res.data.data[i].bookid,
                                title: res.data.data[i].title,
                                author: res.data.data[i].author,
                                type: res.data.data[i].type,
                                status: res.data.data[i].status ? "已完结" : "连载中",
                                words: res.data.data[i].words,
                                star: res.data.data[i].star ? res.data.data[i].star : 0,
                                icon: res.data.data[i].icon,
                                titlelink: res.data.data[i].titlelink,
                            }
                            _this.data.push(iteminfo);
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
    };
</script>

<style scoped>
    #layout {
        z-index: -2;
        width: 100%;
        min-height: 100%;
        padding: 30px 30px 10px 350px;
        background-color: rgba(0, 0, 0, .25);
    }
</style>