import AppLayout from "@/layout/AppLayout.vue";
import { useAuthStore } from "@/stores/auth";
import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/views/Dashboard.vue";
import Accounts from "@/views/pages/admin-accounts/Accounts.vue";
import Account from "@/views/pages/admin-accounts/Account.vue";
import AccountsUser from "@/views/pages/user-accounts/AccountsUser.vue";
import AdminProfiles from "@/views/pages/admin-profiles/AdminProfiles.vue";
import UserProfiles from "@/views/pages/user-profiles/UserProfiles.vue";
import Advertising from "@/views/pages/advertising/Advertising.vue";
import Offers from "@/views/pages/offers/Offers.vue";
import Reviews from "@/views/pages/reviews/Reviews.vue";
import Profile from "@/views/pages/Profile.vue";
import Subcategory from "@/views/pages/subcategories/Subcategory.vue";
import Subcategories from "@/views/pages/subcategories/Subcategories.vue";
import Categories from "@/views/pages/subcategories/Caregories.vue";
import Login from "@/views/pages/auth/Login.vue";
import Access from "@/views/pages/auth/Access.vue";
import Error from "@/views/pages/auth/Error.vue";
import Content from "@/views/pages/content/Content.vue";
import Orders from "@/views/pages/orders/Orders.vue";
import Subs from "@/views/pages/subs/Subs.vue";
import Promocodes from "@/views/pages/promo/Promocodes.vue";
import Support from "@/views/pages/support/Support.vue";
import Complaints from "@/views/pages/complaints/Complaints.vue";
import {useProfileStore} from "@/stores/profile";
import {watch} from "vue";

const router = createRouter({
  history: createWebHistory("/aidoo-admin/"),
  // history: createWebHistory('/'),
  routes: [
    {
      path: "/",
      component: AppLayout,
      redirect: "/stats",
      meta: { roles: ['admin', 'moderator', 'support'] },
      children: [
        {
          path: "/stats",
          name: "dashboard",
          meta: { roles: ['admin', 'moderator', 'support'] },
          component: Dashboard,
        },
        {
          path: "/subscriptions",
          name: "subscriptions",
          meta: { roles: ['admin'] },
          component: Subs,
        },
        {
          path: "/admin-accounts",
          name: "admin-accounts",
          meta: { roles: ['admin'] },
          component: Accounts,
        },
        {
          path: "/admin-accounts/:id",
          name: "admin-accounts-id",
          meta: { roles: ['admin'] },
          component: Account,
        },
        {
          path: "/user-accounts",
          name: "user-accounts",
          meta: { roles: ['admin', 'moderator'] },
          component: AccountsUser,
        },
        {
          path: "/admin-profiles",
          name: "admin-profiles",
          meta: { roles: ['admin', 'moderator'] },
          component: AdminProfiles,
        },
        {
          path: "/user-profiles",
          name: "user-profiles",
          meta: { roles: ['admin', 'moderator'] },
          component: UserProfiles,
        },
        {
          path: "/advertising",
          name: "advertising",
          meta: { roles: ['admin', 'moderator'] },
          component: Advertising,
        },
        {
          path: "/offers",
          name: "offers",
          meta: { roles: ['admin', 'moderator'] },
          component: Offers,
        },
        {
          path: "/reviews",
          name: "reviews",
          meta: { roles: ['admin', 'moderator'] },
          component: Reviews,
        },
        {
          path: "/content",
          name: "content",
          meta: { roles: ['admin', 'moderator'] },
          component: Content,
        },
        {
          path: "/orders",
          name: "orders",
          meta: { roles: ['admin'] },
          component: Orders,
        },
        {
          path: "/promo",
          name: "promo",
          meta: { roles: ['admin', 'moderator', 'support'] },
          component: Promocodes,
        },
        {
          path: "/support",
          name: "support",
          meta: { roles: ['admin', 'moderator', 'support'] },
          component: Support,
        },
        {
          path: "/complaints",
          name: "complaints",
          meta: { roles: ['admin', 'moderator', 'support'] },
          component: Complaints,
        },
        {
          path: "/profile",
          name: "profile",
          meta: { roles: ['admin', 'moderator', 'support'] },
          component: Profile,
        },
        {
          path: "/categories",
          name: "categories",
          meta: { roles: ['admin', 'moderator'] },
          component: Categories,
        },
        {
          path: "/categories/:id",
          name: "category-id",
          meta: { roles: ['admin', 'moderator'] },
          component: Subcategories,
        },
        {
          path: "/categories/:id/:subcategory",
          name: "subcategory-id",
          meta: { roles: ['admin', 'moderator'] },
          component: Subcategory,
        },
      ],
    },

    {
      path: "/auth/login",
      name: "login",
      component: Login,
      meta: { roles: ['admin', 'moderator', 'support'] },
    },
    {
      path: "/auth/access",
      name: "accessDenied",
      component: Access,
    },
    {
      path: "/auth/error",
      name: "error",
      component: Error,
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const profileStore = useProfileStore();

  const isAuthenticated = !!authStore.getAccessToken();
  const routeRoles = to.meta?.roles;

  if (isAuthenticated && to.name === "login") {
    next({ name: "dashboard" });
    return;
  }

  if (!isAuthenticated && !["login", "accessDenied"].includes(to.name)) {
    next({ name: "accessDenied" });
    return;
  }

  if (isAuthenticated && !profileStore.isProfileLoaded) {
    // Ждем пока профиль загрузится
    const unwatch = watch(
      () => profileStore.isProfileLoaded,
      (loaded) => {
        if (loaded) {
          unwatch();
          checkRole();
        }
      }
    );
  } else {
    checkRole();
  }

  function checkRole() {
    if (routeRoles && !routeRoles.includes(profileStore.role)) {
      next({ name: "accessDenied" });
      return;
    }
    next();
  }
});

export default router;
