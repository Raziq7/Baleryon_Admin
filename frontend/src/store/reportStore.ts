import { create } from "zustand";
import { api } from "../services/api";

import type {
  ReportResponse,
  RangeType,
} from "../types/report";

interface ReportStore {
  data: ReportResponse | null;
  loading: boolean;
  error: string | null;

  fetchReport: (
    range: RangeType
  ) => Promise<void>;
}

export const useReportStore =
  create<ReportStore>((set) => ({
    data: null,
    loading: false,
    error: null,

    fetchReport: async (range) => {
      try {
        set({
          loading: true,
          error: null,
        });

        const res =
          await api.get<ReportResponse>(
            "/admin/reports/dashboard",
            {
              params: { range },
            }
          );

        set({
          data: res.data,
          loading: false,
        });
      } catch {
        set({
          loading: false,
          error:
            "Failed to load report",
        });
      }
    },
  }));