import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createUser } from "../../../state/userSlice/userSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiUser,
  FiLock,
  FiMail,
  FiPhone,
  FiChevronDown,
  FiEdit,
  FiTrash2,
  FiShield, // Icon for admin/staff status
  FiActivity, // Icon for active status
  FiAward, // Icon for superadmin
  FiPlus,
} from "react-icons/fi";
import { PulseLoader } from "react-spinners";
import axios from "axios";
import Swal from "sweetalert2";
import RoleManagement from "./RoleManagement";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CreateUser = () => {
  const dispatch = useDispatch();
  const { loading: createLoading } = useSelector((state) => state.user);
  const { accessToken } = useSelector((state) => state.user);

  const [users, setUsers] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  const initialFormData = {
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    role: "",
    password: "",
    password_confirm: "",
    // ++ Add boolean flags
    is_active: true, // Default to true for new users
    is_staff: false,
    is_admin: false, // Assuming this is what 'is_admin' from API maps to Django's is_staff
    is_superadmin: false, // Assuming this is what 'is_superadmin' from API maps to Django's is_superuser
  };
  const [formData, setFormData] = useState(initialFormData);

  const fetchUsers = async () => {
    setListLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/user/user/`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch users");
      }
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setListError(err.message);
      toast.error(`خطا در دریافت لیست کاربران: ${err.message}`);
    } finally {
      setListLoading(false);
    }
  };
const fetchRoles = async () => {
  setListLoading(true);
  try {
    const response = await fetch(`${BASE_URL}/user/role/`);
    const data = await response.json();
    console.log("Roles API response:", data);
    setRoles(data);
  } catch (err) {
    setListError(err.message);
    toast.error(`خطا در دریافت لیست کاربران: ${err.message}`);
  } finally {
    setListLoading(false);
  }
};


  useEffect(() => {
    fetchRoles();
  }, []);
  useEffect(() => {
    if (accessToken) {
      fetchUsers();
    }
  }, [accessToken]);

  const handleModalOpen = (userToEdit = null) => {
    if (userToEdit) {
      setEditingUserId(userToEdit.id);
      setFormData({
        first_name: userToEdit.first_name || "",
        last_name: userToEdit.last_name || "",
        email: userToEdit.email || "",
        phone_number: userToEdit.phone_number || "",
        role: String(userToEdit.role) || "",
        password: "",
        password_confirm: "",
        // ++ Populate boolean flags from userToEdit
        is_active: !!userToEdit.is_active, // Use !! to ensure boolean
        is_staff: !!userToEdit.is_staff,
        is_admin: !!userToEdit.is_admin, // Or map is_staff to is_admin if they are the same
        is_superadmin: !!userToEdit.is_superadmin,
      });
    } else {
      setEditingUserId(null);
      setFormData(initialFormData); // Resets to defaults including is_active: true
    }
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingUserId(null);
    setFormData(initialFormData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target; // Destructure type and checked
    setFormData({
      ...formData,
      // ++ Handle checkboxes correctly
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.password && formData.password !== formData.password_confirm) {
      toast.error("گذرواژه و تکرار آن مطابقت ندارند!");
      setIsSubmitting(false);
      return;
    }

    if (editingUserId) {
      // --- Edit User ---
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        role: parseInt(formData.role),
        // ++ Include boolean flags in updateData
        is_active: formData.is_active,
        is_staff: formData.is_staff,
        // Your API shows 'is_admin', if your Django model uses 'is_staff' for this, send 'is_staff'
        // If 'is_admin' is a custom field AND you also have 'is_staff', send both.
        // Based on your API output, it seems 'is_admin' is a direct field.
        is_admin: formData.is_admin,
        is_superadmin: formData.is_superadmin,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      try {
        await axios.patch(
          `${BASE_URL}/user/user/${editingUserId}/`,
          updateData
        );
        toast.success("کاربر با موفقیت ویرایش شد!");
        fetchUsers();
        handleModalClose();
      } catch (err) {
        const errorMsg =
          err.response?.data?.detail ||
          JSON.stringify(err.response?.data) || // Stringify to see full error object
          err.message ||
          "خطای ناشناخته";
        toast.error(`خطا در ویرایش کاربر: ${errorMsg}`);
      }
    } else {
      // --- Create User ---
      if (!formData.password) {
        toast.error("گذرواژه برای کاربر جدید الزامی است.");
        setIsSubmitting(false);
        return;
      }
      // Prepare data for creation, including new boolean flags
      // Ensure your `createUser` thunk and backend endpoint can handle these fields
      const createPayload = {
        ...formData,
        role: parseInt(formData.role),
        // is_active, is_staff, is_admin, is_superadmin are already in formData
      };

      try {
        await dispatch(createUser(createPayload)).unwrap();
        fetchUsers();
        handleModalClose();
        toast.success("کاربر با موفقیت ایجاد شد!");
      } catch (err) {
        toast.error(
          `خطا در ایجاد کاربر: ${
            err?.detail || JSON.stringify(err) || "خطای ناشناخته"
          }`
        );
      }
    }
    setIsSubmitting(false);
  };

  const handleDeleteClick = async (userId, userName) => {
    Swal.fire({
      title: `آیا از حذف کاربر "${userName}" مطمئن هستید؟`,
      text: "این عملیات قابل بازگشت نیست!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "بله، حذف کن!",
      cancelButtonText: "لغو",
      customClass: { popup: "font-vazir" },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsSubmitting(true);
          await axios.delete(`${BASE_URL}/user/user/${userId}/`);
          toast.success(`کاربر "${userName}" با موفقیت حذف شد.`);
          fetchUsers();
        } catch (err) {
          const errorMsg =
            err.response?.data?.detail || err.message || "خطای ناشناخته";
          toast.error(`خطا در حذف کاربر: ${errorMsg}`);
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  return (
    <div
      className="w-full max-w-8xl mx-auto p-6 space-y-8 font-vazir"
      dir="rtl"
    >
      <ToastContainer
        position="top-center"
        autoClose={5000}
        rtl={true}
        theme="colored"
        bodyClassName="font-vazir"
      />
<RoleManagement/>
      <div className="flex justify-end">
        <button
          onClick={() => handleModalOpen()}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
          disabled={isSubmitting || listLoading}
        >
          <FiPlus className="text-lg" />
          ایجاد کاربر جدید
        </button>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">لیست کاربران</h2>
        </div>

        {listLoading ? (
          <div className="p-8 text-center text-gray-500">
            <PulseLoader size={10} color="#3B82F6" />
            <p className="mt-4">در حال دریافت کاربران...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            هیچ کاربری یافت نشد
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-600 text-white text-sm">
                <tr>
                  <th className="px-4 py-3 font-medium text-center w-20"></th>
                  <th className="px-4 py-3 font-medium text-right">
                    نام کاربر
                  </th>
                  <th className="px-4 py-3 font-medium text-right">ایمیل</th>
                  <th className="px-4 py-3 font-medium text-right">نقش</th>
                  <th className="px-4 py-3 font-medium text-center">وضعیت</th>
                  {/* You might want to add columns for is_admin, is_staff here too */}
                  <th className="px-4 py-3 font-medium text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-center">
                      {user.profile_pic_url ? (
                        <img
                          src={`${BASE_URL}${user.profile_pic_url}`}
                          alt={`${user.first_name} ${user.last_name}`}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm mx-auto"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mx-auto">
                          {user.first_name?.[0]?.toUpperCase()}
                          {user.last_name?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                        {roles.find((role) => role.id == user.role)?.name ||
                          "نا مشخص"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          user.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.is_active ? "فعال" : "غیرفعال"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center items-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleModalOpen(user)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
                          title="ویرایش کاربر"
                          disabled={isSubmitting}
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(
                              user.id,
                              `${user.first_name} ${user.last_name}`
                            )
                          }
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="حذف کاربر"
                          disabled={isSubmitting}
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl md:max-w-3xl lg:max-w-4xl shadow-lg mx-auto max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                {editingUserId ? "ویرایش کاربر" : "ایجاد کاربر جدید"}
              </h3>
              <button
                onClick={handleModalClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {[
                  {
                    icon: FiUser,
                    name: "first_name",
                    label: "نام",
                    type: "text",
                  },
                  {
                    icon: FiUser,
                    name: "last_name",
                    label: "نام خانوادگی",
                    type: "text",
                  },
                  {
                    icon: FiMail,
                    name: "email",
                    label: "ایمیل",
                    type: "email",
                  },
                  {
                    icon: FiPhone,
                    name: "phone_number",
                    label: "شماره تماس (اختیاری)",
                    type: "tel",
                  },
                  {
                    icon: FiChevronDown,
                    name: "role",
                    label: "نقش",
                    type: "select",
                    options: roles,
                  },
                  {
                    icon: FiLock,
                    name: "password",
                    label: "گذرواژه",
                    type: "password",
                    placeholder: editingUserId
                      ? "برای عدم تغییر، خالی بگذارید"
                      : "",
                  },
                  {
                    icon: FiLock,
                    name: "password_confirm",
                    label: "تکرار گذرواژه",
                    type: "password",
                    placeholder: editingUserId
                      ? "برای عدم تغییر، خالی بگذارید"
                      : "",
                  },
                ].map((field) => (
                  <div key={field.name} className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700 block">
                      {field.label}
                      {!editingUserId &&
                        field.name !== "phone_number" &&
                        field.type !== "select" &&
                        // For create, password and confirm are required
                        (field.name !== "password" &&
                        field.name !== "password_confirm"
                          ? true
                          : formData.password || formData.password_confirm) && (
                          <span className="text-red-500 mr-1">*</span>
                        )}
                      {editingUserId &&
                        (field.name === "first_name" ||
                          field.name === "last_name" ||
                          field.name === "email" ||
                          field.name === "role") && ( // Role can be required for edit too
                          <span className="text-red-500 mr-1">*</span>
                        )}
                    </label>
                    <div className="relative">
                      <field.icon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      {field.type === "select" ? (
                        <select
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white text-sm"
                          required={!editingUserId || field.name === "role"}
                        >
                          <option value="">انتخاب کنید</option>
                          {field.options.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                          placeholder={field.placeholder || field.label}
                          required={
                            // Not required: phone_number
                            field.name !== "phone_number" &&
                            // Not required for edit: password, password_confirm (unless one is filled)
                            !(
                              editingUserId &&
                              (field.name === "password" ||
                                field.name === "password_confirm") &&
                              !formData.password &&
                              !formData.password_confirm
                            ) &&
                            // Required for create (except phone_number)
                            (!editingUserId ||
                              field.name === "first_name" ||
                              field.name === "last_name" ||
                              field.name === "email" ||
                              field.name === "role")
                          }
                        />
                      )}
                    </div>
                  </div>
                ))}

                {/* ++ Boolean Flag Checkboxes ++ */}
                {/* Group them for better UI */}
                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
                  {/* is_active */}
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      name="is_active"
                      id="is_active_checkbox" // Unique ID
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="is_active_checkbox"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <FiActivity className="ml-1 w-4 h-4 text-gray-500" /> فعال
                    </label>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 flex gap-3 justify-end pt-5 border-t mt-5">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-5 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md border border-gray-300 transition-all"
                  disabled={isSubmitting}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || createLoading}
                  className="px-5 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-60 transition-all flex items-center justify-center min-w-[100px]"
                >
                  {isSubmitting ? (
                    <PulseLoader size={8} color="#fff" />
                  ) : editingUserId ? (
                    "ذخیره تغییرات"
                  ) : (
                    "ایجاد کاربر"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    
    </div>
  );
};
export default CreateUser;
