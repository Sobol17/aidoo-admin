import axiosInst from '@/api/axios.instance'

const API_URL = '/promotions'

export const getPromotions = (search = '', page = 1, limit = 10, profileID = '') => {
	return axiosInst
		.get(
			`${API_URL}${search ? `?search=${search}&` : '?'}page=${page}&limit=${limit}&profile_id=${profileID}`
		)
		.then(res => res.data)
}

export const createPromotion = requestBody =>
	axiosInst.post(`${API_URL}`, requestBody).then(res => res.data)

export const updatePromotion = (taxId, requestBody) =>
	axiosInst.put(`${API_URL}/${taxId}`, requestBody).then(res => res.data)

export const deletePromotion = (taxId, profileId) =>
	axiosInst.delete(`${API_URL}/${taxId}?profile_id=${profileId}`).then(res => res.data)

export const getPromotionById = (taxId, profileID) =>
	axiosInst.get(`${API_URL}/${taxId}?profile_id=${profileID}`).then(res => res.data)
