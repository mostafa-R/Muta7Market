"use client";

import dynamic from "next/dynamic";
import React from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function PlayersCoachesDashboard() {
  const stats = [
    { label: "Total Players", value: 120 },
    { label: "Total Coaches", value: 35 },
    { label: "Avg Player Age", value: "24.5" },
    { label: "Avg Coach Experience", value: "8 yrs" },
  ];

  const chartOptions: ApexCharts.ApexOptions = {
    chart: { type: "line", height: 300, toolbar: { show: false } },
    colors: ["#3B82F6", "#10B981"],
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    },
    legend: { position: "top" },
  };

  const chartSeries = [
    { name: "Players", data: [20, 25, 30, 40, 45, 50, 55, 60, 65] },
    { name: "Coaches", data: [5, 7, 8, 10, 12, 14, 15, 16, 18] },
  ];

  const tableData = [
    { name: "Mohamed Salah", role: "Player", country: "Egypt" },
    { name: "Ali Hassan", role: "Coach", country: "Morocco" },
    { name: "John Doe", role: "Player", country: "USA" },
    { name: "Khaled Samir", role: "Coach", country: "Egypt" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 text-center"
          >
            <p className="text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={300} />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Latest Players & Coaches</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Country</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, i) => (
              <tr key={i} className="border-b dark:border-gray-700">
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.role}</td>
                <td className="p-2">{item.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
