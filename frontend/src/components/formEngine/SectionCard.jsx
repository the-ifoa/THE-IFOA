export function SectionCard({
  id,
  title,
  stepNumber,
  description,
  isCompleted,
  children,
}) {
  return (
    <div
      id={id}
      className="scroll-mt-24 mb-6 rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
    >
      <div className="flex items-center justify-between gap-4 px-6 sm:px-7 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          {stepNumber && (
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 transition-colors ${
                isCompleted ? 'bg-[#34E06E] text-slate-950' : 'bg-slate-950 text-white'
              }`}
            >
              {isCompleted ? (
                <svg className="h-4 w-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                stepNumber
              )}
            </span>
          )}
          <div>
            <h2 className="text-[15px] sm:text-base font-bold text-slate-950 tracking-tight">{title}</h2>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
        </div>

        {isCompleted && (
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#16a952]">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Completed
          </span>
        )}
      </div>
      {/* Two-column field grid; long fields span both columns (see DynamicSection) */}
      <div className="p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">{children}</div>
    </div>
  );
}

export default SectionCard;
