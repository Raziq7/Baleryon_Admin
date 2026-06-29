import { create } from "zustand";
import axios from "axios";
import { api } from "../services/api";

export type Banner = {
  id: string;
  imageUrl?: string | null;
  topContent?: string | null;
  mainContent?: string | null;
  lastContent?: string | null;
  shopNowLink?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LimitedSeason = {
  id: string;
  mainContent?: string | null;
  description?: string | null;
  timeCountingHours: number;
  ctaLink?: string | null;
  backgroundImageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UrbanStory = {
  id: string;
  category: string;
  ctaLink?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type JoinCommunityStatus = "ADDED" | "PENDING" | "INVALID" | "VALID";

export type JoinCommunityEntry = {
  id: string;
  email: string;
  status: JoinCommunityStatus;
  createdAt: string;
  updatedAt: string;
};

type CmsState = {
  banners: Banner[];
  limitedSeasons: LimitedSeason[];
  urbanStories: UrbanStory[];
  joinCommunity: JoinCommunityEntry[];
  selectedBanner: Banner | null;
  selectedLimitedSeason: LimitedSeason | null;
  selectedUrbanStory: UrbanStory | null;
  loading: boolean;
  error: string | null;

  fetchBanners: () => Promise<void>;
  getBannerById: (id: string) => Promise<void>;
  addBanner: (data: FormData) => Promise<void>;
  updateBanner: (id: string, data: FormData) => Promise<void>;
  toggleBannerActive: (id: string) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;

  fetchLimitedSeasons: () => Promise<void>;
  getLimitedSeasonById: (id: string) => Promise<void>;
  addLimitedSeason: (data: FormData) => Promise<void>;
  updateLimitedSeason: (id: string, data: FormData) => Promise<void>;
  toggleLimitedSeasonActive: (id: string) => Promise<void>;
  deleteLimitedSeason: (id: string) => Promise<void>;

  fetchUrbanStories: () => Promise<void>;
  getUrbanStoryById: (id: string) => Promise<void>;
  addUrbanStory: (data: FormData) => Promise<void>;
  updateUrbanStory: (id: string, data: FormData) => Promise<void>;
  toggleUrbanStoryActive: (id: string) => Promise<void>;
  deleteUrbanStory: (id: string) => Promise<void>;

  fetchJoinCommunity: () => Promise<void>;
  addJoinCommunity: (email: string, status?: JoinCommunityStatus) => Promise<void>;
  updateJoinCommunityStatus: (
    id: string,
    status: JoinCommunityStatus
  ) => Promise<void>;
  deleteJoinCommunity: (id: string) => Promise<void>;
};

function handleError(
  err: unknown,
  set: (partial: Partial<CmsState>) => void
) {
  if (axios.isAxiosError(err)) {
    set({
      error: err.response?.data?.message || "Request failed",
      loading: false,
    });
  } else {
    set({ error: "An unexpected error occurred", loading: false });
  }
}

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const useCmsStore = create<CmsState>((set) => ({
  banners: [],
  limitedSeasons: [],
  urbanStories: [],
  joinCommunity: [],
  selectedBanner: null,
  selectedLimitedSeason: null,
  selectedUrbanStory: null,
  loading: false,
  error: null,

  fetchBanners: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ banners: Banner[] }>("/admin/cms/banners");
      set({ banners: res.data.banners || [], loading: false });
    } catch (err) {
      handleError(err, set);
    }
  },

  getBannerById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ banner: Banner }>(`/admin/cms/banners/${id}`);
      set({ selectedBanner: res.data.banner, loading: false });
    } catch (err) {
      handleError(err, set);
    }
  },

  addBanner: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/admin/cms/banners", data, multipart);
      await useCmsStore.getState().fetchBanners();
      set({ loading: false });
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  updateBanner: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/admin/cms/banners/${id}`, data, multipart);
      await useCmsStore.getState().fetchBanners();
      set({ loading: false });
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  toggleBannerActive: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.patch(`/admin/cms/banners/${id}/toggle-active`);
      await useCmsStore.getState().fetchBanners();
      set({ loading: false });
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  deleteBanner: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/admin/cms/banners/${id}`);
      set((state) => ({
        banners: state.banners.filter((b) => b.id !== id),
        loading: false,
      }));
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  fetchLimitedSeasons: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ limitedSeasons: LimitedSeason[] }>(
        "/admin/cms/limited-seasons"
      );
      set({ limitedSeasons: res.data.limitedSeasons || [], loading: false });
    } catch (err) {
      handleError(err, set);
    }
  },

  getLimitedSeasonById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ limitedSeason: LimitedSeason }>(
        `/admin/cms/limited-seasons/${id}`
      );
      set({ selectedLimitedSeason: res.data.limitedSeason, loading: false });
    } catch (err) {
      handleError(err, set);
    }
  },

  addLimitedSeason: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/admin/cms/limited-seasons", data, multipart);
      await useCmsStore.getState().fetchLimitedSeasons();
      set({ loading: false });
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  updateLimitedSeason: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/admin/cms/limited-seasons/${id}`, data, multipart);
      await useCmsStore.getState().fetchLimitedSeasons();
      set({ loading: false });
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  toggleLimitedSeasonActive: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.patch(`/admin/cms/limited-seasons/${id}/toggle-active`);
      await useCmsStore.getState().fetchLimitedSeasons();
      set({ loading: false });
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  deleteLimitedSeason: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/admin/cms/limited-seasons/${id}`);
      set((state) => ({
        limitedSeasons: state.limitedSeasons.filter((l) => l.id !== id),
        loading: false,
      }));
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  fetchUrbanStories: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ urbanStories: UrbanStory[] }>(
        "/admin/cms/urban-stories"
      );
      set({ urbanStories: res.data.urbanStories || [], loading: false });
    } catch (err) {
      handleError(err, set);
    }
  },

  getUrbanStoryById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ urbanStory: UrbanStory }>(
        `/admin/cms/urban-stories/${id}`
      );
      set({ selectedUrbanStory: res.data.urbanStory, loading: false });
    } catch (err) {
      handleError(err, set);
    }
  },

  addUrbanStory: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/admin/cms/urban-stories", data, multipart);
      await useCmsStore.getState().fetchUrbanStories();
      set({ loading: false });
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  updateUrbanStory: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/admin/cms/urban-stories/${id}`, data, multipart);
      await useCmsStore.getState().fetchUrbanStories();
      set({ loading: false });
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  toggleUrbanStoryActive: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.patch(`/admin/cms/urban-stories/${id}/toggle-active`);
      await useCmsStore.getState().fetchUrbanStories();
      set({ loading: false });
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  deleteUrbanStory: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/admin/cms/urban-stories/${id}`);
      set((state) => ({
        urbanStories: state.urbanStories.filter((u) => u.id !== id),
        loading: false,
      }));
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  fetchJoinCommunity: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ entries: JoinCommunityEntry[] }>(
        "/admin/cms/join-community"
      );
      set({ joinCommunity: res.data.entries || [], loading: false });
    } catch (err) {
      handleError(err, set);
    }
  },

  addJoinCommunity: async (email, status = "ADDED") => {
    set({ loading: true, error: null });
    try {
      await api.post("/admin/cms/join-community", { email, status });
      await useCmsStore.getState().fetchJoinCommunity();
      set({ loading: false });
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  updateJoinCommunityStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      await api.patch(`/admin/cms/join-community/${id}/status`, { status });
      await useCmsStore.getState().fetchJoinCommunity();
      set({ loading: false });
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },

  deleteJoinCommunity: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/admin/cms/join-community/${id}`);
      set((state) => ({
        joinCommunity: state.joinCommunity.filter((e) => e.id !== id),
        loading: false,
      }));
    } catch (err) {
      handleError(err, set);
      throw err;
    }
  },
}));
