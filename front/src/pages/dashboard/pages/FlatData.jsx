import { useState, useEffect } from "react";
import axios from "axios";

export default function FlatData() {
  const [floors, setFloors] = useState([]);
  const [totals, setTotals] = useState({});
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchFloors();
  }, []);

  const fetchFloors = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/flats/");
      setFloors(response.data);
      // Fetch totals for each floor after floors are loaded
      response.data.forEach((floor) => {
        fetchTotals(floor.name_name);
      });
    } catch (error) {
      console.error("Error fetching floors:", error);
    }
  };

  const fetchTotals = async (floorName) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/flats/${encodeURIComponent(
          floorName
        )}/totals/`
      );
      setTotals((prevTotals) => ({
        ...prevTotals,
        [floorName]: response.data.totals, // Store totals for each floor by its name
      }));
    } catch (error) {
      console.error("Error fetching totals:", error);
    }
  };

  const handleUpdate = async (floorName) => {
    try {
      await axios.put(
        `http://localhost:8000/api/flats/${encodeURIComponent(
          floorName
        )}/totals/`,
        editData
      );
      fetchTotals(floorName); // Re-fetch totals after update
    } catch (error) {
      console.error("Error updating totals:", error);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div>
        {floors.map((floor) => (
          <div
            key={floor.name_name}
            className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 m-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
          >
            <div className="text-white font-bold text-xl mb-2">
              {floor.name_name}
            </div>
            {/* Check if totals are available for this floor */}
            {totals[floor.name_name] ? (
              <div className="flex flex-wrap gap-4 text-white">
                <span className="bg-white text-blue-500 py-1 px-3 rounded-lg shadow-md">
                  Total Customers: {totals[floor.name_name].total_customers}
                </span>
                <span className="bg-white text-yellow-500 py-1 px-3 rounded-lg shadow-md">
                  Total Remainder: {totals[floor.name_name].total_reminder}
                </span>
                <span className="bg-white text-green-500 py-1 px-3 rounded-lg shadow-md">
                  Total Income: {totals[floor.name_name].total_income}
                </span>
                <span className="bg-white text-red-500 py-1 px-3 rounded-lg shadow-md">
                  Total: {totals[floor.name_name].total_price}
                </span>
              </div>
            ) : (
              <span className="ml-2 text-red-500">Loading totals...</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
