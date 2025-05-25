import AppLayout from '@/layout/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import Dashboard from '@/views/Dashboard.vue'
import Account from '@/views/pages/admin-accounts/Account.vue'
import Accounts from '@/views/pages/admin-accounts/Accounts.vue'
import AdminProfiles from '@/views/pages/admin-profiles/AdminProfiles.vue'
import Advertising from '@/views/pages/advertising/Advertising.vue'
import Access from '@/views/pages/auth/Access.vue'
import Error from '@/views/pages/auth/Error.vue'
import Login from '@/views/pages/auth/Login.vue'
import CityComponent from '@/views/pages/cities/CityComponent.vue'
import CityTable from '@/views/pages/cities/CityTable.vue'
import Complaints from '@/views/pages/complaints/Complaints.vue'
import Content from '@/views/pages/content/Content.vue'
import FaqComponent from '@/views/pages/faq/FaqComponent.vue'
import FaqTable from '@/views/pages/faq/FaqTable.vue'
import Offers from '@/views/pages/offers/Offers.vue'
import OfferView from '@/views/pages/offers/OfferView.vue'
import Orders from '@/views/pages/orders/Orders.vue'
import Profile from '@/views/pages/Profile.vue'
import Promocodes from '@/views/pages/promo/Promocodes.vue'
import Reviews from '@/views/pages/reviews/Reviews.vue'
import Categories from '@/views/pages/subcategories/Caregories.vue'
import Subcategories from '@/views/pages/subcategories/Subcategories.vue'
import Subcategory from '@/views/pages/subcategories/Subcategory.vue'
import Subs from '@/views/pages/subs/Subs.vue'
import Support from '@/views/pages/support/Support.vue'
import TaxTable from '@/views/pages/taxes/TaxTable.vue'
import AccountsUser from '@/views/pages/user-accounts/AccountsUser.vue'
import UserProfile from '@/views/pages/user-profiles/UserProfile.vue'
import UserProfiles from '@/views/pages/user-profiles/UserProfiles.vue'
import ViolationsTable from '@/views/pages/violations/ViolationsTable.vue'
import { watch } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
	history: createWebHistory('/aidoo-admin/'),
	// history: createWebHistory('/'),
	routes: [
		{
			path: '/',
			component: AppLayout,
			redirect: '/stats',
			meta: { roles: ['admin', 'moderator', 'support'] },
			children: [
				{
					path: '/stats',
					name: 'dashboard',
					meta: { roles: ['admin', 'moderator', 'support'] },
					component: Dashboard,
				},
				{
					path: '/subscriptions',
					name: 'subscriptions',
					meta: { roles: ['admin'] },
					component: Subs,
				},
				{
					path: '/taxes',
					name: 'taxes',
					meta: { roles: ['admin'] },
					component: TaxTable,
				},
				{
					path: '/admin-accounts',
					name: 'admin-accounts',
					meta: { roles: ['admin'] },
					component: Accounts,
				},
				{
					path: '/admin-accounts/:id',
					name: 'admin-accounts-id',
					meta: { roles: ['admin'] },
					component: Account,
				},
				{
					path: '/user-accounts',
					name: 'user-accounts',
					meta: { roles: ['admin', 'moderator'] },
					component: AccountsUser,
				},
				{
					path: '/admin-profiles',
					name: 'admin-profiles',
					meta: { roles: ['admin', 'moderator'] },
					component: AdminProfiles,
				},
				{
					path: '/user-profiles',
					name: 'user-profiles',
					meta: { roles: ['admin', 'moderator'] },
					component: UserProfiles,
				},
				{
					path: '/user-profiles/:id',
					name: 'user-profile',
					meta: { roles: ['admin', 'moderator'] },
					component: UserProfile,
				},
				{
					path: '/advertising',
					name: 'advertising',
					meta: { roles: ['admin', 'moderator'] },
					component: Advertising,
				},
				{
					path: '/offers',
					name: 'offers',
					meta: { roles: ['admin', 'moderator'] },
					component: Offers,
				},
				{
					path: '/offers/:id',
					name: 'offers-id',
					meta: { roles: ['admin', 'moderator'] },
					component: OfferView,
				},
				{
					path: '/reviews',
					name: 'reviews',
					meta: { roles: ['admin', 'moderator'] },
					component: Reviews,
				},
				{
					path: '/content',
					name: 'content',
					meta: { roles: ['admin', 'moderator'] },
					component: Content,
				},
				{
					path: '/orders',
					name: 'orders',
					meta: { roles: ['admin'] },
					component: Orders,
				},
				{
					path: '/promo',
					name: 'promo',
					meta: { roles: ['admin', 'moderator', 'support'] },
					component: Promocodes,
				},
				{
					path: '/support',
					name: 'support',
					meta: { roles: ['admin', 'moderator', 'support'] },
					component: Support,
				},
				{
					path: '/complaints',
					name: 'complaints',
					meta: { roles: ['admin', 'moderator', 'support'] },
					component: Complaints,
				},
				{
					path: '/profile',
					name: 'profile',
					meta: { roles: ['admin', 'moderator'] },
					component: Profile,
				},
				{
					path: '/faq',
					name: 'faq',
					meta: { roles: ['admin', 'moderator'] },
					component: FaqTable,
				},
				{
					path: '/faq/:id',
					name: 'faq-id',
					meta: { roles: ['admin', 'moderator'] },
					component: FaqComponent,
				},
				{
					path: '/cities',
					name: 'cities',
					meta: { roles: ['admin', 'moderator'] },
					component: CityTable,
				},
				{
					path: '/cities/:id',
					name: 'cities-id',
					meta: { roles: ['admin', 'moderator'] },
					component: CityComponent,
				},
				{
					path: '/violations',
					name: 'violations',
					meta: { roles: ['admin', 'moderator', 'support'] },
					component: ViolationsTable,
				},
				{
					path: '/categories',
					name: 'categories',
					meta: { roles: ['admin', 'moderator'] },
					component: Categories,
				},
				{
					path: '/categories/:id',
					name: 'category-id',
					meta: { roles: ['admin', 'moderator'] },
					component: Subcategories,
				},
				{
					path: '/categories/:id/:subcategory',
					name: 'subcategory-id',
					meta: { roles: ['admin', 'moderator'] },
					component: Subcategory,
				},
			],
		},

		{
			path: '/auth/login',
			name: 'login',
			component: Login,
		},
		{
			path: '/auth/access',
			name: 'accessDenied',
			component: Access,
		},
		{
			path: '/auth/error',
			name: 'error',
			component: Error,
		},
	],
})

router.beforeEach((to, from, next) => {
	const authStore = useAuthStore()
	const profileStore = useProfileStore()

	const isAuthenticated = !!authStore.getAccessToken()
	const routeRoles = to.meta?.roles

	if (isAuthenticated && to.name === 'login') {
		next({ name: 'dashboard' })
		return
	}

	if (!isAuthenticated && !['login', 'accessDenied', 'error'].includes(to.name)) {
		next({ name: 'accessDenied' })
		return
	}

	if (isAuthenticated && !profileStore.isProfileLoaded) {
		const unwatch = watch(
			() => profileStore.isProfileLoaded,
			loaded => {
				if (loaded) {
					unwatch()
					checkRole()
				}
			}
		)
	} else {
		checkRole()
	}

	function checkRole() {
		if (routeRoles && !routeRoles.includes(profileStore.role)) {
			next({ name: 'accessDenied' })
			return
		}
		next()
	}
})

export default router
