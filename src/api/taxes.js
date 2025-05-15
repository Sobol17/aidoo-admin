import axiosInst from '@/api/axios.instance'

const API_URL = '/taxes'

export const getTaxes = (search = '', page = 1, limit = 10, profileID = '') => {
	return axiosInst
		.get(
			`${API_URL}${search ? `?search=${search}&` : '?'}page=${page}&limit=${limit}&profile_id=${profileID}`
		)
		.then(res => res.data)
}

export const createTax = requestBody =>
	axiosInst.post(`${API_URL}`, requestBody).then(res => res.data)

export const updateTax = (taxId, requestBody) =>
	axiosInst.put(`${API_URL}/${taxId}`, requestBody).then(res => res.data)

export const deleteTax = (taxId, profileId) =>
	axiosInst.delete(`${API_URL}/${taxId}?profile_id=${profileId}`).then(res => res.data)

export const getTaxById = (taxId, profileID) =>
	axiosInst.get(`${API_URL}/${taxId}?profile_id=${profileID}`).then(res => res.data)
