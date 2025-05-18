import Vue from 'vue'
import Router from 'vue-router'
/* Layout */
import Layout from '@/layout'

Vue.use(Router)

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'el-icon-s-home' }
    }]
  },
  {
    path: '/auth',
    component: Layout,
    redirect: 'noRedirect',
    name: 'Auth',
    meta: { title: '组织架构', icon: 'sitemap' },
    children: [
      {
        path: 'department',
        name: 'DepartmentList',
        component: () => import('@/views/auth/department'),
        meta: { title: '部门管理', icon: 'building-user' }
      },
      {
        path: 'department/:department_ids',
        name: 'DepartmentIds',
        component: () => import('@/views/auth/department'),
        hidden: true
      },
      {
        path: 'roles',
        name: 'RoleList',
        component: () => import('@/views/auth/role'),
        meta: { title: '角色管理', icon: 'users' }
      },
      {
        path: 'users',
        name: 'UserList',
        component: () => import('@/views/auth/user'),
        meta: { title: '用户管理', icon: 'user' }
      },
      {
        path: 'users/:user_id',
        name: 'UserSearch',
        component: () => import('@/views/auth/user'),
        hidden: true
      },
      {
        path: 'privileges',
        name: 'PrivilegeList',
        component: () => import('@/views/auth/privilege'),
        meta: { title: '权限管理', icon: 'user-shield' }
      },
      {
        path: 'role/modify',
        name: 'RoleModify',
        hidden: true,
        component: () => import('@/views/auth/role')
      },
      {
        path: 'privilege/modify',
        name: 'PrivilegeModify',
        hidden: true,
        component: () => import('@/views/auth/privilege')
      }
    ]
  },
  {
    path: '/asset',
    component: Layout,
    redirect: 'noRedirect',
    name: 'Asset',
    meta: { title: '资源配置', icon: 'kaaba' },
    children: [
      {
        path: 'tree',
        name: 'tree',
        component: () => import('@/views/asset/tree'),
        meta: { title: '服务树', icon: 'folder-tree' }
      },
      {
        path: 'idc',
        name: 'idc',
        component: () => import('@/views/asset/idc'),
        meta: { title: 'IDC池', icon: 'el-icon-office-building' }
      },
      {
        path: 'pool',
        name: 'Pool',
        component: () => import('@/views/asset/pool'),
        meta: { title: '资源池', icon: 'el-icon-coin' }
      },
      {
        path: 'pool/:asset_id',
        name: 'PoolSearch',
        component: () => import('@/views/asset/pool'),
        hidden: true
      },
      {
        path: 'group',
        name: 'group',
        component: () => import('@/views/asset/group'),
        meta: { title: '资源组', icon: 'el-icon-files' }
      },
      {
        path: 'group/:group_id',
        name: 'groupSearch',
        component: () => import('@/views/asset/group'),
        hidden: true
      },
      {
        path: 'host',
        name: 'Host',
        component: () => import('@/views/asset/host'),
        meta: { title: '服务器', icon: 'server' }
      },
      {
        path: 'switch',
        name: 'switch',
        component: () => import('@/views/asset/switches'),
        meta: { title: '交换机', icon: 'shuffle' }
      },
      {
        path: 'switch/:switch_id',
        name: 'SwitchSearch',
        component: () => import('@/views/asset/switches'),
        hidden: true
      },
      {
        path: 'switch/port/:switch_id',
        name: 'switchPort',
        component: () => import('@/views/asset/switch_port'),
        hidden: true
      },
      {
        path: 'host/:host_id',
        name: 'HostSearch',
        component: () => import('@/views/asset/host'),
        hidden: true
      },
      {
        path: 'host/:asset_group_id',
        name: 'GroupHostSearch',
        component: () => import('@/views/asset/host'),
        hidden: true
      },
      {
        path: 'host/detail/:host_id',
        name: 'hostDetail',
        component: () => import('@/views/asset/host_detail'),
        hidden: true
      },
      {
        path: 'ssh_key',
        name: 'ssh_key',
        component: () => import('@/views/asset/ssh_key'),
        meta: { title: 'SSH密钥', icon: 'el-icon-bank-card' }
      },
      {
        path: 'webShell/:asset_type/:asset_id/:asset_name',
        name: 'AssetWebShell',
        component: () => import('@/views/asset/webShell.vue'),
        hidden: true
      }
    ]
  },
  {
    path: '/monitor',
    component: Layout,
    redirect: 'noRedirect',
    name: 'monitor',
    meta: { title: '智能监控', icon: 'el-icon-monitor' },
    children: [
      {
        path: 'rule',
        name: 'rule_list',
        component: () => import('@/views/monitor/rules'),
        meta: { title: '监控规则', icon: 'el-icon-s-unfold' }
      },
      {
        path: 'rule/:type/:id',
        name: 'search_rule_id',
        component: () => import('@/views/monitor/rules'),
        hidden: true
      },
      {
        path: 'alarm',
        name: 'alarm_history',
        component: () => import('@/views/monitor/alarm_history'),
        meta: { title: '触发报警', icon: 'list-ul' }
      },
      {
        path: 'alarm/history/:type/:id',
        name: 'alarm_history_id',
        component: () => import('@/views/monitor/alarm_history'),
        hidden: true
      },
      {
        path: 'send',
        name: 'alarm_send',
        component: () => import('@/views/monitor/alarm_send'),
        meta: { title: '报警通知', icon: 'el-icon-bell' }
      },
      {
        path: 'alarm/send/:type/:id',
        name: 'alarm_send_id',
        component: () => import('@/views/monitor/alarm_send'),
        hidden: true
      }
    ]
  },
  {
    path: '/cloud',
    component: Layout,
    name: 'Cloud',
    redirect: 'noRedirect',
    meta: { title: '多云管理', icon: 'cloud' },
    children: [
      {
        path: 'cloud_key',
        name: 'cloud_key',
        component: () => import('@/views/cloud/key'),
        meta: { title: '密钥管理', icon: 'key' }
      },
      {
        path: 'cloud_hosts',
        name: 'cloud_hosts',
        component: () => import('@/views/cloud/host'),
        meta: { title: '主机管理', icon: 'server' }
      },
      {
        path: 'cloud_oss',
        name: 'cloud_oss',
        component: () => import('@/views/cloud/oss'),
        meta: { title: 'OSS管理', icon: 'coins' }
      }
    ]
  },
  {
    path: '/k8s',
    component: Layout,
    name: 'k8s',
    redirect: 'noRedirect',
    meta: { title: 'K8S集群', icon: 'windows' },
    children: [
      {
        path: 'overview',
        name: 'overview',
        component: () => import('@/views/k8s/overview'),
        meta: { title: '集群概览', icon: 'el-icon-data-line' }
      },
      {
        path: 'cluster',
        name: 'cluster',
        component: () => import('@/views/k8s/cluster'),
        meta: { title: '集群列表', icon: 'el-icon-files' }
      },
      {
        path: 'nodes/:k8s_id/:k8s_name',
        name: 'nodes',
        component: () => import('@/views/k8s/nodes'),
        hidden: true
      },
      {
        path: 'node/detail/:k8s_id/:k8s_name/:node_name',
        name: 'nodeDetail',
        component: () => import('@/views/k8s/nodeDetail'),
        hidden: true
      },
      {
        path: 'namespace/:k8s_id/:k8s_name',
        name: 'namespace',
        component: () => import('@/views/k8s/namespace'),
        hidden: true
      },
      {
        path: 'application/:k8s_id/:k8s_name/:namespace',
        name: 'application',
        component: () => import('@/views/k8s/application.vue'),
        hidden: true
      },
      {
        path: 'application/:k8s_id/:k8s_name/:namespace/deployment/:name',
        name: 'deployment',
        component: () => import('@/views/k8s/deployment.vue'),
        hidden: true
      },
      {
        path: 'application/:k8s_id/:k8s_name/:namespace/daemonSet/:name',
        name: 'daemonSet',
        component: () => import('@/views/k8s/daemonSet.vue'),
        hidden: true
      },
      {
        path: 'application/:k8s_id/:k8s_name/:namespace/statefulSet/:name',
        name: 'statefulSet',
        component: () => import('@/views/k8s/statefulSet.vue'),
        hidden: true
      },
      {
        path: 'webShell/:k8s_id/:namespace/:pod/:container/:subResource',
        name: 'k8sWebShell',
        component: () => import('@/views/k8s/webShell.vue'),
        hidden: true
      }
    ]
  },
  {
    path: '/job',
    component: Layout,
    redirect: 'noRedirect',
    name: 'job',
    meta: { title: '运维作业', icon: 'el-icon-s-open' },
    children: [
      {
        path: 'job_overview',
        name: 'job_overview',
        component: () => import('@/views/job/overview'),
        meta: { title: '作业列表', icon: 'el-icon-s-fold' }
      },
      {
        path: 'job_exec/:job_id',
        name: 'job_exec_id',
        component: () => import('@/views/job/exec'),
        hidden: true
      },
      {
        path: 'job_file/:job_id',
        name: 'job_file_id',
        component: () => import('@/views/job/file'),
        hidden: true
      },
      {
        path: 'job_script',
        name: 'job_script',
        component: () => import('@/views/job/script'),
        meta: { title: '脚本管理', icon: 'el-icon-c-scale-to-original' }
      },
      {
        path: 'job_script/:script_ids',
        name: 'job_script_search',
        component: () => import('@/views/job/script'),
        hidden: true
      },
      {
        path: 'job_script_run/:job_id',
        name: 'job_script_run_id',
        component: () => import('@/views/job/run'),
        hidden: true
      }
    ]
  },
  {
    path: '/work_order',
    component: Layout,
    redirect: 'noRedirect',
    name: 'work_order',
    meta: { title: '运维工单', icon: 'el-icon-s-operation' },
    children: [
      {
        path: 'work_order_list',
        name: 'work_order_list',
        component: () => import('@/views/work_order/work_order'),
        meta: { title: '我的工单', icon: 'list' }
      },
      {
        path: 'work_order_approve',
        name: 'work_order_approve',
        component: () => import('@/views/work_order/approve'),
        meta: { title: '工单审批', icon: 'el-icon-s-check' }
      },
      {
        path: 'work_order_flow',
        name: 'work_order_flow',
        component: () => import('@/views/work_order/flow'),
        meta: { title: '工单流程', icon: 'el-icon-c-scale-to-original' }
      }
    ]
  },
  {
    path: '/platform',
    component: Layout,
    redirect: 'noRedirect',
    name: 'platform',
    meta: { title: '平台管理', icon: 'map' },
    children: [
      {
        path: 'agent_config',
        name: 'agent_config',
        component: () => import('@/views/platform/agent_config.vue'),
        meta: { title: 'Agent配置', icon: 'el-icon-s-grid' }
      },
      {
        path: 'agent_safe',
        name: 'agent_safe',
        component: () => import('@/views/platform/agent_safe.vue'),
        meta: { title: 'Agent安全', icon: 'magento' }
      }
    ]
  },
  {
    path: '/platform_audit',
    component: Layout,
    redirect: 'noRedirect',
    name: 'platform_audit',
    meta: { title: '安全审计', icon: 'el-icon-coordinate' },
    children: [
      {
        path: 'msg_list',
        name: 'MsgList',
        component: () => import('@/views/msg/msg'),
        meta: { title: '平台消息', icon: 'el-icon-message' }
      },
      {
        path: 'msg_list/:status',
        name: 'msgUnread',
        component: () => import('@/views/msg/msg'),
        hidden: true
      },
      {
        path: 'audit_list',
        name: 'audit_list',
        component: () => import('@/views/auth/audit'),
        meta: { title: '操作记录', icon: 'el-icon-warning-outline' }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
