import { createMemoryHistory, createRouter as createClientRouter, createWebHistory } from 'vue-router'
import layoutAuth from '/@src/pages/auth.vue'
import layoutApp from '/@src/pages/app.vue'
import { hasPermission } from '/@src/utils/permissions'

const routes = [
  {
    path: '/',
    name: 'login',
    component: layoutAuth,
    children: [
      {
        component: () => import('/@src/pages/auth/login.vue'),
        path: '',
        name: 'auth-login',
        props: true,
      },
    ],
  },

  {
    path: '/app',
    name: 'app',
    component: layoutApp,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        component: () => import('/@src/pages/app/index.vue'),
        path: '',
        name: 'home',
        props: true,
      },

      // ---- TOOL -------------------------------------------------------

      // ---------------------------- Department -------------------------
      {
        component: () => import('/@src/pages/tool/departments.vue'),
        path: '/tool/departments',
        name: '/tool/departments',
        props: true,
        meta: { permission: 'program departments' },
      },

      // ---------------------------- Functionaries ----------------------
      {
        component: () => import('/@src/pages/tool/functionaries/functionary.vue'),
        path: '/tool/functionary',
        name: 'tool/functionary',
        props: true,
        meta: { permission: 'program functionaries' },
      },
      {
        component: () => import('/@src/pages/tool/functionaries/functionary-create.vue'),
        path: '/tool/functionary/create',
        name: 'tool/functionary/create',
        props: true,
        meta: { permission: 'functionaries create' },
      },
      {
        component: () => import('/@src/pages/tool/functionaries/functionary-update.vue'),
        path: '/tool/functionary/update/:id',
        name: '/tool/functionary/update',
        props: true,
        meta: { permission: 'functionaries edit' },
      },

      // ----- SETTINGS --------------------------------------------------

      // ---------------------------- Rol and Permission -----------------
      {
        component: () => import('/@src/pages/setting/role/rol.vue'),
        path: '/setting/rol',
        name: 'setting/rol',
        props: true,
        meta: { permission: 'program roles' },
      },
      {
        component: () => import('/@src/pages/setting/role/rol-create.vue'),
        path: '/setting/rol/create',
        name: 'setting/rol/create',
        props: true,
        meta: { permission: 'roles create' },
      },
      {
        component: () => import('/@src/pages/setting/role/rol-update.vue'),
        path: '/setting/rol/update/:id',
        name: '/setting/rol/update',
        props: true,
        meta: { permission: 'roles edit' },
      },

      // ---------------------------- Users ------------------------------
      {
        component: () => import('/@src/pages/setting/user/user.vue'),
        path: '/setting/users',
        name: '/setting/users',
        props: true,
        meta: { permission: 'program users' },
      },
      {
        component: () => import('/@src/pages/setting/user/user-create.vue'),
        path: '/setting/users/create',
        name: 'setting/users/create',
        props: true,
        meta: { permission: 'users create' },
      },
      {
        component: () => import('/@src/pages/setting/user/user-update.vue'),
        path: '/setting/users/update/:id',
        name: '/setting/users/update',
        props: true,
        meta: { permission: 'users edit' },
      },
    ],
  },

  {
    component: () => import('/@src/pages/[...all].vue'),
    name: 'all',
    path: '/:all(.*)',
    props: true,
  },
]

export function createRouter() {
  const router = createClientRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
    scrollBehavior: (to, from, savedPosition) => {
      // Scroll to heading on click
      if (to.hash) {
        if (to.hash === '#') {
          return {
            top: 0,
            behavior: 'smooth',
          }
        }

        const el = document.querySelector(to.hash)

        // vue-router does not incorporate scroll-margin-top on its own.
        if (el) {
          const top = parseFloat(getComputedStyle(el).scrollMarginTop)
          if (el instanceof HTMLElement) {
            el.focus()
          }

          return {
            el: to.hash,
            behavior: 'smooth',
            top,
          }
        }

        return {
          el: to.hash,
          behavior: 'smooth',
        }
      }

      // Scroll to top of window
      if (savedPosition) {
        return savedPosition
      }
      else if (to.path !== from.path) {
        return { top: 0 }
      }
    },
  })
  router.beforeEach((to, from, next) => {
    const permission = to.meta.permission as string
    if (!permission || hasPermission(permission)) {
      next()
    }
    else {
      next('/error')
    }
  })

  return router
}
