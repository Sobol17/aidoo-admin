import axiosInst from '@/api/axios.instance'

const API_URL = '/orders'

export const getOrders = (profileID = '', status, search, page, limit, startDate, endDate) => {
	return axiosInst
		.get(
			`${API_URL}?profile_id=${profileID}&status=${status}&page=${page}&limit=${limit}&search=${search}&start_date=${startDate}&end_date=${endDate}`
		)
		.then(res => res.data)
}

export const getOrderReportsByDates = (startDate, endDate, profileID = '') => {
	return axiosInst
		.get(`${API_URL}/report?profile_id=${profileID}&start_date=${startDate}&end_date=${endDate}`)
		.then(res => res.data)
}
