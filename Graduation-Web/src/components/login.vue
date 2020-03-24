<template>
    <a-layout id="layout">
        <a-card id="card" title="用户登录">
            <a-form id="login"
                    :form="form"
                    @submit="handleSubmit">
                <a-form-item>
                    <a-input v-decorator="[
                             'username',
                             { rules: [{ required: true, message: 'Please input your username!' }],
                             initialValue: this.storename }
                             ]"
                             placeholder="Username">
                        <a-icon slot="prefix"
                                type="user"
                                style="color: rgba(0,0,0,.25)"/>
                    </a-input>
                </a-form-item>
                <a-form-item>
                    <a-input v-decorator="[
                             'password',
                             { rules: [{ required: true, message: 'Please input your password!' }] }
                             ]"
                             type="password"
                             placeholder="Password">
                        <a-icon slot="prefix"
                                type="lock"
                                style="color: rgba(0,0,0,.25)"/>
                    </a-input>
                </a-form-item>
                <a-form-item>
                    <a-checkbox v-decorator="[
                                'remember',
                                { valuePropName: 'checked', initialValue: this.$store.state.checkstatus }
                                ]"
                                class="remember"
                                @change="onChange">
                        记住我
                    </a-checkbox>
                    <a class="forgot" href="">
                        忘记密码
                    </a>
                    <a-button type="primary"
                              html-type="submit"
                              class="button">
                        登录
                    </a-button>
                    <a href="/register">
                        注册
                    </a>
                </a-form-item>
            </a-form>  
        </a-card>
    </a-layout>
</template>

<script>
    import qs from 'qs';

    export default {
        beforeCreate() {
            switch (this.$store.state.selectedkey) {
                case "1":
                    window.location.href = '/users/' + this.$store.state.userid + '/shelf';
                    break;
                case "2":
                    window.location.href = '/booklist';
                    break;
                case "3":
                    window.location.href = '/commentlist';
                    break;
            }
            this.form = this.$form.createForm(this);
        },
        data() {
            return {
                storename: window.localStorage.getItem('storename') ? window.localStorage.getItem('storename') : ""
            }
        },
        methods: {
            onChange() {
                this.$store.commit('check');
            },
            handleSubmit(e) {
                e.preventDefault();
                let _this = this;
                this.form.validateFields((err, values) => {
                    if (err) {
                        alert(err);
                        return;
                    }
                    const username = values['username'];
                    const password = values['password'];
                    if (username && password) {
                        if (_this.$store.state.checkstatus) {
                            window.localStorage.setItem('storename', username);
                        } else {
                            window.localStorage.setItem('storename', '');
                        }
                        const data = {
                            'username': username,
                            'password': password
                        };
                        this.axios({
                            method: 'POST',
                            url: this.$store.state.host + '/users/login',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
                            data: qs.stringify(data)
                        }).then(function (res) {
                            let status = res.data.status;
                            if (status == 200) {
                                let token = res.data.data.token;
                                window.localStorage.setItem('token', token);
                                let payload = token.split('.')[1];
                                let id = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8')).jti;
                                _this.$store.commit('addlogin', id);
                                _this.$notification.open({
                                    message: "登录成功！"
                                });
                                setTimeout(() => {
                                    window.location.href = "/users/" + id.toString() + "/shelf";
                                }, 500);
                                return;
                            }
                            switch (status) {
                                case 400:
                                    alert("参数请求错误，登录失败！");
                                    break;
                                case 403:
                                    alert("该用户不存在或用户名密码错误，登录失败！");
                                    break;
                                case 500:
                                    alert("服务器连接错误，登录失败，请稍后再试！");
                                    break;
                                default:
                                    alert("参数格式发生错误，登录失败！");
                            }
                        }).catch(function (err) {
                            alert(err);
                        });
                    }
                    else {
                        alert("必填项不能为空！");
                    }
                });
            }
        }
    }
</script>

<style scoped>
    #layout {
        text-align: center;
        background:rgb(255,255,255);
        width: 100%;
        height: 100%;
        position: absolute;
    }
    #card {
        text-align: center;
        border-radius: 50px;
        background: rgb(255, 255, 255);
        height: 400px;
        width: 600px;
        margin: 100px auto;
    }
    #login {
        width: 400px;
        margin: 0 auto;
    }
    #login .remember {
        float: left;
    }
    #login .forgot {
        float: right;
    }
    #login .button {
        width: 100%;
    }
</style>