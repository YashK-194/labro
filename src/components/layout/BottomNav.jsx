'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SearchIcon from '../../assets/icons/Search_icon_R.png';
import ProfileIcon from '../../assets/icons/Profile_icon_R.png';
import ToolIcon from '../../assets/icons/Tool_icon_R.png';
import useNavigation from '../../hooks/use-navigation';
import useScrollingEffect from '../../hooks/use-scroll';

const BottomNav = () => {
  const scrollDirection = useScrollingEffect();
  const navClass = scrollDirection === 'up' ? '' : 'opacity-65 duration-500';
  const { isFindActive, isListActive, isProfileActive } = useNavigation();

  const NavLink = ({ href, icon, label, isActive }) => (
    <Link
      href={href}
      className="flex flex-col items-center justify-center flex-1 group"
    >
      <div
        className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl transition-all duration-300 ${
          isActive 
            ? 'bg-teal-600 shadow-lg scale-110' 
            : 'bg-gray-100 group-hover:bg-gray-200 group-hover:scale-105'
        }`}
      >
        <Image
          src={icon}
          alt={`${label} icon`}
          width={16}
          height={16}
          className={`sm:w-5 sm:h-5 transition-all duration-300 ${
            isActive ? 'filter brightness-0 invert' : 'opacity-60 group-hover:opacity-80'
          }`}
        />
      </div>
      <span
        className={`text-xs font-medium mt-1 sm:mt-2 transition-all duration-300 ${
          isActive ? 'text-teal-600 scale-105' : 'text-gray-500 group-hover:text-gray-700'
        }`}
      >
        {label}
      </span>
    </Link>
  );

  return (
    <div
      className={`fixed bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 py-2 sm:py-3 z-50 bg-white/80 backdrop-blur-lg border border-gray-200 shadow-2xl rounded-2xl sm:rounded-3xl transition-all duration-500 ${navClass}`}
    >
      <div className="flex flex-row justify-around items-center w-full px-1 sm:px-2">
        <NavLink
          href="/find"
          icon={SearchIcon}
          label="Find"
          isActive={isFindActive}
        />
        <NavLink
          href="/list"
          icon={ToolIcon}
          label="List"
          isActive={isListActive}
        />
        <NavLink
          href="/profile"
          icon={ProfileIcon}
          label="Profile"
          isActive={isProfileActive}
        />
      </div>
    </div>
  );
};

export default BottomNav;
