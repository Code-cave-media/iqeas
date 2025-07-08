/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const ROLES = [
  { value: "rfq", label: "RFQ" },
  { value: "working", label: "Working" },
  { value: "estimation", label: "Estimation" },
  { value: "document", label: "Document" },
  { value: "admin", label: "Admin" },
];

export default function AdminMembers() {
  // User state
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

  // Add user
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    setUsers((prev) => [...prev, { ...newUser, id: Date.now() }]);
    setNewUser({ name: "", email: "", phone: "", active: true, role: "rfq" });
  };

  // Toggle user active
  const handleToggleActive = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
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

  // Handle team member selection
  const handleTeamMemberChange = (e) => {
    const options = Array.from(e.target.selectedOptions).map(
      (o: any) => o.value
    );
    setTeamForm((f) => ({
      ...f,
      members: options,
      leader: options.includes(f.leader) ? f.leader : "",
    }));
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
          <select
            className="w-full border rounded px-2 py-2 min-h-[38px]"
            value={newUser.role}
            onChange={(e) =>
              setNewUser((u) => ({ ...u, role: e.target.value }))
            }
            required
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-1">
          <Button type="submit" className="w-full">
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
          <select
            multiple
            className="w-full border rounded px-2 py-1 min-h-[38px]"
            value={teamForm.members}
            onChange={handleTeamMemberChange}
            required
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <div className="text-xs text-slate-500 mt-1">
            Hold Ctrl/Cmd to select multiple
          </div>
        </div>
        <div className="md:col-span-1">
          <select
            className="w-full border rounded px-2 py-1 min-h-[38px]"
            value={teamForm.leader}
            onChange={(e) =>
              setTeamForm((f) => ({ ...f, leader: e.target.value }))
            }
            required
          >
            <option value="">Select Leader</option>
            {users
              .filter((u) => teamForm.members.includes(u.id.toString()))
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>
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
