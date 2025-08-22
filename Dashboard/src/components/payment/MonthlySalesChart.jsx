"use client";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlySalesChart() {
  const options = {
    colors: ["#3B82F6"], // Modern blue to match StatisticsChart
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 250,
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%", // Slightly wider bars for better visibility
        borderRadius: 6, // Softer rounded corners
        borderRadiusApplication: "end",
        distributed: false,
      },
    },
    dataLabels: {
      enabled: false, // Keep disabled for clean look
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ],
      axisBorder: { show: true, color: "#D1D5DB" },
      axisTicks: { show: true, color: "#D1D5DB" },
      labels: {
        style: {
          fontSize: "12px",
          colors: "#6B7280",
          fontFamily: "Outfit, sans-serif",
        },
      },
    },
    yaxis: {
      title: {
        text: "Sales (Units)",
        style: {
          fontSize: "14px",
          fontWeight: 500,
          color: "#374151",
          fontFamily: "Outfit, sans-serif",
        },
      },
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
        formatter: (value) => Math.round(value), // Round values for simplicity
      },
    },
    grid: {
      borderColor: "#E5E7EB", // Lighter grid color
      strokeDashArray: 4, // Dashed grid lines for softer look
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    fill: {
      type: "gradient", // Add gradient for modern look
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: ["#93C5FD"], // Lighter blue gradient
        inverseColors: false,
        opacityFrom: 0.9,
        opacityTo: 0.6,
      },
    },
    tooltip: {
      theme: "light",
      style: {
        fontSize: "12px",
        fontFamily: "Outfit, sans-serif",
      },
      y: {
        formatter: (val) => `${val} units`, // Add units for context
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontSize: "14px",
      fontFamily: "Outfit, sans-serif",
      labels: { colors: "#6B7280" },
      markers: { width: 12, height: 12, radius: 12 },
    },
  };

  const series = [
    {
      name: "Sales",
      data: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112],
    },
  ];

  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Monthly Sales
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Sales Performance Overview by Month
          </p>
        </div>
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            aria-label="More options"
          >
            <MoreDotIcon className="h-5 w-5" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-48 rounded-lg bg-white shadow-lg dark:bg-gray-800"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
            >
              View Details
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
            >
              Export Data
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900 dark:hover:text-red-300 transition-colors"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={250}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
}