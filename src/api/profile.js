import axiosInst from '@/api/axios.instance'

const API_URL = '/me/profiles'

export const getProfileData = (status = 'all', page = 1, limit = 10) =>
	axiosInst
		.get(`${API_URL}?status=${status}&page=${page}&limit=${limit}`)
		.then(res => res.data)

export const updateProfileData = profileData =>
	axiosInst.put(`${API_URL}`, profileData).then(res => res.data)
