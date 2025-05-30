import axiosInst from '@/api/axios.instance'

const API_URL = '/offers'

export const getOffers = (status = 'all', search = '', page = 1, limit = 10, profileID = '') => {
	return axiosInst
		.get(
			`${API_URL}${search ? `?search=${search}&` : '?'}page=${page}&limit=${limit}&status=${status}&profile_id=${profileID}`
		)
		.then(res => res.data)
}

export const getOfferById = (offerId, profileID = '') => {
	return axiosInst.get(`${API_URL}/${offerId}?&profile_id=${profileID}`).then(res => res.data)
}

export const moderateOffer = (id, data) =>
	axiosInst.post(`${API_URL}/${id}`, data).then(res => res.data)
