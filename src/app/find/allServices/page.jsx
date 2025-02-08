'use client';

import React from "react";
import { useRouter } from "next/navigation";

import CarpenterIcon from "../../../icons/quick_search/Carpenter.png";
import MistryIcon from "../../../icons/quick_search/Mistry.png";
import PlumberIcon from "../../../icons/quick_search/Plumber.png";
import ElectricianIcon from "../../../icons/quick_search/Electrician.png";
import LaborIcon from "../../../icons/quick_search/Labor.png";
import PainterIcon from "../../../icons/quick_search/Painter.png";
import MaidIcon from "../../../icons/quick_search/Maid.png";
import HalwaiIcon from "../../../icons/quick_search/Halwai.png";
import ShiftingIcon from "../../../icons/quick_search/Shifting.png";

const AllServices = () => {
  const router = useRouter();

  const handleServiceClick = (service) => {
    router.push(`/find/searchResults?page=1&query=${encodeURIComponent(service)}`);
  };

  const handleBackClick = () => {
    router.push("/find");
  };

  const services = [
    { name: "Labor", icon: LaborIcon },
    { name: "Mistry", icon: MistryIcon },
    { name: "Plumber", icon: PlumberIcon },
    { name: "Carpenter", icon: CarpenterIcon },
    { name: "Painter", icon: PainterIcon },
    { name: "Electrician", icon: ElectricianIcon },
    { name: "Maid", icon: MaidIcon },
    { name: "Halwai", icon: HalwaiIcon },
    { name: "Shifting", icon: ShiftingIcon },
  ];


  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 relative">
      <h1 className="text-2xl font-semibold text-left">All Services (सभी सेवाएँ)</h1>
      <div className="flex justify-start mt-4">
        <button 
          onClick={handleBackClick} 
          className="px-4 py-2 bg-teal-500 text-white text-sm rounded-lg shadow hover:bg-teal-600 transition"
        >
          <b>⇐</b> Back
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6">
        {services.map(({ name, icon }) => (
          <div
            key={name}
            onClick={() => handleServiceClick(name)}
            className="p-4 text-center border border-gray-300 rounded-lg shadow cursor-pointer hover:bg-gray-100 transition"
          >
            <img src={icon.src} alt={name} className="w-12 h-12 mx-auto mb-2" />
            <span className="text-teal-600 font-medium">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllServices;
