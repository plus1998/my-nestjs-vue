import { createRouter, createWebHistory } from "vue-router";

import { getStoredToken } from "@/lib/api-client";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: {
        guestOnly: true,
      },
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

router.beforeEach((to) => {
  const hasToken = Boolean(getStoredToken());

  if (to.meta.requiresAuth && !hasToken) {
    return {
      name: "login",
    };
  }

  if (to.meta.guestOnly && hasToken) {
    return {
      name: "home",
    };
  }

  return true;
});

export default router;
