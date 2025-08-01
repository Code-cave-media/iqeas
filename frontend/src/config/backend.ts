/* eslint-disable @typescript-eslint/no-explicit-any */
import { get } from "http";

export const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;
export const API_ENDPOINT = {
  VERIFY_USER: `${API_URL}/auth/me `,
  LOGIN: `${API_URL}/auth/login`,
  ADD_NEW_USER: `${API_URL}/admin/create/create-user`,
  EDIT_USER_STATUS: (id: any) => `${API_URL}/admin/user/${id}/status`,
  CREATE_PROJECT: `${API_URL}/projects`,
  GET_ALL_USERS: (search, page, size) =>
    `${API_URL}/admin/get-users?page=${page}&size=${size}&search=${search}`,
  GET_USERS_BY_ROLE: (role: any) => `${API_URL}/admin/get-users/${role}`,
  EDIT_USER: (id: any) => `${API_URL}/admin/users/${id}`,
  DELETE_USER: (id: any) => `${API_URL}/admin/users/${id}`,
  CREATE_TEAMS: `${API_URL}/teams`,
  EDIT_TEAMS: (id: any) => `${API_URL}/teams/${id}`,
  GET_ALL_RFQ_PROJECTS: (query, page, size) =>
    `${API_URL}/projects/rfq?page=${page}&size=${size}&query=${query}`,
  UPLOAD_FILE: `${API_URL}/upload-file`,
  PROJECT_ADD_MORE_INFO: `${API_URL}/project-more-info`,
  GET_ALL_PROJECTS_FOR_ADMIN: `${API_URL}/projects/admin`,
  EDIT_PROJECT: (id: any) => `${API_URL}/projects/${id}`,
  GET_TEAMS_BY_ROLE: (role: any) => `${API_URL}/teams/role/${role}`,
  GET_ALL_ESTIMATION_PROJECTS: (query, page, size) =>
    `${API_URL}/projects/estimation?page=${page}&size=${size}&query=${query}`,
  CREATE_ESTIMATION: `${API_URL}/estimation`,
  EDIT_ESTIMATION: (id: any) => `${API_URL}/patch/estimation/${id}`,
  CREATE_PROJECT_REJECTION: `${API_URL}/projects/reject`,
  GET_ALL_PROJECT_UPLOAD_FILES: (project_id, type, page, size, search) =>
    `${API_URL}/get/get-all-uploaded-filess?project_id=${project_id}&type=${type}&page=${page}&size=${size}&search=${search}`,
  GET_ALL_FILES: (query, page, pageSize) =>
    `${API_URL}/get-files/all-files?page=${page}&query=${query}&size=${pageSize}`,
  CREATE_PASSWORD: `${API_URL}/auth/reset-password`,
  FORGOT_PASSWORD: `${API_URL}/auth/forgot-password`,
  CREATE_STAGE: (project_id: any) => `${API_URL}/stages/${project_id}`,
  GET_STAGES: (project_id: any) => `${API_URL}/stages/${project_id}`,
  GET_PROJECT_STAGE: (projectId: any, stageId: any) =>
    `${API_URL}/stages/drawings/${projectId}/${stageId}`,
  GET_ALL_PM_PROJECTS: (query, page, size) =>
    `${API_URL}/projects/pm?page=${page}&query=${query}&size=${size}`,
  GET_ALL_ADMIN_PROJECTS: (query, page, size) =>
    `${API_URL}/projects/admin?page=${page}&query=${query}&size=${size}`,
  GET_STAGE_DRAWINGS: (project_id: any, stage_id: any) =>
    `${API_URL}/stages/drawings/${project_id}/${stage_id}`,
  CREATE_STAGE_DRAWING: `${API_URL}/drawings`,
  GET_WORKER_TASKS: (projectId, page, size) =>
    `${API_URL}/workers/tasks/${projectId}?page=${page}&size=${size}`,
  GET_ALL_WORKERS_PROJECTS: (query, page, size) =>
    `${API_URL}/projects/working?page=${page}&size=${size}&query=${query}`,
  CREATE_DRAWING_LOGS: (drawing_id: any) =>
    `${API_URL}/drawings/${drawing_id}/logs`,
  EDIT_DRAWING_LOG: (log_id: any) => `${API_URL}/logs/${log_id}`,
  GET_DRAWING_LOG: (log_id: any) => `${API_URL}/logs/${log_id}`,
  GET_ALL_DELIVERY_FILES: (project_id: any) =>
    `${API_URL}/stages/final-files/${project_id}`,
  ADD_DELIVERY_FILES: (project_id: any) =>
    `${API_URL}/project-delivery/${project_id}`,
  GET_ALL_UPLOAD_DATA_BY_ROLES: `${API_URL}/projects/uploaded-files-data-by-roles`,
  GET_PROJECT_BY_ID: (project_id) => `${API_URL}/projects/${project_id}`,
  DELETE_FILE: (file_id) => `${API_URL}/delete-file/${file_id}`,
  GET_PUBLIC_PROJECT_INFO: (token) => `${API_URL}/projects/public/${token}`,
  CREATE_ESTIMATION_CORRECTION: `${API_URL}/estimation/correction`,
  ATTENDANCE_RECORDS: `${API_URL}/attendance`,
  ACTION_ATTENDANCE_RECORDS: (id: any) => `${API_URL}/attendance${id}`,
  GET_SALARIES: (date, page, size, search) =>
    `${API_URL}/salary?date=${date}&page=${page}&size=${size}&search=${search}`,
  EDIT_CREATE_SALARY: `${API_URL}/salary`,
  GET_ATTENDANCE_RECORDS: (date, page, size, search) =>
    `${API_URL}/attendance/records?date=${date}&page=${page}&size=${size}&search=${search}`,
  GET_LEAVES: (filter, page, size, search) =>
    `${API_URL}/leave/records?filter=${filter}&page=${page}&size=${size}&search=${search}`,
  CREATE_LEAVE: `${API_URL}/leave`,
  ACTION_LEAVE: (id) => `${API_URL}/leave/${id}`,
  GET_DOCUMENT_PROJECTS: (page, size, search) =>
    `${API_URL}/document/projects?page=${page}&size=${size}&search=${search}`,
};
