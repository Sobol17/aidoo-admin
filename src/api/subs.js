import axiosInst from '@/api/axios.instance'

const API_URL = '/subscriptions'

export const getSubs = (
	status = 'all',
	profileID = '',
	search,
	page,
	limit
) => {
	return axiosInst
		.get(
			`${API_URL}?profile_id=${profileID}&page=${page}&limit=${limit}&search=${search}&status=${status}`
		)
		.then(res => res.data)
}
