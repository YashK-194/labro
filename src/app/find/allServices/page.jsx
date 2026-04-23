"use client";

import React from "react";
import { useRouter } from "next/navigation";

import CarpenterIcon from "../../../assets/icons/quick_search/Carpenter.png";
import MistryIcon from "../../../assets/icons/quick_search/Mistry.png";
import PlumberIcon from "../../../assets/icons/quick_search/Plumber.png";
import ElectricianIcon from "../../../assets/icons/quick_search/Electrician.png";
import LaborIcon from "../../../assets/icons/quick_search/Labor.png";
import PainterIcon from "../../../assets/icons/quick_search/Painter.png";
import MaidIcon from "../../../assets/icons/quick_search/Maid.png";
import HalwaiIcon from "../../../assets/icons/quick_search/Halwai.png";
import ShiftingIcon from "../../../assets/icons/quick_search/Shifting.png";

const AllServices = () => {
  const router = useRouter();

  const handleServiceClick = (service) => {
    router.push(
      `/find/searchResults?page=1&query=${encodeURIComponent(service)}`
    );
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
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBackClick}
            className="group flex items-center gap-2 px-4 py-2 bg-white text-teal-700 rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 hover:shadow-xl transition-all duration-200"
          >
            <svg
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          <div>
            <h1 className="text-3xl font-bold text-teal-600">All Services</h1>
            <p className="text-gray-600 mt-1">
              सभी सेवाएँ - Choose from our wide range of services
            </p>
          </div>
        </div>

        {/* Services Grid - 3 rows x 3 columns */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
          {services.map(({ name, icon }) => (
            <div
              key={name}
              onClick={() => handleServiceClick(name)}
              className="group bg-white p-4 sm:p-8 text-center rounded-2xl shadow-lg border border-gray-200 cursor-pointer hover:bg-gray-50 hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <div className="relative">
                {/* Icon Container */}
                <div className="w-16 h-16 sm:w-28 sm:h-28 mx-auto mb-3 sm:mb-6 bg-teal-100 rounded-2xl flex items-center justify-center group-hover:bg-teal-200 transition-all duration-200 shadow-lg">
                  <img
                    src={icon.src}
                    alt={name}
                    className="w-10 h-10 sm:w-20 sm:h-20 transform group-hover:scale-110 transition-transform duration-200"
                  />
                </div>

                {/* Service Name */}
                <span className="text-base sm:text-xl font-semibold text-teal-600 group-hover:text-teal-700 transition-all block">
                  {name}
                </span>

                {/* Hover Indicator */}
                <div className="mt-2 sm:mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-center gap-1 text-teal-600 text-sm sm:text-base font-medium">
                    <span className="hidden sm:inline">Search {name}</span>
                    <span className="sm:hidden">Search</span>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Find Local Service Providers
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Connect with skilled professionals in your area. All services are
              provided by verified local workers who are ready to help you with
              your needs at fair prices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllServices;
