import { createRouter, createWebHistory } from "vue-router";

import { useAuthSession } from "@/composables/useAuthSession";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";

const { ensureCurrentUser } = useAuthSession();

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

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth && !to.meta.guestOnly) {
    return true;
  }

  const user = await ensureCurrentUser();

  if (to.meta.requiresAuth && !user) {
    return {
      name: "login",
    };
  }

  if (to.meta.guestOnly && user) {
    return {
      name: "home",
    };
  }

  return true;
});

export default router;
