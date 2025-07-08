import { useState, useEffect } from "react";
import { Plus, Trash } from "lucide-react";
import axios from "axios";

export default function FloorManager() {
  const [floors, setFloors] = useState([]);
  const [newFloor, setNewFloor] = useState("");
  const [rights, setRights] = useState([]);
  const [selectedRights, setSelectedRights] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const floorApiUrl = "http://localhost:8000/api/flats/";
  const rightsApiUrl = "http://localhost:8000/rights/rights/";

  useEffect(() => {
    fetchFloors();
    fetchRights();
  }, []);

  const fetchFloors = async () => {
    try {
      const response = await axios.get(floorApiUrl);
      setFloors(response.data);
    } catch (error) {
      console.error("Error fetching floors:", error);
    }
  };

  const fetchRights = async () => {
    try {
      const response = await axios.get(rightsApiUrl);
      setRights(response.data);
    } catch (error) {
      console.error("Error fetching rights:", error);
    }
  };

  const addOrUpdateFloor = async () => {
    if (newFloor.trim()) {
      try {
        const payload = {
          name_name: newFloor.trim(),
          right: selectedRights, // Ensure it matches API expected format
        };

        if (editIndex !== null) {
          console.log("Updating Floor:", payload);

          const floorToUpdate = floors[editIndex];
          const response = await axios.put(
            `${floorApiUrl}${encodeURIComponent(floorToUpdate.name_name)}/`,
            payload
          );

          // Update local state correctly
          const updatedFloors = [...floors];
          updatedFloors[editIndex] = response.data;
          setFloors(updatedFloors);
          setEditIndex(null);
        } else {
          // Adding a new floor
          const response = await axios.post(floorApiUrl, payload);
          setFloors([...floors, response.data]);
        }

        setNewFloor("");
        setSelectedRights([]);
      } catch (error) {
        console.error("Error adding/updating floor:", error);
      }
    }
  };

  const removeFloor = async (name_name) => {
    try {
      const floorToDelete = floors.find(
        (floor) => floor.name_name === name_name
      );
      if (floorToDelete) {
        await axios.delete(`${floorApiUrl}${encodeURIComponent(name_name)}/`);
        setFloors(floors.filter((floor) => floor.name_name !== name_name));
      }
    } catch (error) {
      console.error("Error deleting floor:", error);
    }
  };

  const startEdit = (index) => {
    setNewFloor(floors[index].name_name);

    // `right` is already an array of IDs, so we can directly use it
    setSelectedRights(floors[index].right || []);

    setEditIndex(index);
  };

  const handleRightSelection = (id) => {
    setSelectedRights((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  return (
    <section className="p-10 bg-white">
      <div className="flex gap-x-5 items-stretch">
        {/* Input and Button */}
        <div className="flex-1 bg-gray-100 rounded-md p-10 mx-auto">
          <div className="flex flex-col items-center mb-4">
            <input
              type="text"
              placeholder="اضافه نمودن منزل"
              value={newFloor}
              onChange={(e) => setNewFloor(e.target.value)}
              className="border border-gray-300 bg-white p-2.5 rounded-lg w-full outline-none transition duration-200"
            />
            {/* Rights Selection */}
            <div className="mb-4 pt-4">
              <h3 className="text-md font-semibold mb-2 text-center text-gray-700">
                انتخاب صاحب امتیاز
              </h3>
              <div className="grid grid-cols-3 pt-2 gap-2">
                {rights.map((right) => (
                  <label
                    key={right.id}
                    className="chec-container flex items-center gap-x-4 bg-gray-50 p-2 rounded-lg shadow border border-gray-200 hover:bg-gray-100 transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRights.includes(right.id)}
                      onChange={() => handleRightSelection(right.id)}
                      className="rounded"
                    />
                    <svg viewBox="0 0 64 64" height="1em" width="2em">
                      <path
                        d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16"
                        pathLength="575.0541381835938"
                        className="path"
                      ></path>
                    </svg>
                    <span className="text-gray-700">{right.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={addOrUpdateFloor}
              className={`flex items-center justify-center gap-1 text-white py-2 px-3.5 rounded-lg transition duration-300 shadow ${
                editIndex !== null
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {editIndex !== null ? (
                "ذخیره"
              ) : (
                <span className="flex gap-x-2">
                  <Plus />
                  <span className="text-white">اضافه نمودن</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Floor List */}
        <div className="flex-1 space-y-1 p-10 rounded-md bg-gray-100 overflow-auto">
          {floors.map((floor, index) => (
            <div
              key={floor.name_name}
              className="flex justify-between items-center p-3 bg-white border-gray-200 rounded-lg border hover:shadow-md transition duration-200"
            >
              <span className="text-gray-800 font-medium">
                {floor.name_name}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => startEdit(index)}
                  className="text-blue-600 hover:text-blue-800 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => removeFloor(floor.name_name)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
