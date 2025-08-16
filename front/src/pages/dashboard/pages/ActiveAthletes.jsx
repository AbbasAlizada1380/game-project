import React, { useEffect, useState } from "react";
const BASE_URL = import.meta.env.VITE_BASE_URL;
const ActiveAthletes = () => {
  const [fees, setFees] = useState([]);
  const [athletes, setAthletes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feesRes, athletesRes] = await Promise.all([
          fetch(`${BASE_URL}/core/fees/`),
          fetch(`${BASE_URL}/core/athletes/`),
        ]);

        const feesData = await feesRes.json();
        const athletesData = await athletesRes.json();

        const today = new Date();
        const date30DaysAgo = new Date(today.setDate(today.getDate() - 30));

        // Filter fees in last 30 days
        const filteredFees = feesData.filter((fee) => {
          const feeDate = new Date(fee.starting_date);
          return feeDate >= date30DaysAgo;
        });

        // Merge athlete info into each fee
        const enrichedFees = filteredFees.map((fee) => {
          const athlete = athletesData.find((a) => a.id === fee.athlete);
          return { ...fee, athlete };
        });

        setFees(enrichedFees);
        setAthletes(athletesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <div className="p-5 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-300 pb-2 text-center">
          ورزشکاران فعال (۳۰ روز گذشته)
        </h2>
        {fees.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-lg">
            ورزشکار فعالی یافت نشد.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-lg p-5 bg-white">
            <table className="min-w-full ">
              <thead className="border-b text-center border-gray-300">
                <tr className="hover:bg-opacity-90 transition duration-300 bg-stone-200">
                  {[
                    "تصویر ورزشکار",
                    "نام ورزشکار",
                    "تاریخ شروع",
                    "فیس",
                    "فیس گرفته‌شده",
                    "فیس باقی",
                    "روزهای باقی‌مانده",
                  ].map((header) => (
                    <th
                      key={header}
                      className="text-gray-700 font-semibold  px-4 py-3"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {fees
                  .slice() // make a shallow copy to avoid mutating original data
                  .sort((a, b) => {
                    // Calculate remaining days for a
                    const aStartingDate = new Date(a.starting_date);
                    const aExpiryDate = new Date(aStartingDate);
                    aExpiryDate.setDate(aExpiryDate.getDate() + 30);
                    const aDiff = aExpiryDate - new Date();
                    const aRemainingDays =
                      aDiff > 0 ? Math.ceil(aDiff / (1000 * 60 * 60 * 24)) : 0;

                    // Calculate remaining days for b
                    const bStartingDate = new Date(b.starting_date);
                    const bExpiryDate = new Date(bStartingDate);
                    bExpiryDate.setDate(bExpiryDate.getDate() + 30);
                    const bDiff = bExpiryDate - new Date();
                    const bRemainingDays =
                      bDiff > 0 ? Math.ceil(bDiff / (1000 * 60 * 60 * 24)) : 0;

                    // Sort ascending by remaining days (smallest first)
                    return aRemainingDays - bRemainingDays;
                  })
                  .map((fee) => {
                    const startingDate = new Date(fee.starting_date);
                    const expiryDate = new Date(startingDate);
                    expiryDate.setDate(expiryDate.getDate() + 30);

                    const today = new Date();
                    const diffTime = expiryDate - today;
                    const diffDays = Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24)
                    );
                    const remainingDays = diffDays > 0 ? diffDays : 0;

                    return (
                      <tr
                        key={fee.id}
                        className={`hover:bg-gray-50 transition-colors text-center cursor-pointer ${
                          fee.id % 2 === 0 ? "bg-gray-100" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3 border-gray-200 text-center">
                          {fee.athlete?.picture ? (
                            <img
                              src={fee.athlete.picture}
                              alt={`${fee.athlete.name} ${fee.athlete.last_name}`}
                              className="h-10 w-10 rounded-full object-cover shadow-sm mx-auto"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs font-semibold mx-auto">
                              بدون تصویر
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-gray-800 font-medium ">
                          {fee.athlete?.name || "نامشخص"}{" "}
                          {fee.athlete?.last_name || ""}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {fee.starting_date}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {fee.fee}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {fee.taken}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {fee.remainder}
                        </td>
                        <td className="px-4 py-2 text-gray-600  font-semibold">
                          {remainingDays > 0 ? remainingDays : "تمام شده"}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveAthletes;
