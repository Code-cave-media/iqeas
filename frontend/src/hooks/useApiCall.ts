/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from "react";
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import toast from "react-hot-toast";
import { API_ENDPOINT } from "@/config/backend";

interface ApiRequest {
  type: string;
  endpoint: string;
  data?: unknown;
  dataType?: "application/json" | "application/form-data";
  token?: string;
}

interface ApiResponse<T = unknown> {
  data?: T;
  status: number;
  detail?: string;
  success?: boolean;
}

export const useAPICall = () => {
  const [fetching, setIsFetching] = useState<boolean>(false);
  const [fetchType, setFetchType] = useState<string>("");
  const [isFetched, setIsFetched] = useState<boolean>(false);

  const makeApiCall = useCallback(
    async <T = unknown>(
      method: "get" | "post" | "put" | "patch" | "delete",
      endpoint: string,
      data?: unknown,
      dataType:
        | "application/json"
        | "application/form-data" = "application/json",
      token?: string,
      callType?: string
    ): Promise<ApiResponse<T>> => {
      // Typed headers
      const headers: Record<string, string> = {
        "Content-Type": dataType,
        "Cache-Control": "no-cache",
      };

      if (token) {
        (headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }

      let responseData: ApiResponse<T>;
      setIsFetching(true);
      setFetchType(callType || "");

      try {
        console.log("API Call:", method.toUpperCase(), endpoint);

        // Typed axios config
        const config: AxiosRequestConfig = {
          method,
          url: endpoint,
          data,
          headers,
        };

        const response: AxiosResponse = await axios(config);
        const responseJson: any = response.data; // Backend response shape varies

        console.log("Raw response:", responseJson);

        // ✅ Typed parsing with backend structure matching
        responseData = {
          status: responseJson.status || response.status,
          data: responseJson.result || responseJson.data || responseJson,
          detail: responseJson.message || responseJson.detail || null,
          success:
            responseJson.result?.success ??
            (response.status >= 200 && response.status < 300),
        } as ApiResponse<T>;

        console.log("Parsed response:", responseData);
      } catch (error) {
        console.error("API Error:", error);

        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            const errorData = axiosError.response.data as any;
            responseData = {
              status: axiosError.response.status || 500,
              data: undefined,
              detail:
                errorData.message || errorData.detail || axiosError.message,
              success: false,
            } as ApiResponse<T>;
          } else {
            responseData = {
              status: 500,
              data: undefined,
              detail: axiosError.message || "Network error",
              success: false,
            } as ApiResponse<T>;
          }
        } else {
          responseData = {
            status: 500,
            data: undefined,
            detail: "An unexpected error occurred",
            success: false,
          } as ApiResponse<T>;
        }
      } finally {
        setIsFetching(false);
        setFetchType("");
        setIsFetched(true);
      }

      return responseData;
    },
    []
  );

  return {
    makeApiCall,
    fetching,
    fetchType,
    isFetched,
  } as const;
};
