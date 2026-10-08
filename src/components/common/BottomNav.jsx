import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home,
  Compass, 
  Ticket, 
  User, 
  LayoutDashboard, 
  Layers, 
  CalendarCheck 
} from 'lucide-react';

export default function BottomNav() {
  const { isGuide, currentUser } = useAuth();

  const travellerTabs = [
    { label: 'Home', path: currentUser ? '/dashboard' : '/explore', icon: Home },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Bookings', path: currentUser ? '/bookings' : '/login?role=traveller', icon: Ticket },
    { label: 'Profile', path: currentUser ? '/profile' : '/login?role=traveller', icon: User },
  ];

  const guideTabs = [
    { label: 'Dashboard', path: '/guide/dashboard', icon: LayoutDashboard },
    { label: 'Experiences', path: '/guide/experiences', icon: Layers },
    { label: 'Bookings', path: '/guide/bookings', icon: CalendarCheck },
    { label: 'Profile', path: currentUser ? '/guide/profile' : '/login?role=guide', icon: User },
  ];

  const tabs = isGuide ? guideTabs : travellerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 px-2 py-1.5 md:hidden shadow-lg safe-area-pb">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.label + tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                  isActive
                    ? isGuide
                      ? 'text-guide-primary font-bold scale-105'
                      : 'text-traveller-forestDark font-bold scale-105'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-full ${isActive ? (isGuide ? 'bg-guide-skyBlue' : 'bg-traveller-lightMint') : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5 font-medium">
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
