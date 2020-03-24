<template>
    <a-layout id="layout">
        <a-layout-sider id="sider" width="300px" theme="light">
            <a-card id="card" title="用户基本信息">
                <p>昵称：{{this.nickname}}</p>
                <p>性别：{{this.gender}}</p>
                <p>年龄：{{this.old}}</p>
            </a-card>
            <a-menu theme="light"
                    mode="inline"
                    @click="onMenuClick"
                    :selectedKeys="[this.$store.state.userfunction]">
                <a-menu-item key="1"><router-link :to="'/users/'+this.$store.state.userid+'/shelf'">我的书架</router-link></a-menu-item>
                <a-menu-item key="2"><router-link :to="'/users/'+this.$store.state.userid+'/comments'">我的书评</router-link></a-menu-item>
                <a-menu-item key="3"><router-link :to="'/users/'+this.$store.state.userid+'/update'">修改个人信息</router-link></a-menu-item>
            </a-menu>
        </a-layout-sider>
        <div id="window">
            <router-view/>
        </div>
    </a-layout> 
</template>

<script>
    export default {
        created() {
            this.$store.commit('select', '1');
            this.getuserinfo();
        },
        data() {
            return {
                nickname: "",
                gender: "女",
                old: 0
            }
        },
        methods: {
            onMenuClick(e) {
                this.$store.commit('selectfunc', e.key);
            },
            getuserinfo() {
                let _this = this;
                this.axios({
                    method: 'GET',
                    url: this.$store.state.host + '/users/' + this.$store.state.userid,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'Authorization': window.localStorage.getItem('token')
                    }
                }).then(function (res) {
                    let status = res.data.status;
                    if (status == 200) {
                        _this.nickname = res.data.data[0].nickname;
                        _this.old = res.data.data[0].old;
                        _this.gender = "女";
                        if (res.data.data[0].gender == 1) {
                            _this.gender = "男";
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
                            window.localStorage.setItem('token', '');
                            _this.$store.commit('deletelogin');
                            window.location.href = "/login";
                            alert("用户不存在！");
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
        z-index: -1;
        background-color: rgba(255, 255, 255, 1);
    }
    #sider {
        padding: 30px 0;
        height: 100%;
        position: fixed;
    }
    #card {
        text-align: left;
        border-radius: 20px;
        background: rgba(107, 171, 225, .75);
        height: 200px;
        width: 250px;
        margin: 0 auto 40px;
    }
    #window{
        width: 100%;
        height: 100%;
    }
</style>