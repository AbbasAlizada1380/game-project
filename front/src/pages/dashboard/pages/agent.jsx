import { useState } from "react";

const Agent = () => {
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: "Ali Khan",
      email: "ali@example.com",
      phoneNumber: "0790001111",
      profilePic: "",
      location: "Kabul",
    },
    {
      id: 2,
      name: "Hassan Rahimi",
      email: "hassan@example.com",
      phoneNumber: "0782223333",
      profilePic: "",
      location: "Herat",
    },
    {
      id: 3,
      name: "Sara Ahmadi",
      email: "sara@example.com",
      phoneNumber: "0775556666",
      profilePic: "",
      location: "Mazar",
    },
  ]);

  // New agent state
  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    profilePic: "",
    location: "",
  });

  // Handle input change
  const handleChange = (e) => {
    setNewAgent({ ...newAgent, [e.target.name]: e.target.value });
  };

  // Handle profile picture change
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAgent({ ...newAgent, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addAgent = () => {
    if (
      !newAgent.name ||
      !newAgent.email ||
      !newAgent.phoneNumber ||
      !newAgent.location
    )
      return;
    setAgents([...agents, { id: agents.length + 1, ...newAgent }]);
    setNewAgent({
      name: "",
      email: "",
      phoneNumber: "",
      profilePic: "",
      location: "",
    });
  };

  return (
    <div className="p-4 bg-white text-gray-900 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Agents</h1>
      <p className="mb-4">Register, manage, and track Hawala agents.</p>

      <table className="w-full border-collapse border border-gray-300 mb-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Profile</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Location</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr key={agent.id} className="text-center">
              <td className="border p-2">{agent.id}</td>
              <td className="border p-2">
                {agent.profilePic ? (
                  <img
                    src={agent.profilePic}
                    alt="Profile"
                    className="w-10 h-10 rounded-full mx-auto"
                  />
                ) : (
                  "No Image"
                )}
              </td>
              <td className="border p-2">{agent.name}</td>
              <td className="border p-2">{agent.email}</td>
              <td className="border p-2">{agent.phoneNumber}</td>
              <td className="border p-2">{agent.location}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Form to add a new agent */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          name="name"
          placeholder="Agent Name"
          value={newAgent.name}
          onChange={handleChange}
          className="border p-2 rounded w-1/4"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newAgent.email}
          onChange={handleChange}
          className="border p-2 rounded w-1/4"
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          value={newAgent.phoneNumber}
          onChange={handleChange}
          className="border p-2 rounded w-1/4"
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={newAgent.location}
          onChange={handleChange}
          className="border p-2 rounded w-1/4"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleProfilePicChange}
          className="border p-2 rounded w-1/4"
        />
        <button
          onClick={addAgent}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Add Agent
        </button>
      </div>
    </div>
  );
};

export default Agent;
