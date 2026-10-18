import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Plus } from 'lucide-react';

/**
 * A compact, searchable dropdown with a search bar at the top,
 * a scrollable list, and support for custom typed entries.
 */
export default function SearchableSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select or type...",
  allowCustom = true,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const isExactMatch = options.some(
    opt => opt.toLowerCase() === searchTerm.toLowerCase().trim()
  );

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleCustomUse = () => {
    if (searchTerm.trim()) {
      onChange(searchTerm.trim());
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm('');
        }}
        className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold bg-white flex items-center justify-between cursor-pointer hover:border-neutral-300 transition-colors shadow-2xs"
      >
        <span className={value ? "text-neutral-900 font-bold" : "text-neutral-400 font-normal"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Input */}
          <div className="p-2 border-b border-neutral-100 bg-neutral-50/70">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredOptions.length > 0) {
                      handleSelect(filteredOptions[0]);
                    } else if (allowCustom && searchTerm.trim()) {
                      handleCustomUse();
                    }
                  }
                }}
                placeholder="Search or type custom..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-medium bg-white focus:outline-none focus:border-neutral-400"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto p-1 text-xs">
            {/* Custom value option if searched text isn't in list */}
            {allowCustom && searchTerm.trim() && !isExactMatch && (
              <div
                onClick={handleCustomUse}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-emerald-800 hover:bg-emerald-50 cursor-pointer font-bold border-b border-neutral-100"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Use custom: <span className="underline">"{searchTerm.trim()}"</span></span>
              </div>
            )}

            {filteredOptions.length === 0 && (!allowCustom || !searchTerm.trim()) && (
              <div className="px-3 py-3 text-center text-[11px] text-neutral-400">
                No matching options found.
              </div>
            )}

            {filteredOptions.map((opt) => {
              const isSelected = value === opt;
              return (
                <div
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-neutral-100 font-bold text-neutral-950' : 'hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
