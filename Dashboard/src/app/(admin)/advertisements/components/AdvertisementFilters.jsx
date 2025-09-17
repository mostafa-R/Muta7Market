"use client";

import { Input } from "@/app/component/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/component/ui/select";
import { ADVERTISEMENT_POSITIONS, ADVERTISEMENT_STATUSES, ADVERTISEMENT_TYPES } from "../utils/constants";

export default function AdvertisementFilters({ filters, onFilterChange }) {
  const handleSelectChange = (filterName, value) => {
    // If the user selects the placeholder value, treat it as an empty string
    onFilterChange(filterName, value === "all" ? "" : value);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="بحث عن إعلان..."
          className="w-full"
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:w-auto md:min-w-[500px]">
        <Select value={filters.type || "all"} onValueChange={(value) => handleSelectChange("type", value)}>
          <SelectTrigger>
            <SelectValue placeholder="جميع الأنواع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            {ADVERTISEMENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.position || "all"} onValueChange={(value) => handleSelectChange("position", value)}>
          <SelectTrigger>
            <SelectValue placeholder="جميع المواقع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المواقع</SelectItem>
            {ADVERTISEMENT_POSITIONS.map((pos) => (
              <SelectItem key={pos.value} value={pos.value}>
                {pos.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.isActive || "all"} onValueChange={(value) => handleSelectChange("isActive", value)}>
          <SelectTrigger>
            <SelectValue placeholder="جميع الحالات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            {ADVERTISEMENT_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
