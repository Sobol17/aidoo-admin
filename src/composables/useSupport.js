import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useProfileStore } from "@/stores/profile";
import { formatDate } from "@/utils/formatDate";
import { getSupportMessages, getSupports, sendMessage } from "@/api/support";
import { computed } from "vue";

export function useSupport(page = 1, limit = 1000) {
  const profileStore = useProfileStore();
  return useQuery({
    queryKey: ["support"],
    queryFn: () => getSupports(profileStore.profileID, page, limit),
    staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    select: (data) => {
      if (data && data.documents && data.documents.length > 0) {
        const supportItems = data.documents;
        return {
          countSupports: data.count,
          supports: supportItems.map((support) => ({
            id: support._id,
            profileId: support.profile_id,
            user: support.profile,
            lastMessage: support.last_message,
            createdAt: formatDate(support.created_at),
            updatedAt: formatDate(support.updated_at),
          })),
        };
      }
      return null;
    },
  });
}

export function useSupportMessages(chatId, page = 1, limit = 1000) {
  const profileStore = useProfileStore();
  return useQuery({
    queryKey: computed(() => ["messages", chatId]),
    queryFn: () =>
      getSupportMessages(profileStore.profileID, page, limit, chatId.value),
    enabled: false,
    staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    select: (data) => {
      if (data && data.documents && data.documents.length > 0) {
        const supportItems = data.documents;
        return {
          countMessages: data.count,
          messages: supportItems.map((support) => ({
            id: support._id,
            chatId: support.chat_id,
            senderId: support.sender_id,
            text: support.text,
            attachments: support.attachments,
            timestamp: formatDate(support.timestamp),
            sender: support.sender,
          })),
        };
      }
      return null;
    },
  });
}

export function useSendMessage(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chatData) => {
      return sendMessage(chatData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["support"],
      });

      if (options.onSuccess) {
        options.onSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      if (options.onError) {
        options.onError(error, variables);
      }
    },
  });
}
