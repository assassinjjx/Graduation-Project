import Vue from 'vue';
import Vuex from 'vuex';
import VuexAlong from 'vuex-along';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        checkstatus: false,
        userid: 0,
        loginstatus: true,
        selectedkey: '0',
        userfunction: '0',
        host: 'http://localhost:3000'
    },
    mutations: {
        check(state) {
            state.checkstatus = !state.checkstatus;
        },
        addlogin(state, id) {
            state.userid = id;
            state.loginstatus = false;
            state.selectedkey = '1';
            state.userfunction = '1';
        },
        deletelogin(state) {
            state.userid = 0;
            state.loginstatus = true;
            state.selectedkey = '0';
            state.userfunction = '0';
        },
        select(state, key) {
            state.selectedkey = key;
        },
        selectfunc(state, key) {
            state.userfunction = key;
        }
    },
    plugins: [VuexAlong()]
});