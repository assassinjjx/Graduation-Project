<template>
    <a-layout id="layout">
        <a-layout-header :style="{ position: 'fixed', zIndex: 1, width: '100%' }">
            <h class="logo">毕业设计</h>
            <a-menu theme="dark"
                    mode="horizontal"
                    @click="onMenuClick"
                    :selectedKeys="[this.$store.state.selectedkey]"
                    :style="{ lineHeight: '64px' }">
                <a-menu-item key="1" :disabled="this.$store.state.loginstatus"><router-link :to="'/users/'+this.$store.state.userid+'/shelf/'">个人中心</router-link></a-menu-item>
                <a-menu-item key="2" :disabled="this.$store.state.loginstatus"><router-link to="/booklist">书库</router-link></a-menu-item>
                <a-menu-item key="3" :disabled="this.$store.state.loginstatus"><router-link to="/comments">书评</router-link></a-menu-item>
            </a-menu>
            <div id="logout" align="right">
                <a-button type="primary" :disabled="this.$store.state.loginstatus" @click="onExitClick">
                    <a-icon type="logout" />
                    <span>退出</span>
                </a-button>
            </div>
        </a-layout-header>
        <div id="window">
            <router-view/>
        </div>
    </a-layout>
</template>

<script>
    export default {
        methods: {
            onMenuClick(e) {
                this.$store.commit('select', e.key);
            },
            onExitClick() {
                window.localStorage.setItem('token', '');
                this.$store.commit('deletelogin');
                this.$notification.open({
                    message: "退出成功"
                });
                setTimeout(() => {
                    window.location.href = "/login";
                }, 500);
            }
        }
    }
</script>

<style scoped>
    #layout {
        width: 100%;
        height: 100%;
    }
    #layout .logo {
        width: 110px;
        height: 40px;
        font-size: x-large;
        color: white;
        margin: 0 90px 23px 50px;
        float: left;
    }
    #logout {
        margin: -65px -15px 23px 0;
    }
    #window{
        width: 100%;
        height: 100%;
        position: absolute;
    }
    
</style>