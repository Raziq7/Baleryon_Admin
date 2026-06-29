import axios from "axios";

export const getErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    return (
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Request failed"
    );
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Something went wrong";
};
