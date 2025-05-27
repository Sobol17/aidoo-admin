import {
	editComplaintStatus,
	getArchivedComplaints,
	getComplaints,
	getComplaintsMessages,
	sendComplaintMessage,
} from '@/api/complaints'
import { useProfileStore } from '@/stores/profile'
import { formatDate } from '@/utils/formatDate'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'

function transformActiveStatus(status) {
	switch (status) {
		case 'at_work':
			return 'В работе'
		case 'actived':
			return 'Активная'
		case 'closed':
			return 'Закрытая'
		case 'important':
			return 'Важная'
	}
}

export function useComplaints(complaintsStatus, page = 1, limit = 1000) {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: computed(() => ['complaint', complaintsStatus.value.code]),
		queryFn: () => getComplaints(profileStore.profileID, page, limit, complaintsStatus.value.code),
		staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		select: data => {
			if (data && data.documents && data.documents.length > 0) {
				const complaints = data.documents
				return {
					countComplaints: data.count,
					complaints: complaints.map(complaint => ({
						id: complaint._id,
						profileId: complaint.profile_id,
						text: complaint.text,
						attachments: complaint.attachments,
						objectType: complaint.object_type,
						objectId: complaint.object_id,
						profile: complaint.profile,
						status: transformActiveStatus(complaint.status),
						createdAt: formatDate(complaint.created_at),
						updatedAt: formatDate(complaint.updated_at),
					})),
				}
			}
			return null
		},
	})
}

export function useArchivedComplaints(page = 1, limit = 1000) {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: ['complaint'],
		queryFn: () => getArchivedComplaints(profileStore.profileID, page, limit),
		staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		select: data => {
			if (data && data.documents && data.documents.length > 0) {
				const complaints = data.documents
				return {
					countComplaints: data.count,
					complaints: complaints.map(complaint => ({
						id: complaint._id,
						profileId: complaint.profile_id,
						user: complaint.profile,
						lastMessage: complaint.last_message,
						startDate: formatDate(complaint.start_date),
						endDate: formatDate(complaint.end_date),
					})),
				}
			}
			return null
		},
	})
}

export function useComplaintMessages(complaintId, page = 1, limit = 1000) {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: computed(() => ['comp-messages', complaintId]),
		queryFn: () => getComplaintsMessages(profileStore.profileID, page, limit, complaintId.value),
		enabled: false,
		staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		select: data => {
			if (data && data.documents && data.documents.length > 0) {
				const supportItems = data.documents
				return supportItems.map(support => ({
					id: support._id,
					chatId: support.complaint_id,
					senderId: support.sender_id,
					text: support.text,
					attachments: support.attachments,
					timestamp: support.timestamp,
					sender: support.sender,
				}))
			}
			return null
		},
	})
}

export function useSendMessage(options = {}) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: chatData => {
			return sendComplaintMessage(chatData)
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['complaint'],
			})

			if (options.onSuccess) {
				options.onSuccess(data, variables)
			}
		},
		onError: (error, variables) => {
			if (options.onError) {
				options.onError(error, variables)
			}
		},
	})
}

export function useUpdateComplaint(options = {}) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ id, complaint }) => editComplaintStatus(id, complaint),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['complaint'],
			})

			if (options.onSuccess) {
				options.onSuccess(data, variables)
			}
		},
		onError: (error, variables) => {
			if (options.onError) {
				options.onError(error, variables)
			}
		},
	})
}
