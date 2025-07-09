/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAPICall } from "@/hooks/useApiCall";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { API_ENDPOINT } from "@/config/backend";

const ROLES = [
  { value: "rfq", label: "RFQ" },
  { value: "working", label: "Working" },
  { value: "estimation", label: "Estimation" },
  { value: "document", label: "Document" },
  { value: "admin", label: "Admin" },
];

export default function AdminMembers() {
  // User state
  const { makeApiCall, fetchType, fetching } = useAPICall();
  const { user, authToken } = useAuth();
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Alice",
      email: "alice@mail.com",
      phone: "1234567890",
      active: true,
      role: "admin",
    },
    {
      id: 2,
      name: "Bob",
      email: "bob@mail.com",
      phone: "9876543210",
      active: false,
      role: "rfq",
    },
  ]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    active: true,
    role: "rfq",
  });

  // Team state
  const [teams, setTeams] = useState([
    { id: 1, title: "Team Alpha", members: [1, 2], leader: 1 },
  ]);
  const [teamForm, setTeamForm] = useState({
    title: "",
    members: [],
    leader: "",
  });
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);

  // Add user
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.phone) {
      toast.error("Fill required fields");
      return;
    }
    const response = await makeApiCall(
      "post",
      API_ENDPOINT.ADD_NEW_USER,
      {
        ...newUser,
        phoneNumber: newUser.phone,
      },
      "application/json",
      authToken,
      "addUser"
    );
    if (response.status == 200) {
      setUsers([response.data, ...users]);
      toast.success(response.detail);
    } else {
      toast.error(response.detail);
    }
  };

  // Toggle user active
  const handleToggleActive = async (id) => {
    const currentStatus = users.find(item=>item.id == id)
    const response = await makeApiCall(
      "patch",
      API_ENDPOINT.EDIT_USER_STATUS(id),
      { active: !currentStatus.active},
      'application/json',
      authToken,
      'userToggle'
    );
    if(response.status == 200){
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
      );
      toast.success(response.detail)
    }else{
      toast.error(response.detail);
    }
    
  };

  // Add team
  const handleAddTeam = (e) => {
    e.preventDefault();
    if (!teamForm.title || !teamForm.leader || teamForm.members.length === 0)
      return;
    setTeams((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: teamForm.title,
        members: teamForm.members.map(Number),
        leader: Number(teamForm.leader),
      },
    ]);
    setTeamForm({ title: "", members: [], leader: "" });
  };

  const handleToggleMember = (id) => {
    setTeamForm((f) => {
      const idStr = id.toString();
      const exists = f.members.includes(idStr);
      const newMembers = exists
        ? f.members.filter((m) => m !== idStr)
        : [...f.members, idStr];
      return {
        ...f,
        members: newMembers,
        leader: newMembers.includes(f.leader) ? f.leader : "",
      };
    });
  };

  return (
    <div className="p-8 ">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      <form
        className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end mb-8 bg-slate-50 p-6 rounded-xl border"
        onSubmit={handleAddUser}
      >
        <div className="md:col-span-1">
          <Input
            placeholder="Name"
            value={newUser.name}
            onChange={(e) =>
              setNewUser((u) => ({ ...u, name: e.target.value }))
            }
            required
          />
        </div>
        <div className="md:col-span-2">
          <Input
            placeholder="Email"
            type="email"
            value={newUser.email}
            onChange={(e) =>
              setNewUser((u) => ({ ...u, email: e.target.value }))
            }
            required
          />
        </div>
        <div className="md:col-span-1">
          <Input
            placeholder="Phone"
            value={newUser.phone}
            onChange={(e) =>
              setNewUser((u) => ({ ...u, phone: e.target.value }))
            }
          />
        </div>
        <div className="md:col-span-1 flex items-center gap-2">
          <span className="text-xs">Active</span>
          <Switch
            checked={newUser.active}
            onCheckedChange={(v) => setNewUser((u) => ({ ...u, active: v }))}
          />
        </div>
        <div className="md:col-span-1">
          <Select
            value={newUser.role}
            onValueChange={(value) =>
              setNewUser((u) => ({ ...u, role: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-1">
          <Button
            type="submit"
            className="w-full"
            loading={fetching && fetchType == "addUser"}
            disabled={fetching && fetchType == "addUser"}
          >
            Add User
          </Button>
        </div>
      </form>
      <div className="mb-10">
        <h3 className="font-semibold mb-2">Users</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-xl">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-sm">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-center">Active</th>
                <th className="p-2 text-center">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.phone}</td>
                  <td className="p-2 text-center">
                    <Switch
                      checked={u.active}
                      onCheckedChange={() => handleToggleActive(u.id)}
                    />
                  </td>
                  <td className="p-2 text-center">
                    <Badge>
                      {ROLES.find((r) => r.value === u.role)?.label || u.role}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-6 mt-12">Team Management</h2>
      <form
        className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-8 bg-slate-50 p-6 rounded-xl border"
        onSubmit={handleAddTeam}
      >
        <div className="md:col-span-2">
          <Input
            placeholder="Team Title"
            value={teamForm.title}
            onChange={(e) =>
              setTeamForm((f) => ({ ...f, title: e.target.value }))
            }
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium mb-1">Team Members</label>
          <div className="relative">
            <button
              type="button"
              className="w-full border rounded px-2 py-2 text-left bg-white"
              onClick={() => setShowMembersDropdown((v) => !v)}
            >
              {teamForm.members.length === 0
                ? "Select team members..."
                : users
                    .filter((u) => teamForm.members.includes(u.id.toString()))
                    .map((u) => u.name)
                    .join(", ")}
            </button>
            {showMembersDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-48 overflow-y-auto">
                {users.map((u) => {
                  const idStr = u.id.toString();
                  return (
                    <label
                      key={u.id}
                      className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={teamForm.members.includes(idStr)}
                        onChange={() => handleToggleMember(idStr)}
                        className="mr-2"
                      />
                      {u.name}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Click to select multiple members
          </div>
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs font-medium mb-1">Team Leader</label>
          <Select
            value={teamForm.leader}
            onValueChange={(value) =>
              setTeamForm((f) => ({ ...f, leader: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Leader" />
            </SelectTrigger>
            <SelectContent>
              {users
                .filter((u) => teamForm.members.includes(u.id.toString()))
                .map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-1">
          <Button type="submit" className="w-full">
            Add Team
          </Button>
        </div>
      </form>
      <div>
        <h3 className="font-semibold mb-2">Teams</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-xl">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-sm">
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Members</th>
                <th className="p-2 text-left">Leader</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="p-2 font-semibold">{t.title}</td>
                  <td className="p-2">
                    {t.members
                      .map((mid) => users.find((u) => u.id === mid)?.name)
                      .filter(Boolean)
                      .join(", ")}
                  </td>
                  <td className="p-2">
                    {users.find((u) => u.id === t.leader)?.name || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
