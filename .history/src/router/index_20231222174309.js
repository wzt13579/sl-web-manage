import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'

// fix vue-router NavigationDuplicated
const VueRouterPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return VueRouterPush.call(this, location).catch(err => err);
};
const VueRouterReplace = VueRouter.prototype.replace;
VueRouter.prototype.replace = function replace(location) {
  return VueRouterReplace.call(this, location).catch(err => err);
};

// 开发环境不使用懒加载, 因为懒加载页面太多的话会造成webpack热更新太慢, 所以只有生产环境使用懒加载
const _import = require('./utils/import-' + process.env.NODE_ENV);

// 全局路由
export const globalRoutes = [
    {
      path: '/login',
      component: _import('common/Login'),
      name: 'login',
      meta: { title: '登录' }
    }
  ];

  // 存放固定的路由
export const defaultRouterList = [
    ...functionRouters,
    ...globalRoutes,
    mainRoutes
    // ...errorRoutes
  ];