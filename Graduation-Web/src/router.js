import Vue from 'vue'
import Router from 'vue-router'

import Login from './components/login.vue'
import Register from './components/register.vue'
import Userinfo from './components/users/userinfo.vue'
import Shelf from './components/users/function/shelf.vue'
import Comments from './components/users/function/comments.vue'
import Update from './components/users/function/update.vue'
import Bookinfo from './components/books/bookinfo.vue'

Vue.use(Router)

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'home',
            component: Login
        },
        {
            path: '/login',
            name: 'login',
            component: Login
        },
        {
            path: '/register',
            name: 'register',
            component: Register
        },
        {
            path: '/users/:id',
            name: 'userinfo',
            component: Userinfo,
            children: [
                {
                    path: 'shelf',
                    name: 'shelf',
                    component: Shelf
                },
                {
                    path: 'comments',
                    name: 'comments',
                    component: Comments
                },
                {
                    path: 'update',
                    name: 'update',
                    component: Update
                }
            ]
        },
        {
            path: '/books/:id',
            name: 'bookinfo',
            component: Bookinfo,
        }
    ]
})