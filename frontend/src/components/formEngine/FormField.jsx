import { useState, useRef, useEffect, useMemo } from 'react';
import { COUNTRIES } from '../../constants/countries.js';

function toDateInputValue(value) {
  if (!value) return '';
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function FormField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = true,
  placeholder,
  hint,
  error,
}) {
  const displayValue = type === 'date' ? toDateInputValue(value) : value ?? '';

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={name} className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-600">
          <span>
            {label}
            {required && <span className="text-red-500 font-bold ml-1">*</span>}
          </span>
          {!required && <span className="text-[10px] font-normal lowercase tracking-normal text-slate-400">Optional</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          type={type}
          name={name}
          value={displayValue}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-xs transition-all duration-150 focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
              : 'border-slate-200 hover:border-slate-300 focus:border-ifoa-navy focus:ring-ifoa-navy/15'
          }`}
        />
      </div>
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  required = true,
  hint,
  error,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close when scrolling or on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleScroll() {
      setIsOpen(false);
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape' || e.key === 'Tab') {
        setIsOpen(false);
      }
    }

    // Opening the dropdown can itself trigger a scroll (browser scrolling the
    // trigger/popup into view), which would immediately close it if the
    // listener were live already. Defer attaching until that settles.
    const rafId = requestAnimationFrame(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
    });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    onChange({
      target: {
        name,
        value: optionValue,
      },
    });
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return opt.value === value || opt.label === value;
    }
    return opt === value;
  });

  const getDisplayText = () => {
    if (!value) return placeholder;
    if (typeof selectedOption === 'object' && selectedOption !== null) {
      return selectedOption.label;
    }
    return value;
  };

  const isSelected = Boolean(value);

  return (
    <div className="relative flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-600">
          <span>
            {label}
            {required && <span className="text-red-500 font-bold ml-1">*</span>}
          </span>
          {!required && <span className="text-[10px] font-normal lowercase tracking-normal text-slate-400">Optional</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3.5 py-2.5 text-left text-sm shadow-xs transition-all duration-150 focus:outline-none focus:ring-2 cursor-pointer ${
            isOpen
              ? 'border-ifoa-navy ring-2 ring-ifoa-navy/15'
              : error
              ? 'border-red-300 focus:border-red-500'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`min-w-0 truncate ${isSelected ? 'font-medium text-slate-800' : 'text-slate-400'}`} title={getDisplayText()}>
            {getDisplayText()}
          </span>
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-ifoa-navy' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
            {options.length === 0 ? (
              <div className="px-3 py-2.5 text-center text-xs text-slate-400">No options available</div>
            ) : (
              options.map((opt, idx) => {
                const optVal = typeof opt === 'object' && opt !== null ? opt.value : opt;
                const optLabel = typeof opt === 'object' && opt !== null ? opt.label : opt;
                const optSubtitle = typeof opt === 'object' && opt !== null ? opt.subtitle : null;
                const active = value === optVal || value === optLabel;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(optVal)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs sm:text-sm transition-colors cursor-pointer ${
                      active
                        ? 'bg-slate-100 font-semibold text-slate-950'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span>{optLabel}</span>
                      {optSubtitle && <span className="text-[11px] text-slate-400 font-normal">{optSubtitle}</span>}
                    </div>
                    {active && (
                      <svg className="h-4 w-4 text-ifoa-navy shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function CountrySelectField({
  label,
  name,
  value,
  onChange,
  placeholder = 'Select country...',
  required = true,
  hint,
  error,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- loading/reset state at the start of an effect that syncs with an external source
      setSearch('');
      return;
    }

    if (searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    function handleScroll() {
      setIsOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    // Opening the dropdown can itself trigger a scroll (browser scrolling the
    // trigger/popup into view), which would immediately close it if the
    // listener were live already. Defer attaching until that settles.
    const rafId = requestAnimationFrame(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
    });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedCountry = useMemo(() => {
    if (!value) return null;
    return (
      COUNTRIES.find(
        (c) =>
          c.name.toLowerCase() === value.toLowerCase() ||
          c.code.toLowerCase() === value.toLowerCase()
      ) || null
    );
  }, [value]);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.toLowerCase().trim();
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [search]);

  const handleSelect = (countryName) => {
    onChange({
      target: {
        name,
        value: countryName,
      },
    });
    setIsOpen(false);
  };

  return (
    <div className="relative flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-600">
          <span>
            {label}
            {required && <span className="text-red-500 font-bold ml-1">*</span>}
          </span>
          {!required && <span className="text-[10px] font-normal lowercase tracking-normal text-slate-400">Optional</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`flex w-full items-center justify-between rounded-lg border bg-white px-3.5 py-2.5 text-left text-sm shadow-xs transition-all duration-150 focus:outline-none focus:ring-2 cursor-pointer ${
            isOpen
              ? 'border-ifoa-navy ring-2 ring-ifoa-navy/15'
              : error
              ? 'border-red-300 focus:border-red-500'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          {selectedCountry ? (
            <span className="flex items-center gap-2 font-medium text-slate-800">
              <span className="text-base leading-none">{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
            </span>
          ) : value ? (
            <span className="font-medium text-slate-800">{value}</span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}

          <svg
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180 text-ifoa-navy' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            {/* Search Input */}
            <div className="border-b border-slate-100 p-2 bg-slate-50/70">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search countries..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-7 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-ifoa-navy focus:outline-none focus:ring-1 focus:ring-ifoa-navy/20"
                />
                <svg
                  className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* List */}
            <div className="max-h-52 overflow-y-auto p-1">
              {filteredCountries.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">No countries match "{search}"</div>
              ) : (
                filteredCountries.map((c) => {
                  const active =
                    selectedCountry?.name === c.name ||
                    value?.toLowerCase() === c.name.toLowerCase();

                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelect(c.name)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs sm:text-sm transition-colors cursor-pointer ${
                        active
                          ? 'bg-slate-100 font-semibold text-slate-950'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base leading-none">{c.flag}</span>
                        <span>{c.name}</span>
                      </div>
                      {active && (
                        <svg className="h-4 w-4 text-ifoa-navy shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function PhoneInputField({
  label,
  name,
  value = '',
  onChange,
  required = true,
  placeholder = 'Phone number...',
  defaultCountryCode = 'CH',
  hint,
  error,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Parse existing dial code and raw number if present
  const parsed = useMemo(() => {
    if (!value) {
      const defaultC = COUNTRIES.find((c) => c.code === defaultCountryCode) || COUNTRIES[0];
      return { country: defaultC, rawNumber: '' };
    }

    const trimmed = String(value).trim();
    // Check if value starts with a known dial code
    const matchingCountry = COUNTRIES.find((c) => trimmed.startsWith(c.dialCode));
    if (matchingCountry) {
      const rest = trimmed.slice(matchingCountry.dialCode.length).trim();
      return { country: matchingCountry, rawNumber: rest };
    }

    const defaultC = COUNTRIES.find((c) => c.code === defaultCountryCode) || COUNTRIES[0];
    return { country: defaultC, rawNumber: trimmed };
  }, [value, defaultCountryCode]);

  const [selectedCountry, setSelectedCountry] = useState(parsed.country);
  const [phoneNumber, setPhoneNumber] = useState(parsed.rawNumber);

  // Follow the value prop when it changes from outside (adjusted during render, not in an effect).
  const [prevParsed, setPrevParsed] = useState(parsed);
  if (prevParsed !== parsed) {
    setPrevParsed(parsed);
    setSelectedCountry(parsed.country);
    setPhoneNumber(parsed.rawNumber);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- loading/reset state at the start of an effect that syncs with an external source
      setSearch('');
      return;
    }

    if (searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    function handleScroll() {
      setIsOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    // Opening the dropdown can itself trigger a scroll (browser scrolling the
    // trigger/popup into view), which would immediately close it if the
    // listener were live already. Defer attaching until that settles.
    const rafId = requestAnimationFrame(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
    });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.toLowerCase().trim();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    const full = phoneNumber.trim() ? `${country.dialCode} ${phoneNumber.trim()}` : '';
    onChange({
      target: {
        name,
        value: full,
      },
    });
  };

  const handleNumberChange = (e) => {
    const raw = e.target.value;
    setPhoneNumber(raw);
    const full = raw.trim() ? `${selectedCountry.dialCode} ${raw.trim()}` : '';
    onChange({
      target: {
        name,
        value: full,
      },
    });
  };

  return (
    <div className="relative flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <label htmlFor={name} className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-600">
          <span>
            {label}
            {required && <span className="text-red-500 font-bold ml-1">*</span>}
          </span>
          {!required && <span className="text-[10px] font-normal lowercase tracking-normal text-slate-400">Optional</span>}
        </label>
      )}

      <div className={`relative flex rounded-lg border bg-white shadow-xs transition-all ${
        error
          ? 'border-red-400 ring-2 ring-red-100'
          : 'border-slate-200 focus-within:border-ifoa-navy focus-within:ring-2 focus-within:ring-ifoa-navy/15'
      }`}>
        {/* Country Code Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex shrink-0 items-center gap-1.5 rounded-l-lg border-r border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer select-none"
        >
          <span className="text-base leading-none">{selectedCountry?.flag || '🌐'}</span>
          <span className="font-semibold text-slate-800">{selectedCountry?.dialCode || '+1'}</span>
          <svg
            className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-ifoa-navy' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Phone Number Input */}
        <input
          id={name}
          type="tel"
          name={name}
          value={phoneNumber}
          onChange={handleNumberChange}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-r-lg bg-transparent px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />

        {/* Dropdown Popover */}
        {isOpen && (
          <div className="absolute left-0 top-full z-30 mt-1 w-72 sm:w-80 max-h-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-100 p-2 bg-slate-50/70">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country or code (+44, +1)..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-7 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-ifoa-navy focus:outline-none focus:ring-1 focus:ring-ifoa-navy/20"
                />
                <svg
                  className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto p-1">
              {filteredCountries.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">No country found</div>
              ) : (
                filteredCountries.map((c) => {
                  const active = selectedCountry?.code === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleCountrySelect(c)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs sm:text-sm transition-colors cursor-pointer ${
                        active
                          ? 'bg-slate-100 font-semibold text-slate-950'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate mr-2">
                        <span className="text-base leading-none shrink-0">{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-500 shrink-0">
                        {c.dialCode}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function RadioGroup({ label, name, value, onChange, options = [], required = true }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-600">
          <span>
            {label}
            {required && <span className="text-red-500 font-bold ml-1">*</span>}
          </span>
          {!required && <span className="text-[10px] font-normal lowercase tracking-normal text-slate-400">Optional</span>}
        </span>
      )}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = value === opt;
          return (
            <label
              key={opt}
              className={`flex cursor-pointer items-center justify-center sm:justify-start gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-all select-none ${
                isSelected
                  ? 'border-ifoa-navy bg-ifoa-navy/5 text-ifoa-navy shadow-xs ring-1 ring-ifoa-navy/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt}
                checked={isSelected}
                onChange={onChange}
                className="sr-only"
              />
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  isSelected ? 'border-ifoa-navy bg-ifoa-navy text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function CheckboxField({ label, name, checked, onChange, description }) {
  return (
    <label className="group flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3.5 transition-all select-none hover:border-slate-300 hover:bg-slate-50/50">
      <div className="relative mt-0.5 flex shrink-0 items-center">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
            checked
              ? 'border-ifoa-navy bg-ifoa-navy text-white shadow-xs'
              : 'border-slate-300 bg-white group-hover:border-slate-400'
          }`}
        >
          {checked && (
            <svg className="h-3.5 w-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-700 leading-snug">{label}</span>
        {description && <span className="mt-0.5 text-xs text-slate-500">{description}</span>}
      </div>
    </label>
  );
}
