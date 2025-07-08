import React, { useEffect, useState } from "react";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newRoleName, setNewRoleName] = useState("");
  const [editRoleId, setEditRoleId] = useState(null);
  const [editRoleName, setEditRoleName] = useState("");

  // Fetch all roles
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/user/role`);
      setRoles(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Create role
  const createRole = async () => {
    if (!newRoleName.trim()) return alert("Role name cannot be empty");
    try {
      await axios.post(`${BASE_URL}/user/role/  `, { name: newRoleName });
      setNewRoleName("");
      fetchRoles();
    } catch (err) {
      alert("Failed to create role");
    }
  };

  // Start editing a role
  const startEdit = (role) => {
    setEditRoleId(role.id);
    setEditRoleName(role.name);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditRoleId(null);
    setEditRoleName("");
  };

  // Update role
  const updateRole = async () => {
    if (!editRoleName.trim()) return alert("Role name cannot be empty");
    try {
      await axios.put(`${BASE_URL}/user/role/${editRoleId}/`, { name: editRoleName });
      setEditRoleId(null);
      setEditRoleName("");
      fetchRoles();
    } catch (err) {
      alert("Failed to update role");
    }
  };

  // Delete role
  const deleteRole = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await axios.delete(`${BASE_URL}/user/role/${id}/`);
      fetchRoles();
    } catch (err) {
      alert("Failed to delete role");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">مدیریت نقش‌ها</h2>

      {/* New role input */}
      <div className="flex mb-4">
        <input
          type="text"
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          placeholder="نام نقش جدید"
          className="flex-grow border rounded px-3 py-2"
        />
        <button
          onClick={createRole}
          className="bg-blue-600 text-white px-4 rounded mr-2"
        >
          اضافه کردن
        </button>
      </div>

      {loading && <p>در حال بارگذاری...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Roles list */}
      <ul>
        {Array.isArray(roles) &&
          roles.map((role) => (
            <li
              key={role.id}
              className="flex justify-between items-center border-b py-2"
            >
              {editRoleId === role.id ? (
                <>
                  <input
                    type="text"
                    value={editRoleName}
                    onChange={(e) => setEditRoleName(e.target.value)}
                    className="border rounded px-2 py-1 flex-grow"
                  />
                  <button
                    onClick={updateRole}
                    className="text-green-600 mx-2"
                    title="ذخیره"
                  >
                    ذخیره
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-gray-600"
                    title="لغو"
                  >
                    لغو
                  </button>
                </>
              ) : (
                <>
                  <span>{role.name}</span>
                  <div>
                    <button
                      onClick={() => startEdit(role)}
                      className="text-blue-600 mx-2"
                      title="ویرایش"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => deleteRole(role.id)}
                      className="text-red-600"
                      title="حذف"
                    >
                      حذف
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}
