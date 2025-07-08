import { Plus } from "lucide-react";
import { FiSearch } from "react-icons/fi";
import React, { useState } from "react";
import { floors } from "./Hook/rentConstant";
function ServiceForm({
  newService,
  setNewService,
  selectedYear,
  selectedMonth,
  onYearSelect,
  onMonthSelect,
  saveService,
  years,
  shamsiMonths, // Assuming shamsiMonths is an array of strings like ["حمل", "ثور", ...]
  editingService,
  setShowServiceForm,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    floor: false,
    year: false,
    month: false,
  });
  const [searchTerm, setSearchTerm] = useState({
    floor: "",
    year: "",
    month: "",
  });

  // <<< --- UPDATED: Filtering logic for floors --- >>>
  const filteredFloors = floors.filter(
    (
      floor // floor is now an object
    ) => floor.label.toLowerCase().includes(searchTerm.floor.toLowerCase()) // Filter by label
  );
  // Keep other filters the same
  const filteredYears = years.filter((year) =>
    year.toString().includes(searchTerm.year)
  );
  const filteredMonths = shamsiMonths.filter(
    (
      month // month is likely a string label
    ) => month.toLowerCase().includes(searchTerm.month.toLowerCase())
  );
  // <<< --- END UPDATE --- >>>

  // <<<--- Helper to get floor label from value --- >>>
  const getFloorLabel = (value) => {
    // Check if value is not null/undefined and not an empty string
    if (value !== null && value !== undefined && value !== "") {
      const floorObj = floors.find((f) => f.value === value);
      return floorObj ? floorObj.label : `مقدار نامعتبر: ${value}`; // Return label or indicate issue
    }
    return null; // Return null if no valid value is selected
  };
  // <<< --- END HELPER --- >>>

  return (
    <div className="bg-white p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-right">
        {editingService ? "ویرایش سرویس" : "افزودن سرویس جدید"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {["floor", "year", "month"].map((field) => (
          <div key={field} className="relative">
            <button
              type="button"
              className="focus:outline-none cursor-pointer focus:ring border bg-gray-200 ring-primary rounded w-full text-gray-800 border-gray-400 py-2 px-3 text-right" // Added text-right
              onClick={() =>
                setIsDropdownOpen({
                  ...isDropdownOpen,
                  [field]: !isDropdownOpen[field],
                })
              }
            >
              {/* <<< --- UPDATED: Button display logic --- >>> */}
              {field === "floor"
                ? getFloorLabel(newService.floor) || "انتخاب طبقه" // Use helper to get label
                : field === "year"
                ? selectedYear || "انتخاب سال"
                : selectedMonth || "انتخاب ماه"}
              {/* <<< --- END UPDATE --- >>> */}
            </button>
            {isDropdownOpen[field] && (
              <div className="absolute w-full bg-white rounded-md text-black border border-gray-300 shadow-lg z-10 mt-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="جستجو..."
                    className="focus:outline-none border-b w-full text-gray-800 bg-white border-gray-400 py-2 px-3" // Adjusted border
                    value={searchTerm[field]}
                    onChange={(e) =>
                      setSearchTerm({ ...searchTerm, [field]: e.target.value })
                    }
                    autoFocus // Focus on the search input when dropdown opens
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />{" "}
                  {/* Adjusted icon color/position */}
                </div>
                <ul className="max-h-[250px] overflow-y-auto">
                  {/* <<< --- UPDATED: List item rendering and onClick --- >>> */}
                  {(field === "floor"
                    ? filteredFloors // Array of objects
                    : field === "year"
                    ? filteredYears // Array of numbers/strings
                    : filteredMonths
                  ) // Array of strings
                    .map((item) => (
                      <li
                        // Use appropriate key based on item type
                        key={field === "floor" ? item.value : item}
                        className="py-2 px-5 hover:bg-gray-100 border-b border-gray-200 text-gray-800 cursor-pointer text-sm" // Adjusted styles
                        onClick={() => {
                          if (field === "floor") {
                            // Set the VALUE (number) in state
                            setNewService({ ...newService, floor: item.value });
                          }
                          if (field === "year") {
                            onYearSelect({ target: { value: item } });
                          }
                          if (field === "month") {
                            onMonthSelect({ target: { value: item } });
                          }
                          // Close the specific dropdown
                          setIsDropdownOpen({
                            ...isDropdownOpen,
                            [field]: false,
                          });
                        }}
                      >
                        {/* Display LABEL for floor, item itself otherwise */}
                        {field === "floor" ? item.label : item}
                      </li>
                    ))}
                  {/* <<< --- END UPDATE --- >>> */}

                  {/* No results message - Check length of the correct filtered array */}
                  {(field === "floor"
                    ? filteredFloors.length === 0
                    : field === "year"
                    ? filteredYears.length === 0
                    : filteredMonths.length === 0) && (
                    <li className="p-3 text-gray-500 text-sm">
                      نتیجه‌ای یافت نشد
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-5">
        <button
          onClick={saveService}
          className="bg-green-500 cursor-pointer hover:bg-green-600 justify-center text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          {editingService ? "به‌روزرسانی سرویس" : "افزودن سرویس"}
        </button>
        <button
          onClick={() => setShowServiceForm(false)}
          className="bg-red-600 text-white cursor-pointer hover:bg-red-700 py-2 px-4 rounded-md"
        >
          انصراف
        </button>
      </div>
    </div>
  );
}

export default ServiceForm;
