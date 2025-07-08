
import { Search } from "lucide-react";
import React, { useMemo } from "react";

function CustomerList({
  customers,
  searchTerm,
  onCustomerClick,
  onSearchChange,
  availableFloors,
  selectedFloor,
  onFloorSelect,
}) {
  const filteredCustomers = useMemo(() => {
    if (!customers) {
      return []; 
    }

    const customerArray = Object.entries(customers).map(
      ([customerId, customer]) => ({
        customerId,
        ...customer,
      })
    );

    return customerArray.filter((customer) => {
      const name = customer?.name || "";
      const father_name = customer?.father_name || "";
      const searchTermLower = searchTerm.toLowerCase();
      return (
        name.toLowerCase().includes(searchTermLower) ||
        father_name.toLowerCase().includes(searchTermLower)
      );
    });
  }, [customers, searchTerm]);

  return (
    <div className="w-1/4 bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4 text-right">لیست مشتریان</h2>
      <select
        onChange={(e) => onFloorSelect(e.target.value)}
        className="w-full p-2 border rounded mb-4 text-right"
        value={selectedFloor || ""}
      >
        <option value="">همه طبقات</option>
        {availableFloors.map((floor) => (
          <option key={floor} value={floor}>
            طبقه {floor}
          </option>
        ))}
      </select>

      {/* Search Input */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="جستجو مشتری..."
          className="w-full p-2 border rounded text-right pr-10"
          value={searchTerm}
          onChange={onSearchChange}
        />
        <div className="absolute top-0 right-0 h-full flex items-center pr-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <ul className="overflow-y-auto h-[400px]">
        {filteredCustomers.map((customer) => (
          <li key={customer.customerId} className="mb-4">
            <button
              onClick={() => onCustomerClick(customer.customerId)}
              className="bg-gray-50 p-3 rounded-lg text-right w-full flex items-center gap-3 hover:bg-gray-100 transition-colors"
            >
              {customer.image ? (
                <img
                  src={customer.image}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300"></div>
              )}
              <div>
                <h3 className="font-semibold">{customer.name}</h3>
                <p className="text-gray-500 text-sm">
                  نام پدر: {customer.father_name}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CustomerList;
