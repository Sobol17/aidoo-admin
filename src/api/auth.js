import axiosInst from '@/api/axios.instance'

const API_URL = '/auth'

export const login = data =>
	axiosInst.post(`${API_URL}/login`, data).then(res => res.data)
