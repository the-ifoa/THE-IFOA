import { useState, useRef, useEffect } from 'react'
import { RiArrowDownSLine, RiCheckLine } from 'react-icons/ri'

export function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Normalize options to { value, label }
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  )

  const selectedOption = normalizedOptions.find((opt) => opt.value === value)

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpen])

  const handleSelect = (val) => {
    onChange(val)
    setIsOpen(false)
  }

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-2xl bg-white border text-sm text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'border-[#34E06E] ring-2 ring-[#34E06E]/20 shadow-sm'
            : 'border-slate-200 hover:border-slate-300'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={`truncate ${
            selectedOption ? 'text-rocket-dark font-medium' : 'text-slate-400'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <RiArrowDownSLine
          className={`w-5 h-5 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#34E06E]' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-40 rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-1.5 max-h-80 overflow-y-auto space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-left flex items-center justify-between transition-colors duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-100 text-slate-950 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-normal'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <RiCheckLine className="w-4 h-4 text-[#16a34a] shrink-0 ml-2" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
