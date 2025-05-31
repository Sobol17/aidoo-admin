import axiosInst from '@/api/axios.instance'

const API_URL = '/admin-accounts'

export const getList = (search = '', page = 1, limit = 10, role, profileID = '') => {
	return axiosInst
		.get(
			`${API_URL}${search ? `?search=${search}&` : '?'}page=${page}&limit=${limit}&role=${role}&profile_id=${profileID}`
		)
		.then(res => res.data)
}

export const getAccountById = (id, profileID) =>
	axiosInst.get(`${API_URL}/${id}?profile_id=${profileID}`).then(res => res.data)

export const createAccount = data => axiosInst.post(`${API_URL}`, data).then(res => res.data)

export const updateAccount = (id, data) =>
	axiosInst.put(`${API_URL}/${id}`, data).then(res => res.data)

export const deleteAccount = (id, profileID) =>
	axiosInst.delete(`${API_URL}/${id}?profile_id=${profileID}`).then(res => res.data)
