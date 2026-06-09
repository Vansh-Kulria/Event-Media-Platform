import api from "@/lib/axios";

export const getNotifications =
  async () => {
    const response =
      await api.get("/notifications");

    return response.data;
  };

export const getUnreadCount =
  async () => {
    const response =
      await api.get(
        "/notifications/unread-count"
      );

    return response.data;
  };

export const markNotificationRead =
  async (
    notificationId: string
  ) => {
    const response =
      await api.patch(
        `/notifications/${notificationId}/read`
      );

    return response.data;
  };

export const markAllRead =
  async () => {
    const response =
      await api.patch(
        "/notifications/read-all"
      );

    return response.data;
  };

  export const tagUser = async (
  mediaId: string,
  userId: string
) => {
  const response = await api.post(
    `/media/${mediaId}/tag`,
    { userId }
  );

  return response.data;
};

export const getMediaTags = async (
  mediaId: string
) => {
  const response = await api.get(
    `/media/${mediaId}/tags`
  );

  return response.data;
};

export const getTaggedPhotos =
  async () => {
    const response = await api.get(
      "/media/tagged/me"
    );

    return response.data;
  };


  