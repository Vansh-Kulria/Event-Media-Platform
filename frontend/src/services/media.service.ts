import api from "@/lib/axios";

export const uploadMedia = async (
  eventId: string,
  file: File,
  tags?: string
) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("eventId", eventId);
  if (tags) {
    formData.append("tags", tags);
  }

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

export const uploadMediaBulk = async (
  eventId: string,
  files: File[],
  tags?: string
) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("eventId", eventId);
  if (tags) {
    formData.append("tags", tags);
  }

  const response = await api.post(
    "/media/upload-bulk",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
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

export const deleteMediaBulk = async (
  mediaIds: string[]
) => {
  const response = await api.post(
    "/media/delete-bulk",
    { mediaIds }
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

  export const uploadSelfie = async (
  file: File
) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/media/upload-selfie",
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

export const getMySelfie =
  async () => {
    const response =
      await api.get(
        "/media/my-selfie"
      );

    return response.data;
  };

export const recognizeFace =
  async () => {
    const response =
      await api.post(
        "/media/recognize-face"
      );

    return response.data;
  };

export const getMyPhotos =
  async () => {
    const response =
      await api.get(
        "/media/my-photos"
      );

    return response.data;
  };

export const searchUsers = async (q: string) => {
  const response = await api.get(`/media/users/search?q=${encodeURIComponent(q)}`);
  return response.data;
};

export const searchMedia = async (params: { tag?: string; event?: string; user?: string }) => {
  const queryParts = [];
  if (params.tag) queryParts.push(`tag=${encodeURIComponent(params.tag)}`);
  if (params.event) queryParts.push(`event=${encodeURIComponent(params.event)}`);
  if (params.user) queryParts.push(`user=${encodeURIComponent(params.user)}`);
  const queryStr = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  const response = await api.get(`/media/search${queryStr}`);
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get("/analytics");
  return response.data;
};