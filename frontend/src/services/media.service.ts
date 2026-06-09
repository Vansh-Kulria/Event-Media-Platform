import api from "@/lib/axios";

export const uploadMedia = async (
  eventId: string,
  file: File
) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("eventId", eventId);

  const response = await api.post(
    "/media/upload",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getEventMedia =
  async (eventId: string) => {
    const response = await api.get(
      `/media/events/${eventId}`
    );

    return response.data;
  };

  export const toggleLike = async (
  mediaId: string
) => {
  const response = await api.post(
    `/media/${mediaId}/like`
  );

  return response.data;
};

export const getLikesCount =
  async (mediaId: string) => {
    const response = await api.get(
      `/media/${mediaId}/likes`
    );

    return response.data;
  };

  export const getComments = async (
  mediaId: string
) => {
  const response = await api.get(
    `/media/${mediaId}/comments`
  );

  return response.data;
};

export const addComment = async (
  mediaId: string,
  content: string
) => {
  const response = await api.post(
    `/media/${mediaId}/comment`,
    {
      content,
    }
  );

  return response.data;
};

export const deleteMedia = async (
  mediaId: string
) => {
  const response = await api.delete(
    `/media/${mediaId}`
  );

  return response.data;
};

export const toggleFavorite = async (
  mediaId: string
) => {
  const response = await api.post(
    `/media/${mediaId}/favorite`
  );

  return response.data;
};

export const getMyFavorites =
  async () => {
    const response = await api.get(
      "/media/favorites/me"
    );

    return response.data;
  };