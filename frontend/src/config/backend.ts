import { get } from "http";

export const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;
export const API_ENDPOINT = {
  PURCHASE_NEW_USER: `${API_URL}/purchase/e-book-course`,
  VERIFY_USER: `${API_URL}/user/me `,
  LOGIN: `${API_URL}/user/login`,
  REGISTER: `${API_URL}/user/register`,
  CREATE_COURSE: `${API_URL}/course/create`,
  CREATE_COURSE_CHAPTER: `${API_URL}/course/chapter/create`,
  UPDATE_COURSE_CHAPTER: (chapter_id: number) =>
    `${API_URL}/course/chapter/update/${chapter_id}`,
  DELETE_COURSE_CHAPTER: (chapter_id: number) =>
    `${API_URL}/course/chapter/delete/${chapter_id}`,
  LIST_COURSES: (page: number, pageSize: number) =>
    `${API_URL}/course/list?page=${page}&page_size=${pageSize}`,
  UPDATE_COURSE: (course_id: number) => `${API_URL}/course/update/${course_id}`,
  DELETE_COURSE: (course_id: number) => `${API_URL}/course/delete/${course_id}`,
  CREATE_EBOOK: `${API_URL}/ebook/create`,
  CREATE_EBOOK_CHAPTER: `${API_URL}/ebook/chapter/create`,
  UPDATE_EBOOK_CHAPTER: (chapter_id: number) =>
    `${API_URL}/ebook/chapter/update/${chapter_id}`,
  DELETE_EBOOK_CHAPTER: (chapter_id: number) =>
    `${API_URL}/ebook/chapter/delete/${chapter_id}`,
  LIST_EBOOKS: (page: number, pageSize: number) =>
    `${API_URL}/ebook/list?page=${page}&page_size=${pageSize}`,
  UPDATE_EBOOK: (ebook_id: number) => `${API_URL}/ebook/update/${ebook_id}`,
  DELETE_EBOOK: (ebook_id: number) => `${API_URL}/ebook/delete/${ebook_id}`,
  GET_USER_DASHBOARD_LIST: (filter: string, page: number, limit: number) =>
    `${API_URL}/user-dashboard/list?filter=${filter}&page=${page}&limit=${limit}`,
  GET_USER_DASHBOARD_CARD: `${API_URL}/user-dashboard/card`,
  GET_USER_DASHBOARD_COURSES: (filter: string, page: number, limit: number) =>
    `${API_URL}/user-dashboard/courses?filter=${filter}&page=${page}&limit=${limit}`,
  GET_USER_DASHBOARD_EBOOKS: (filter: string, page: number, limit: number) =>
    `${API_URL}/user-dashboard/ebooks?filter=${filter}&page=${page}&limit=${limit}`,

  GET_COURSE_LANDING_PAGE: (id: string) =>
    `${API_URL}/course/get/landing/${id}`,
  GET_EBOOK_LANDING_PAGE: (id: string) => `${API_URL}/ebook/get/landing/${id}`,
  GET_CHECKOUT_DATA: (
    id: string,
    type: string,
    ref?: string,
    user_id?: string
  ) =>
    `${API_URL}/purchase/checkout/${type}/${id}?ref=${ref}&user_id=${user_id}`,
  APPLY_COUPON: `${API_URL}/coupon/apply`,
  CHECKOUT: `${API_URL}/purchase/checkout`,
  PAYMENT_VERIFICATION: `${API_URL}/purchase/checkout/verify`,
  CREATE_AFFILIATE_LINK: `${API_URL}/affiliate/create`,
  ADD_CLICK_AFFILIATE_LINK: `${API_URL}/affiliate/click/add`,
  USER_DASHBOARD_AFFILIATE: `${API_URL}/user-dashboard/affiliate-dashboard`,
  GET_WITHDRAW_HISTORY: (page: number, limit: number) =>
    `${API_URL}/user-dashboard/withdraw-history?&page=${page}&limit=${limit}`,
  GET_ALL_PRODUCT: (query: string, page: number, limit: number) =>
    `${API_URL}/user-dashboard/product-history?query=${query}&page=${page}&limit=${limit}`,
  CREATE_WITHDRAW: `${API_URL}/affiliate/withdraw`,
  GET_WITHDRAW_DETAILS: `${API_URL}/affiliate/withdraw-account-details`,
  UPDATE_WITHDRAW_DETAILS: `${API_URL}/affiliate/update-withdraw-account-details`,
  GET_COURSE_WATCH_PAGE: (id: string) => `${API_URL}/course/get/watch/${id}`,
  COURSE_CHAPTER_COMPLETE: (id: string) =>
    `${API_URL}/course/chapter/complete/${id}`,
  GET_EBOOK_READ_PAGE: (id: string) => `${API_URL}/ebook/get/read/${id}`,
  GET_ALL_TRANSACTIONS: (
    page: number,
    limit: number,
    filter: string,
    search: string
  ) =>
    `${API_URL}/purchase/transactions?page=${page}&limit=${limit}&filter=${filter}&search=${search}`,
  GET_ALL_PURCHASES: (
    page: number,
    limit: number,
    filter: string,
    search: string
  ) =>
    `${API_URL}/purchase/purchases?page=${page}&limit=${limit}&filter=${filter}&search=${search}`,
  CREATE_PURCHASE: `${API_URL}/purchase/create`,
  VERIFY_ITEM: (type: string, id: string) =>
    `${API_URL}/user-dashboard/verify/item/${type}/${id}`,
  CREATE_PURCHASE_VERIFY_USER: (user_id: string) =>
    `${API_URL}/user-dashboard/verify/user/${user_id}`,
  GET_ALL_WITHDRAWALS: (
    page: number,
    limit: number,
    filter?: string,
    search?: string
  ) =>
    `${API_URL}/affiliate/withdrawals?page=${page}&limit=${limit}&filter=${filter}&search=${search}`,
  UPDATE_WITHDRAWAL_STATUS: (withdrawal_id: number) =>
    `${API_URL}/affiliate/withdraw/${withdrawal_id}/status`,
  GET_ALL_COUPONS: (
    page: number,
    limit: number,
    filter?: string,
    search?: string
  ) =>
    `${API_URL}/coupon/all?page=${page}&limit=${limit}&filter=${filter}&search=${search}`,
  CREATE_COUPON: `${API_URL}/coupon/create`,
  UPDATE_COUPON: (id: number) => `${API_URL}/coupon/update/${id}`,
  DELETE_COUPON: (id: number) => `${API_URL}/coupon/delete/${id}`,
  GET_ALL_USERS: (page: number, limit: number, search?: string) =>
    `${API_URL}/user/all?page=${page}&limit=${limit}${
      search ? `&search=${search}` : ""
    }`,
  UPDATE_USER_PASSWORD: (user_id: string) =>
    `${API_URL}/user/update/password/${user_id}`,
  GET_ADMIN_DASHBOARD: `${API_URL}/admin/dashboard`,
};
