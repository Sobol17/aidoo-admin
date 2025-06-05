import axiosInst from '@/api/axios.instance'

const API_URL = '/tariffs'

export const getTariffs = (search = '', page = 1, limit = 10, profileID = '') => {
	return axiosInst
		.get(
			`${API_URL}${search ? `?search=${search}&` : '?'}page=${page}&limit=${limit}&profile_id=${profileID}`
		)
		.then(res => res.data)
}

export const createTariff = requestBody =>
	axiosInst.post(`${API_URL}`, requestBody).then(res => res.data)

export const updateTariff = (taxId, requestBody) =>
	axiosInst.put(`${API_URL}/${taxId}`, requestBody).then(res => res.data)

export const deleteTariff = (taxId, profileId) =>
	axiosInst.delete(`${API_URL}/${taxId}?profile_id=${profileId}`).then(res => res.data)

export const getTariffById = (taxId, profileID) =>
	axiosInst.get(`${API_URL}/${taxId}?profile_id=${profileID}`).then(res => res.data)
