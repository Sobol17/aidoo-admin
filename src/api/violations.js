import axiosInst from '@/api/axios.instance'

const API_URL = '/violations'

export const getViolations = (search = '', page = 1, limit = 10, profileID = '') => {
	return axiosInst
		.get(
			`${API_URL}${search ? `?search=${search}&` : '?'}page=${page}&limit=${limit}&profile_id=${profileID}`
		)
		.then(res => res.data)
}

export const createViolation = requestBody =>
	axiosInst.post(`${API_URL}`, requestBody).then(res => res.data)

export const updateViolation = (faqId, requestBody) =>
	axiosInst.put(`${API_URL}/${faqId}`, requestBody).then(res => res.data)

export const deleteViolation = (faqId, profileId) =>
	axiosInst.delete(`${API_URL}/${faqId}?profile_id=${profileId}`).then(res => res.data)
