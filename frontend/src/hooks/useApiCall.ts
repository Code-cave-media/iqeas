/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
interface ApiRequest {
  type: string;
  endpoint: string;
  data?: any;
  dataType?: "application/json" | "application/form-data";
  token?: string;
}
interface ApiResponse {
  data?: any;
  status: number;
  error?: string;
}

export const useAPICall = () => {
  const [fetching, setIsFetching] = useState(false);
  const [fetchType, setFetchType] = useState<string>("");
  const [isFetched, setIsFetched] = useState(false);
  async function makeApiCall(
    method: string,
    endpoint: string,
    data?: any,
    dataType?: "application/json" | "application/form-data",
    token?: string,
    fetchType?: string
  ): Promise<ApiResponse> {
    let header = {};
    if (token) {
      header = {
        Authorization: `Bearer ${token}`,
        "Content-Type": dataType || "application/json",
      };
    } else {
      header = {
        "Content-Type": dataType || "application/json",
      };
    }
    let responseData: ApiResponse;
    setIsFetching(true);
    setFetchType(fetchType);
    try {
      const response = await axios({
        method: method,
        data: data,
        headers: header,
        url: endpoint,
      });
      responseData = {
        status: response.status,
        data: response.data,
        error: undefined,
      };
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        console.error("Error message: ", error.message);
        responseData = {
          status: error.response.status,
          data: undefined,
          error: error.response.data.detail,
        };
      } else {
        responseData = {
          status: 500,
          data: undefined,
          error: "An unexpected error occurred",
        };
      }
    }
    setIsFetching(false);
    setFetchType("");
    if (responseData.status === 500) {
      toast.error("An unexpected error occurred, Please try again later");
      console.log(responseData.error);
    }
    if (responseData.status === 401) {
      // toast.error("Unauthorized, Please login again");
      console.log(responseData.error);
    }
    if (responseData.status === 403) {
      toast.error(
        "Forbidden, You don't have permission to access this resource"
      );
      console.log(responseData.error);
    }
    setIsFetched(true);
    return responseData;
  }
  return {
    makeApiCall,
    fetching,
    fetchType,
    isFetched,
  };
};
