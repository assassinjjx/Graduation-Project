<template>
    <a-layout id="layout">
        <a-card id='card' title="用户注册">
            <a-form id="register"
                    :form="form"
                    @submit="handleSubmit">
                <a-form-item label="用户名："
                             :label-col="{ span: 5 }"
                             :wrapper-col="{ span: 18 }">
                    <a-input v-decorator="[
                             'username',
                             { rules: [{ required: true, message: 'Please input your username!' }] }
                             ]">
                        <a-icon slot="prefix"
                                type="user"
                                style="color: rgba(0,0,0,.25)" />
                    </a-input>
                </a-form-item>
                <a-form-item label="用户密码："
                             :label-col="{ span: 5 }"
                             :wrapper-col="{ span: 18 }">
                    <a-input v-decorator="[
                             'password',
                             { rules: [{ required: true, message: 'Please input your password!' }] }
                             ]"
                             type="password">
                        <a-icon slot="prefix"
                                type="lock"
                                style="color: rgba(0,0,0,.25)" />
                    </a-input>
                </a-form-item>
                <a-form-item label="确认密码："
                             :label-col="{ span: 5 }"
                             :wrapper-col="{ span: 18 }">
                    <a-input v-decorator="[
                             'confirmpassword',
                             { rules: [{ required: true, message: 'Please input your password again!' }] }
                             ]"
                             type="password">
                        <a-icon slot="prefix"
                                type="lock"
                                style="color: rgba(0,0,0,.25)" />
                    </a-input>
                </a-form-item>
                <a-form-item label="用户昵称："
                             :label-col="{ span: 5 }"
                             :wrapper-col="{ span: 18 }">
                    <a-input v-decorator="[
                             'nickname',
                             { rules: [{ required: true, message: 'Please input your nickname!' }] }
                             ]">
                        <a-icon slot="prefix"
                                type="user"
                                style="color: rgba(0,0,0,.25)" />
                    </a-input>
                </a-form-item>
                <a-form-item label="用户年龄："
                             :label-col="{ span: 5 }"
                             :wrapper-col="{ span: 18 }">
                    <a-input v-decorator="[
                             'old',
                             { rules: [{ required: true, message: 'Please input your age!' }] }
                             ]"
                             type="number">
                        <a-icon slot="prefix"
                                type="user"
                                style="color: rgba(0,0,0,.25)" />
                    </a-input>
                </a-form-item>
                <a-form-item label="用户性别："
                             :label-col="{ span: 5 }"
                             :wrapper-col="{ span: 18 }">
                    <a-radio-group  defaultValue="0" @change ="onChange">
                        <a-radio class="radio" value="0">女</a-radio>
                        <a-radio value="1">男</a-radio>
                    </a-radio-group>
                </a-form-item>
                <a-form-item>
                    <a-button type="primary"
                              html-type="submit"
                              class="button">
                        注册
                    </a-button>
                    <a href="/login">
                        返回登录
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
            this.form = this.$form.createForm(this);
        },
        data() {
            return {
                state: "0"
            }
        },
        methods: {
            onChange(e) {
                this.state = e.target.value;
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
                    const confirmpassword = values['confirmpassword'];
                    const nickname = values['nickname'];
                    const old = values['old'];
                    if (username && password && confirmpassword && nickname && old) {
                        if (password !== confirmpassword) {
                            alert("两次密码输入不一致！");
                            return;
                        }
                        const data = {
                            'username': username,
                            'password': password,
                            'nickname': nickname,
                            'gender': Number(this.state),
                            'old': old
                        };
                        this.axios({
                            method: 'POST',
                            url: this.$store.state.host + '/users/register',
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
                                    message: "注册成功！"
                                });
                                setTimeout(() => {
                                    window.location.href = "/users/" + id.toString() + "/shelf";
                                }, 500);
                                return;
                            }
                            switch (status) {
                                case 400:
                                    alert("参数请求错误，注册失败！");
                                    break;
                                case 403:
                                    alert("用户名已存在，注册失败！");
                                    break;
                                case 500:
                                    alert("服务器连接错误，注册失败，请稍后再试！");
                                    break;
                                case 1001:
                                    alert("用户名长度过短，注册失败！");
                                    break;
                                case 1002:
                                    alert("密码长度过短，注册失败！");
                                    break;
                                case 1003:
                                    alert("用户名长度过长，注册失败！");
                                    break;
                                case 1004:
                                    alert("密码长度过长，注册失败！");
                                    break;
                                case 1005:
                                    alert("用户名格式非法，注册失败！");
                                    break;
                                case 1006:
                                    alert("密码格式非法，注册失败！");
                                    break;
                                default:
                                    alert("发生错误，注册失败！");
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
        height: 600px;
        width: 600px;
        margin: 100px auto;
    }
    #register {
        width: 400px;
        margin: 0 auto;
    }
    #register .radio {
        margin: 0 60px 0 0;
    }
    #register .button {
        width: 100%;
    }
</style>