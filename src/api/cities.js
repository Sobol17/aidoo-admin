import axiosInst from '@/api/axios.instance'

const API_URL = '/cities'

export const getCities = (search = '', page = 1, limit = 10, profileID = '') => {
	return axiosInst
		.get(`${API_URL}${search ? `?search=${search}&` : '?'}page=${page}&limit=${limit}&profile_id=${profileID}`)
		.then(res => res.data)
}

export const createCity = requestBody => axiosInst.post(`${API_URL}`, requestBody).then(res => res.data)

export const updateCity = (cityId, requestBody) =>
	axiosInst.put(`${API_URL}/${cityId}`, requestBody).then(res => res.data)

export const deleteCity = (cityId, profileId) =>
	axiosInst.delete(`${API_URL}/${cityId}?profile_id=${profileId}`).then(res => res.data)

export const getCityById = (cityId, profileID) =>
	axiosInst.get(`${API_URL}/${cityId}?profile_id=${profileID}`).then(res => res.data)
