import axiosInst from '@/api/axios.instance'

const API_URL = '/faq'

export const getFaq = (search = '', page = 1, limit = 10, profileID = '') => {
	return axiosInst
		.get(
			`${API_URL}${search ? `?search=${search}&` : '?'}page=${page}&limit=${limit}&profile_id=${profileID}`
		)
		.then(res => res.data)
}

export const createFaq = requestBody =>
	axiosInst.post(`${API_URL}`, requestBody).then(res => res.data)

export const updateFaq = (faqId, requestBody) =>
	axiosInst.put(`${API_URL}/${faqId}`, requestBody).then(res => res.data)

export const deleteFaq = (faqId, profileId) =>
	axiosInst
		.delete(`${API_URL}/${faqId}?profile_id=${profileId}`)
		.then(res => res.data)

export const getFaqById = faqId =>
	axiosInst.get(`${API_URL}/${faqId}`).then(res => res.data)
