'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SearchIcon from '../../icons/Search_icon_R.png';
import ProfileIcon from '../../icons/Profile_icon_R.png';
import ToolIcon from '../../icons/Tool_icon_R.png';
import useNavigation from '../hook/use-navigation';
import useScrollingEffect from '../hook/use-scroll';

const BottomNav = () => {
  const scrollDirection = useScrollingEffect();
  const navClass = scrollDirection === 'up' ? '' : 'opacity-65 duration-500';
  const { isFindActive, isListActive, isProfileActive } = useNavigation();

  const NavLink = ({ href, icon, label, isActive }) => (
    <Link
      href={href}
      className="flex flex-col items-center justify-center w-16"
    >
      <div
        className={`flex items-center justify-center w-16 h-7 ${
          isActive ? 'bg-teal-100 rounded-full' : ''
        }`}
      >
        <Image
          src={icon}
          alt={`${label} icon`}
          width={24}
          height={24}
          className={`opacity-100 ${isActive ? 'text-teal-600' : ''}`}
        />
      </div>
      <span
        className={`text-sm font-semibold mt-2 ${
          isActive ? 'text-teal-600' : 'text-gray-500'
        }`}
      >
        {label}
      </span>
    </Link>
  );

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 py-2 z-10 bg-white border border-gray-300 shadow-lg rounded-2xl sm:block ${navClass}`}
    >
      <div className="flex flex-row justify-around items-center w-full">
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
