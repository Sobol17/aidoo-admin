import AppLayout from "@/layout/AppLayout.vue";
import { useAuthStore } from "@/stores/auth";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(
    process.env.NODE_ENV === "production" ? "/aidoo-admin/" : "/",
  ),
  routes: [
    {
      path: "/",
      component: AppLayout,
      children: [
        {
          path: "/",
          name: "dashboard",
          component: () => import("@/views/Dashboard.vue"),
        },
        {
          path: "/uikit/formlayout",
          name: "formlayout",
          component: () => import("@/views/uikit/FormLayout.vue"),
        },
        {
          path: "/uikit/input",
          name: "input",
          component: () => import("@/views/uikit/InputDoc.vue"),
        },
        {
          path: "/uikit/button",
          name: "button",
          component: () => import("@/views/uikit/ButtonDoc.vue"),
        },
        {
          path: "/uikit/table",
          name: "table",
          component: () => import("@/views/uikit/TableDoc.vue"),
        },
        {
          path: "/uikit/list",
          name: "list",
          component: () => import("@/views/uikit/ListDoc.vue"),
        },
        {
          path: "/uikit/tree",
          name: "tree",
          component: () => import("@/views/uikit/TreeDoc.vue"),
        },
        {
          path: "/uikit/panel",
          name: "panel",
          component: () => import("@/views/uikit/PanelsDoc.vue"),
        },

        {
          path: "/uikit/overlay",
          name: "overlay",
          component: () => import("@/views/uikit/OverlayDoc.vue"),
        },
        {
          path: "/uikit/media",
          name: "media",
          component: () => import("@/views/uikit/MediaDoc.vue"),
        },
        {
          path: "/uikit/message",
          name: "message",
          component: () => import("@/views/uikit/MessagesDoc.vue"),
        },
        {
          path: "/uikit/file",
          name: "file",
          component: () => import("@/views/uikit/FileDoc.vue"),
        },
        {
          path: "/uikit/menu",
          name: "menu",
          component: () => import("@/views/uikit/MenuDoc.vue"),
        },
        {
          path: "/uikit/charts",
          name: "charts",
          component: () => import("@/views/uikit/ChartDoc.vue"),
        },
        {
          path: "/uikit/misc",
          name: "misc",
          component: () => import("@/views/uikit/MiscDoc.vue"),
        },
        {
          path: "/uikit/timeline",
          name: "timeline",
          component: () => import("@/views/uikit/TimelineDoc.vue"),
        },
        {
          path: "/admin-accounts",
          name: "admin-accounts",
          component: () => import("@/views/pages/admin-accounts/Accounts.vue"),
        },
        {
          path: "/admin-accounts/:id",
          name: "admin-accounts-id",
          component: () => import("@/views/pages/admin-accounts/Account.vue"),
        },
        {
          path: "/user-accounts",
          name: "user-accounts",
          component: () =>
            import("@/views/pages/user-accounts/AccountsUser.vue"),
        },
        {
          path: "/admin-profiles",
          name: "admin-profiles",
          component: () =>
            import("@/views/pages/admin-profiles/AdminProfiles.vue"),
        },
        {
          path: "/user-profiles",
          name: "user-profiles",
          component: () =>
            import("@/views/pages/user-profiles/UserProfiles.vue"),
        },
        {
          path: "/advertising",
          name: "advertising",
          component: () => import("@/views/pages/advertising/Advertising.vue"),
        },
        {
          path: "/profile",
          name: "profile",
          component: () => import("@/views/pages/Profile.vue"),
        },
        {
          path: "/documentation",
          name: "documentation",
          component: () => import("@/views/pages/Documentation.vue"),
        },
      ],
    },

    {
      path: "/auth/login",
      name: "login",
      component: () => import("@/views/pages/auth/Login.vue"),
    },
    {
      path: "/auth/access",
      name: "accessDenied",
      component: () => import("@/views/pages/auth/Access.vue"),
    },
    {
      path: "/auth/error",
      name: "error",
      component: () => import("@/views/pages/auth/Error.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (authStore.getAccessToken() && to.name === "login") {
    next({ name: "dashboard" });
  }
  if (
    !authStore.getAccessToken() &&
    !["login", "accessDenied"].includes(to.name)
  ) {
    next({ name: "accessDenied" });
  } else {
    next();
  }
});

export default router;
