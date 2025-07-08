import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../../../state/userSlice/userSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Setting = () => {
  const { currentUser, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [userSettings, setUserSettings] = useState({
    email: "", // Initialize with empty strings
    phone_number: "",
    old_password: "",
    password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (currentUser) {
      setUserSettings({
        email: currentUser.email || "",
        phone_number: currentUser.phone_number || "",
        old_password: "",
        password: "",
        confirm_password: "",
      });
    }
  }, [currentUser]);

  const handleChange = (field, value) => {
    setUserSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userSettings.password !== userSettings.confirm_password) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      if (!currentUser || !currentUser.id) {
        toast.error("User ID is not available. Please refresh the page.");
        return;
      }

      const userId = currentUser.id;
      const response = await dispatch(
        updateUser({ id: userId, userData: userSettings })
      );

      if (response.payload.success) {
        toast.success("Settings updated successfully!");
      } else {
        toast.error(response.payload.message || "Failed to update settings.");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("An error occurred while updating settings.");
    }
  };

  if (loading) {
    return <div>Loading settings...</div>; // Or a more sophisticated loading indicator
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">⚙️ Settings</h1>
      <p className="text-gray-600 mb-6">
        Configure system preferences, security settings, and notifications.
      </p>

      <form onSubmit={handleSubmit}>
        {/* User Profile */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            👤 User Profile
          </h2>
          <div className="space-y-2">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              className="w-full p-2 border rounded"
              value={userSettings.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <label htmlFor="phone_number">Phone Number:</label>
            <input
              type="text"
              id="phone_number"
              className="w-full p-2 border rounded"
              value={userSettings.phone_number}
              onChange={(e) => handleChange("phone_number", e.target.value)}
            />
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            🔒 Security Settings
          </h2>
          <div className="space-y-2">
            <label htmlFor="old_password">Old Password:</label>
            <input
              type="password"
              id="old_password"
              className="w-full p-2 border rounded"
              value={userSettings.old_password}
              onChange={(e) => handleChange("old_password", e.target.value)}
              placeholder="Enter Old Password"
            />

            <label htmlFor="password">New Password:</label>
            <input
              type="password"
              id="password"
              className="w-full p-2 border rounded"
              value={userSettings.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="Enter New Password"
            />

            <label htmlFor="confirm_password">Confirm New Password:</label>
            <input
              type="password"
              id="confirm_password"
              className="w-full p-2 border rounded"
              value={userSettings.confirm_password}
              onChange={(e) => handleChange("confirm_password", e.target.value)}
              placeholder="Confirm New Password"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Update Settings
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Setting;
