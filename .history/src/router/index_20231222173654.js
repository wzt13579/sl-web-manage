/**
 * @Author Young
 * @Date 2023/3/20 11:14
 * @Description
 */
import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store';
import { clearLoginInfo } from '@/utils';
import { fnCurrentRouteType, fnAddDynamicMenuRoutes } from '@/router/modules/utils';

import componentsRouters from './modules/components';
import functionRouters from './modules/function';
import instance from '@/utils/request';
import common from '@/utils/tools/common';

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

// eslint-disable-next-line no-unused-vars
const errorRoutes = [
  {
    path: '/404',
    component: _import('common/404'),
    name: '404',
    meta: { title: '404', hidden: true }
  },
  {
    path: '*',
    redirect: '/404',
    meta: { hidden: true }
  }
];

export const mainRoutes = {
  path: '/',
  // eslint-disable-next-line
  component: () => import('@/layouts/index'),
  redirect: '/home',
  meta: { title: '主入口整体布局' },
  children: [
    {
      path: '/home',
      name: 'home',
      component: _import('common/Home'),
      meta: { title: '首页', id: 0 },
      title: '首页'
    },
    ...componentsRouters
  ],
  async beforeEnter(to, from, next) {
    let accessToken = Vue.cookie.get('token') || sessionStorage.getItem('token') || store.getters['user/accessToken'];
    if (!accessToken && !/\S/.test(accessToken)) {
      await store.dispatch('user/logout');
      clearLoginInfo();
      next({ name: 'Login' });
    }
    next();
  }
};

// 存放固定的路由
export const defaultRouterList = [
  ...functionRouters,
  ...globalRoutes,
  mainRoutes
  // ...errorRoutes
];

const createRouter = () =>
  new VueRouter({
    mode: 'hash',
    routes: defaultRouterList,
    isAddDynamicMenuRoutes: false, // 是否已经添加动态(菜单)路由
    scrollBehavior() {
      return {};
    }
  });

const router = createRouter();

// 权限校验，根据权限分配路由
router.beforeEach(async (to, from, next) => {
  // debugger;
  // 添加动态(菜单)路由
  // 1. 已经添加 or 全局路由，直接访问
  // 2. 获取菜单列表，添加并保存本地存储
  if (router.options.isAddDynamicMenuRoutes || fnCurrentRouteType(to, globalRoutes) === 'global') {
    next();
  } else {
    // console.log('from: ', from);
    // console.log('to: ', to);
    instance({
      url: '/web/menuManage/nav',
      //   url: '/web/menuManage/nav',
      //   url: '/web/menu/nav',
      method: 'post',
      isRouterInit: from.fullPath === '/'
    })
      .then(async ({ data }) => {
        if (data) {
          fnAddDynamicMenuRoutes(data.menu);
          router.options.isAddDynamicMenuRoutes = true;
          await store.dispatch('user/setMenuList', data.menu || []);
          //   await store.dispatch('user/setPermissions', data.permissions || []);
          sessionStorage.setItem('menuList', JSON.stringify(data.menu || '[]'));
          //   sessionStorage.setItem('permissions', JSON.stringify(data.permissions || '[]'));
          let adminId = sessionStorage.getItem('adminId');
          let localPermissionArr = [
            'group:batteryModel:list',
            'group:batteryModel:save',
            'group:batteryModel:remove',
            'group:batteryModel:update',
            'group:equipmentSupplier:list',
            'group:equipmentSupplier:save',
            'group:equipmentSupplier:remove',
            'group:equipmentSupplier:update'
          ];
          if (adminId == 114) {
            let networkPermissionArr = !common._isEmpty(data.permissions) ? data.permissions : [];
            let targetPermissionList = networkPermissionArr.concat(localPermissionArr);
            await store.dispatch('user/setPermissions', targetPermissionList || []);
            sessionStorage.setItem('permissions', JSON.stringify(targetPermissionList || '[]'));
          } else {
            await store.dispatch('user/setPermissions', data.permissions || []);
            sessionStorage.setItem('permissions', JSON.stringify(data.permissions || '[]'));
          }
          if (to.fullPath === from.fullPath) {
            next();
          } else {
            next({ ...to, replace: true });
          }
        } else {
          store.commit('user/setMenuList', '[]');
          store.commit('user/setPermissions', '[]');
          sessionStorage.setItem('menuList', '[]');
          sessionStorage.setItem('permissions', '[]');
          next();
        }
      })
      .catch(error => {
        console.log(`%c${error} 请求菜单列表和权限失败，跳转至登录页！！`, 'color:blue');
        next('/login');
        router.push({ name: 'login' });
      });
  }
});

router.afterEach((to, from) => {
  const {
    path,
    meta: { title, id },
    name
  } = to;
  let query = to.query;
  let params = to.params;
  let fullPath = to.fullPath;
  if (to.name === from.name) {
    query = from.query;
    params = from.params;
    fullPath = from.fullPath;
  }
  store.commit('tabRouter/appendTabRouterList', {
    fullPath,
    path,
    title,
    id,
    name,
    query,
    params,
    isAlive: true,
    isHome: name === 'home'
  });
});

export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router
}

export default router;
