interface IUser {
  id: string;
  name: string;
  email: string;
  phonenumber: string;
  role: string;
  active: boolean;
}

interface IUserList {
  id: string;
  name: string;
}

export interface ITeam {
  id: number;
  title: string;
  active: boolean;
  users: IUserList[];
  leader: IUserList;
  leader_id: number;
}

export interface IRFCProjectUser {
  id: number;
  name: string;
  email: string;
  phonenumber: string;
}

export interface IRFCProject {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  name: string;
  project_id: string;
  received_date: string;
  client_name: string;
  client_company: string;
  location: string;
  project_type: string;
  priority: string;
  contact_person: string;
  contact_person_phone: string;
  contact_person_email: string;
  notes: string;
  status: string;
  send_to_estimation: boolean;
  user: IRFCProjectUser;
  uploaded_files: { label: string; id: number; file: string }[];
  add_more_infos: {
    note: string;
    uploaded_files: { label: string; id: number; file: string }[];
  }[];
}

export type { IUser };
