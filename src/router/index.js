import AppLayout from "@/layout/AppLayout.vue";
import { useAuthStore } from "@/stores/auth";
import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/views/Dashboard.vue";
import FormLayout from "@/views/uikit/FormLayout.vue";
import InputDoc from "@/views/uikit/InputDoc.vue";
import ButtonDoc from "@/views/uikit/ButtonDoc.vue";
import TableDoc from "@/views/uikit/TableDoc.vue";
import ListDoc from "@/views/uikit/ListDoc.vue";
import TreeDoc from "@/views/uikit/TreeDoc.vue";
import PanelsDoc from "@/views/uikit/PanelsDoc.vue";
import OverlayDoc from "@/views/uikit/OverlayDoc.vue";
import MediaDoc from "@/views/uikit/MediaDoc.vue";
import MessagesDoc from "@/views/uikit/MessagesDoc.vue";
import FileDoc from "@/views/uikit/FileDoc.vue";
import MenuDoc from "@/views/uikit/MenuDoc.vue";
import ChartDoc from "@/views/uikit/ChartDoc.vue";
import MiscDoc from "@/views/uikit/MiscDoc.vue";
import TimelineDoc from "@/views/uikit/TimelineDoc.vue";
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
import Documentation from "@/views/pages/Documentation.vue";
import Login from "@/views/pages/auth/Login.vue";
import Access from "@/views/pages/auth/Access.vue";
import Error from "@/views/pages/auth/Error.vue";
import Content from "@/views/pages/content/Content.vue";
import Orders from "@/views/pages/orders/Orders.vue";
import Subs from "@/views/pages/subs/Subs.vue";
import Promocodes from "@/views/pages/promo/Promocodes.vue";
import Support from "@/views/pages/support/Support.vue";
import Complaints from "@/views/pages/complaints/Complaints.vue";

const router = createRouter({
  history: createWebHistory("/aidoo-admin/"),
  // history: createWebHistory('/'),
  routes: [
    {
      path: "/",
      component: AppLayout,
      redirect: "/stats",
      children: [
        {
          path: "/stats",
          name: "dashboard",
          component: Dashboard,
        },
        {
          path: "/subscriptions",
          name: "subscriptions",
          component: Subs,
        },
        {
          path: "/uikit/formlayout",
          name: "formlayout",
          component: FormLayout,
        },
        {
          path: "/uikit/input",
          name: "input",
          component: InputDoc,
        },
        {
          path: "/uikit/button",
          name: "button",
          component: ButtonDoc,
        },
        {
          path: "/uikit/table",
          name: "table",
          component: TableDoc,
        },
        {
          path: "/uikit/list",
          name: "list",
          component: ListDoc,
        },
        {
          path: "/uikit/tree",
          name: "tree",
          component: TreeDoc,
        },
        {
          path: "/uikit/panel",
          name: "panel",
          component: PanelsDoc,
        },

        {
          path: "/uikit/overlay",
          name: "overlay",
          component: OverlayDoc,
        },
        {
          path: "/uikit/media",
          name: "media",
          component: MediaDoc,
        },
        {
          path: "/uikit/message",
          name: "message",
          component: MessagesDoc,
        },
        {
          path: "/uikit/file",
          name: "file",
          component: FileDoc,
        },
        {
          path: "/uikit/menu",
          name: "menu",
          component: MenuDoc,
        },
        {
          path: "/uikit/charts",
          name: "charts",
          component: ChartDoc,
        },
        {
          path: "/uikit/misc",
          name: "misc",
          component: MiscDoc,
        },
        {
          path: "/uikit/timeline",
          name: "timeline",
          component: TimelineDoc,
        },
        {
          path: "/admin-accounts",
          name: "admin-accounts",
          component: Accounts,
        },
        {
          path: "/admin-accounts/:id",
          name: "admin-accounts-id",
          component: Account,
        },
        {
          path: "/user-accounts",
          name: "user-accounts",
          component: AccountsUser,
        },
        {
          path: "/admin-profiles",
          name: "admin-profiles",
          component: AdminProfiles,
        },
        {
          path: "/user-profiles",
          name: "user-profiles",
          component: UserProfiles,
        },
        {
          path: "/advertising",
          name: "advertising",
          component: Advertising,
        },
        {
          path: "/offers",
          name: "offers",
          component: Offers,
        },
        {
          path: "/reviews",
          name: "reviews",
          component: Reviews,
        },
        {
          path: "/content",
          name: "content",
          component: Content,
        },
        {
          path: "/orders",
          name: "orders",
          component: Orders,
        },
        {
          path: "/promo",
          name: "promo",
          component: Promocodes,
        },
        {
          path: "/support",
          name: "support",
          component: Support,
        },
        {
          path: "/complaints",
          name: "complaints",
          component: Complaints,
        },
        {
          path: "/profile",
          name: "profile",
          component: Profile,
        },
        {
          path: "/documentation",
          name: "documentation",
          component: Documentation,
        },
        {
          path: "/categories",
          name: "categories",
          component: Categories,
        },
        {
          path: "/categories/:id",
          name: "category-id",
          component: Subcategories,
        },
        {
          path: "/categories/:id/:subcategory",
          name: "subcategory-id",
          component: Subcategory,
        },
      ],
    },

    {
      path: "/auth/login",
      name: "login",
      component: Login,
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
