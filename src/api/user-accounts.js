import axiosInst from '@/api/axios.instance'

const API_URL = '/user-accounts'

export const getUserAccounts = (
	search = '',
	page = 1,
	limit = 10,
	profileID = ''
) => {
	return axiosInst
		.get(
			`${API_URL}${search ? `?search=${search}&` : '?'}page=${page}&limit=${limit}&profile_id=${profileID}`
		)
		.then(res => res.data)
}

export const updateUserAccount = (id, data, profileID) =>
	axiosInst
		.put(`${API_URL}/${id}?profile_id=${profileID}`, data)
		.then(res => res.data)

export const deleteUserAccount = (id, profileID) =>
	axiosInst
		.delete(`${API_URL}/${id}?profile_id=${profileID}`)
		.then(res => res.data)
