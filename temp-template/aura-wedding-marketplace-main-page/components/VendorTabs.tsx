import React from 'react';
import { TabType } from '../types';
import { LayoutGrid, Image, Star, MessageCircle, PlayCircle } from 'lucide-react';

interface VendorTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const VendorTabs: React.FC<VendorTabsProps> = ({ activeTab, onTabChange }) => {
  
  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Přehled', icon: LayoutGrid },
    { id: 'video', label: 'Video', icon: PlayCircle },
    { id: 'gallery', label: 'Galerie', icon: Image },
    // 'Services' removed as they are now in the sticky sidebar
    { id: 'reviews', label: 'Recenze', icon: Star },
    { id: 'contact', label: 'Kontakt', icon: MessageCircle }, 
  ];
  
  return (
    <div className="sticky top-[4.5rem] z-30 bg-[#F5F5F4]/95 backdrop-blur-md py-2 transition-all">
      <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-stone-200 inline-flex max-w-full overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300
                ${isActive 
                  ? 'bg-stone-900 text-white shadow-md' 
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                }
              `}
            >
              <Icon size={16} className={isActive ? 'text-primary-300' : 'text-stone-400'} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};