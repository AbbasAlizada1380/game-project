import { useState } from "react";
import { floors, months, years } from "./rentConstant";
import { FiSearch } from "react-icons/fi";

export const RentForm = ({
  form,
  handleChange,
  handleSubmit,
  editingId,
  setIsFormVisible,
}) => {
  // State for each dropdown
  const [isFloorOpen, setIsFloorOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  // Search states
  const [floorSearch, setFloorSearch] = useState("");
  const [monthSearch, setMonthSearch] = useState("");
  const [yearSearch, setYearSearch] = useState("");

  // Handlers for toggling dropdowns
  const toggleFloorDropdown = () => setIsFloorOpen(!isFloorOpen);
  const toggleMonthDropdown = () => setIsMonthOpen(!isMonthOpen);
  const toggleYearDropdown = () => setIsYearOpen(!isYearOpen);

  // Filtering options based on search input
  const filteredFloors = floors.filter((f) => f.label.includes(floorSearch));
  const filteredMonths = months.filter((m) => m.label.includes(monthSearch));
  const filteredYears = years.filter((y) => y.toString().includes(yearSearch));

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 bg-white p-6 rounded-lg shadow-md"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Floor Selection */}
        <div className="relative">
          <button
            type="button"
            className="focus:outline-none focus:ring border ring-primary bg-gray-200 rounded w-full text-gray-800  border-gray-400 py-2 px-3"
            onClick={toggleFloorDropdown}
          >
            {form.floor
              ? floors.find((f) => f.value === form.floor)?.label
              : "انتخاب طبقه"}
          </button>
          {isFloorOpen && (
            <div className="absolute w-full bg-white rounded-md text-black border border-gray-300 shadow-lg z-10">
              <input
                type="text"
                placeholder="جستجو طبقه..."
                className="focus:outline-none border-b w-full text-gray-800 bg-white border-gray-500 py-2 px-3"
                value={floorSearch}
                onChange={(e) => setFloorSearch(e.target.value)}
              />
              <ul className="max-h-[250px] overflow-y-auto">
                {filteredFloors.map((f) => (
                  <li
                    key={f.value}
                    className="py-2 px-5 hover:bg-gray-200 border-b text-gray-800 cursor-pointer"
                    onClick={() => {
                      handleChange({
                        target: { name: "floor", value: f.value },
                      });
                      setIsFloorOpen(false);
                    }}
                  >
                    {f.label}
                  </li>
                ))}
                {filteredFloors.length === 0 && (
                  <li className="p-3 text-gray-500">نتیجه‌ای یافت نشد</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Year Selection */}
        <div className="relative">
          <button
            type="button"
            className="focus:outline-none focus:ring border ring-primary rounded w-full text-gray-800 bg-gray-200 cursor-pointer border-gray-400 py-2 px-3"
            onClick={toggleYearDropdown}
          >
            {form.year ? form.year : "انتخاب سال"}
          </button>
          {isYearOpen && (
            <div className="absolute w-full bg-white rounded-md text-black border border-gray-300 shadow-lg z-10">
              <input
                type="text"
                placeholder="جستجو سال..."
                className="focus:outline-none border-b w-full text-gray-800 bg-white border-gray-500 py-2 px-3"
                value={yearSearch}
                onChange={(e) => setYearSearch(e.target.value)}
              />
              <ul className="max-h-[250px] overflow-y-auto">
                {filteredYears.map((y) => (
                  <li
                    key={y}
                    className="py-2 px-5 hover:bg-gray-200 border-b text-gray-800 cursor-pointer"
                    onClick={() => {
                      handleChange({ target: { name: "year", value: y } });
                      setIsYearOpen(false);
                    }}
                  >
                    {y}
                  </li>
                ))}
                {filteredYears.length === 0 && (
                  <li className="p-3 text-gray-500">نتیجه‌ای یافت نشد</li>
                )}
              </ul>
            </div>
          )}
        </div>
        {/* Month Selection */}
        <div className="relative">
          <button
            type="button"
            className="focus:outline-none focus:ring border ring-primary rounded w-full text-gray-800 bg-gray-200 cursor-pointer border-gray-400 py-2 px-3"
            onClick={toggleMonthDropdown}
          >
            {form.time
              ? months.find((m) => m.value === form.time)?.label
              : "انتخاب ماه"}
          </button>
          {isMonthOpen && (
            <div className="absolute w-full bg-white rounded-md text-black border border-gray-300 shadow-lg z-10">
              <input
                type="text"
                placeholder="جستجو ماه..."
                className="focus:outline-none border-b w-full text-gray-800 bg-white border-gray-500 py-2 px-3"
                value={monthSearch}
                onChange={(e) => setMonthSearch(e.target.value)}
              />
              <ul className="max-h-[250px] overflow-y-auto">
                {filteredMonths.map((m) => (
                  <li
                    key={m.value}
                    className="py-2 px-5 hover:bg-gray-200 border-b text-gray-800 cursor-pointer"
                    onClick={() => {
                      handleChange({
                        target: { name: "time", value: m.value },
                      });
                      setIsMonthOpen(false);
                    }}
                  >
                    {m.label}
                  </li>
                ))}
                {filteredMonths.length === 0 && (
                  <li className="p-3 text-gray-500">نتیجه‌ای یافت نشد</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-center gap-5">
        <button
          type="submit"
          className="bg-green-500 cursor-pointer hover:bg-green-600 justify-center text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-all"
        >
          {editingId ? "ویرایش" : "اضافه کردن"}
        </button>
        <button
          onClick={() => setIsFormVisible(false)}
          className="bg-red-600 text-white cursor-pointer hover:bg-red-700 py-2 px-4 rounded-md"
        >
          انصراف
        </button>
      </div>
    </form>
  );
};
