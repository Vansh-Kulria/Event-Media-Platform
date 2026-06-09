"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getMyFavorites,
} from "@/services/media.service";

export default function FavoritesPage() {
  const [favorites, setFavorites] =
    useState<any[]>([]);

  useEffect(() => {
    const loadFavorites =
      async () => {
        const data =
          await getMyFavorites();

        setFavorites(data);
      };

    loadFavorites();
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        My Favorites
      </h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {favorites.map(
          (favorite) => (
            <img
              key={favorite.id}
              src={`http://localhost:5000${favorite.media.url}`}
              alt=""
              className="h-48 w-full rounded object-cover"
            />
          )
        )}
      </div>
    </div>
  );
}