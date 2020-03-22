<template>
    <a-layout id="layout">
        <div id="background">
            <div id="select">
                <p>
                    <span>分类：</span>
                    <a-radio-group defaultValue="全部" buttonStyle="solid" class="target" @change="ontypechange">
                        <a-radio-button value="全部">全部</a-radio-button>
                        <a-radio-button value="二次元">二次元</a-radio-button>
                        <a-radio-button value="都市言情">都市言情</a-radio-button>
                        <a-radio-button value="都市娱乐">都市娱乐</a-radio-button>
                        <a-radio-button value="短篇美文">短篇美文</a-radio-button>
                        <a-radio-button value="古代言情">古代言情</a-radio-button>
                        <a-radio-button value="幻想时空">幻想时空</a-radio-button>
                        <a-radio-button value="竞技同人">竞技同人</a-radio-button>
                        <a-radio-button value="科幻游戏">科幻游戏</a-radio-button>
                        <a-radio-button value="历史军事">历史军事</a-radio-button>
                        <a-radio-button value="评论文集">评论文集</a-radio-button>
                        <a-radio-button value="奇幻玄幻">奇幻玄幻</a-radio-button>
                        <a-radio-button value="武侠仙侠">武侠仙侠</a-radio-button>
                        <a-radio-button value="悬疑灵异">悬疑灵异</a-radio-button>
                    </a-radio-group>
                </p>
                <p>
                    <span>字数：</span>
                    <a-radio-group defaultValue="0" buttonStyle="solid" class="target" @change="onwordschange">
                        <a-radio-button value="0">全部</a-radio-button>
                        <a-radio-button value="1">20万字已下</a-radio-button>
                        <a-radio-button value="2">20-50万字</a-radio-button>
                        <a-radio-button value="3">50-100万字</a-radio-button>
                        <a-radio-button value="4">100-200万字</a-radio-button>
                        <a-radio-button value="5">200万字以上</a-radio-button>
                    </a-radio-group>
                </p>
                <p>
                    <span>状态：</span>
                    <a-radio-group defaultValue="全部" buttonStyle="solid" class="target" @change="onstatuschange">
                        <a-radio-button value="全部">全部</a-radio-button>
                        <a-radio-button value="0">连载中</a-radio-button>
                        <a-radio-button value="1">已完结</a-radio-button>
                    </a-radio-group>
                </p>
                <p>
                    <span>排序：</span>
                    <a-radio-group defaultValue="totalstar" buttonStyle="solid" class="target" @change="onorderchange">
                        <a-radio-button value="totalstar">综合</a-radio-button>
                        <a-radio-button value="words">字数</a-radio-button>
                        <a-radio-button value="totalstar/totalpeople">评分</a-radio-button>
                        <a-radio-button value="totalpeople">评分人数</a-radio-button>
                    </a-radio-group>
                </p>
            </div>
            <a-list id="list" itemLayout="vertical" size="large" :pagination="pagination" :dataSource="booklist">
                <a-list-item slot="renderItem" slot-scope="item, index" key="index">
                    <div id="itemstyle">
                        <img :src="item.icon" id="cover"/>
                        <div>
                            <div id="wordinfo">
                                <h3><b><a :href="'/books/' + item.id">{{item.title}}</a></b></h3>
                                <p>
                                    作者：{{item.author}}&nbsp;&nbsp;&nbsp;
                                    字数：{{item.words}} &nbsp;&nbsp;&nbsp;
                                    {{item.status}}
                                </p>
                                <p>
                                    书籍评分：{{(item.totalstar / item.totalpeople).toFixed(1)}}
                                    &nbsp;&nbsp;&nbsp;
                                    评分人数：{{item.totalpeople}}
                                </p>
                                <p><a :href="item.latestlink">最新章节：{{item.latest}}</a></p>
                                <p>
                                    本书标签：{{item.type}}
                                    &nbsp;&nbsp;&nbsp;
                                    <a-dropdown>
                                        <a-button>
                                            {{item.shelfstatus}}
                                        </a-button>
                                        <a-menu slot="overlay">
                                            <a-menu-item>未知</a-menu-item>
                                            <a-menu-item>未知</a-menu-item>
                                            <a-menu-item>为止</a-menu-item>
                                            <a-menu-item>应该</a-menu-item>
                                        </a-menu>
                                    </a-dropdown>
                                </p>
                            </div>
                        </div>
                    </div>
                </a-list-item>
            </a-list>    
        </div>
    </a-layout>
</template>

<script>
    const shelfstatuses = ["正在追读", "养肥待看", "已经看过", "不看屏蔽", "取消收藏"];
    const booklist = [];

    export default {
        created() {
            this.getbooklist();
        },
        data() {
            return {
                type: 0,
                lwords: 0,
                hwords: 0,
                status: -1,
                order: "totalstar",
                booklist,
                pagination: {
                    pageSize: 20
                }
            }
        },
        methods: {
            ontypechange(e) {
                this.type = e.target.value;
                if (this.type == "全部") {
                    this.type = 0;
                }
                this.getbooklist();
            },
            onwordschange(e) {
                switch (e.target.value) {
                    case "0":
                        this.lwords = 0;
                        this.hwords = 0;
                        break;
                    case "1":
                        this.lwords = 0;
                        this.hwords = 200000;
                        break;
                    case "2":
                        this.lwords = 200000;
                        this.hwords = 500000;
                        break;
                    case "3":
                        this.lwords = 500000;
                        this.hwords = 1000000;
                        break;
                    case "4":
                        this.lwords = 1000000;
                        this.hwords = 2000000;
                        break;
                    case "5":
                        this.lwords = 2000000;
                        this.hwords = 0;
                        break;
                }
                this.getbooklist();
            },
            onstatuschange(e) {
                this.status = e.target.value;
                if (this.status == "全部") {
                    this.status = -1;
                }
                this.getbooklist();
            },
            onorderchange(e) {
                this.order = e.target.value;
                this.getbooklist();
            },
            getbooklist() {
                let _this = this;
                this.axios({
                    method: 'GET',
                    url: this.$store.state.host + '/booklist',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'Authorization': window.localStorage.getItem('token')
                    },
                    params: {
                        'type': this.type,
                        'lwords': this.lwords,
                        'hwords': this.hwords,
                        'status': this.status,
                        'order': this.order
                    }
                }).then(function (res) {
                    let status = res.data.status;
                    _this.booklist.splice(0);
                    switch (status) {
                        case 200:
                            for (let i = 0; i < res.data.data.length; i++) {
                                let iteminfo = {
                                    id: res.data.data[i].id,
                                    shelfid: res.data.data[i].shelfid ? res.data.data[i].shelfid : 0,
                                    icon: res.data.data[i].icon,
                                    title: res.data.data[i].title,
                                    author: res.data.data[i].author,
                                    type: res.data.data[i].type,
                                    status: res.data.data[i].status ? "已完结" : "连载中",
                                    words: res.data.data[i].words,
                                    latest: res.data.data[i].latest,
                                    totalstar: res.data.data[i].totalstar,
                                    totalpeople: res.data.data[i].totalpeople,
                                    latestlink: res.data.data[i].latestlink,
                                    shelfstatus: res.data.data[i].shelfstatus ? res.data.data[i].shelfstatus : "加入书架"
                                }
                                _this.booklist.push(iteminfo);
                            }
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
        padding: 0 0 20px 0;
        background-color: rgba(0, 0, 0, .25);
    }
    #select {
        width: 70%;
        height: 430px;
        margin: 64px auto 10px;
        padding: 10px 80px 0;
        background-color: rgba(255, 255, 255, 1);
    }
        #select .target {
            width: 100%;
            margin: 5px 0;
        }
    #list {
        width: 70%;
        margin-top: 50px;
        margin: 10px auto 10px;
        padding: 0 20px 10px 20px;
        background-color: rgba(255, 255, 255, 1);
    }
    #itemstyle {
        width: 100%;
        height: 160px;
    }
    #cover {
        width: 130px;
        float: right;
        margin-right: 30px;
    }
    #wordinfo {
        height: 100px;
        padding: 0 30px;
        float: left;
    }
</style>