<template>
    <a-layout id="layout">
        <a-card id='card' title="修改用户信息">
            <a-form id="update"
                    :form="form"
                    @submit="handleSubmit">
                <a-form-item label="用户昵称："
                             :label-col="{ span: 5 }"
                             :wrapper-col="{ span: 18 }">
                    <a-input v-decorator="['nickname',
                             { initialValue: this.nickname
                             }]">
                        <a-icon slot="prefix"
                                type="user"
                                style="color: rgba(0,0,0,.25)" />
                    </a-input>
                </a-form-item>
                <a-form-item label="用户年龄："
                             :label-col="{ span: 5 }"
                             :wrapper-col="{ span: 18 }">
                    <a-input v-decorator="['old',
                             { initialValue: this.old
                             }]">
                             type="number">
                        <a-icon slot="prefix"
                                type="user"
                                style="color: rgba(0,0,0,.25)" />
                    </a-input>
                </a-form-item>
                <a-form-item label="用户性别："
                             :label-col="{ span: 5 }"
                             :wrapper-col="{ span: 18 }">
                    <a-radio-group v-model=this.gender @change="onChange">
                        <a-radio class="radio" value="0">女</a-radio>
                        <a-radio value="1">男</a-radio>
                    </a-radio-group>
                </a-form-item>
                <a-form-item>
                    <a-button type="primary"
                              html-type="submit"
                              class="button">
                        确认修改
                    </a-button>
                </a-form-item>
            </a-form>
        </a-card>
    </a-layout>
</template>

<script>
    import qs from 'qs';

    export default {
        created() {
            this.form = this.$form.createForm(this);
            this.getuserinfo();
        },
        data() {
            return {
                nickname: "",
                gender: "0",
                old: 0
            }
        },
        methods: {
            onChange(e) {
                this.gender = e.target.value;
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
                        _this.gender = res.data.data[0].gender ? "1" : "0";
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
            },
            handleSubmit(e) {
                e.preventDefault();
                let _this = this;
                this.form.validateFields((err, values) => {
                    if (err) {
                        alert(err);
                        return;
                    }
                    const nickname = values['nickname'];
                    const old = values['old'];
                    if (nickname && old) {
                        const updatedata = {
                            'nickname': nickname,
                            'gender': this.gender,
                            'old': old
                        };
                        this.axios({
                            method: 'POST',
                            url: this.$store.state.host + '/users/' + this.$store.state.userid,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                                'Authorization': window.localStorage.getItem('token')
                            },
                            data: qs.stringify(updatedata)
                        }).then(function (res) {
                            let status = res.data.status;
                            if (status == 200) {
                                _this.$notification.open({
                                    message: "用户信息修改成功！"
                                });
                                setTimeout(() => {
                                    location.reload(true); 
                                }, 500);
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
        z-index: -2;
        width: 100%;
        height: 100%;
        padding: 144px 30px 10px 150px;
        background-color: rgba(0, 0, 0, .25);
    }
    #card {
        text-align: center;
        border-radius: 50px;
        background: rgb(255, 255, 255);
        height: 400px;
        width: 600px;
        margin: 0 auto;
    }
    #update {
        width: 400px;
        margin: 0 auto;
    }
    #update .radio {
        margin: 0 60px 0 0;
    }
    #update .button {
        width: 100%;
    }
</style>