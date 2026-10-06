import { CmsText } from '@/components/admin/CmsEditable';
import { FormField, SelectField, RadioGroup, CheckboxField, CountrySelectField, PhoneInputField } from './FormField.jsx';

// First line is "Program name, <price>"; any further lines are details
// ("- " lines render as bullets, blank lines separate paragraphs).
function ProgramInfoBlock({ content }) {
  const [firstLine, ...rest] = content.split('\n')
  const match = firstLine.match(/^(.*?),\s*([\d.,]+\s*[A-Z]{2,4})\s*$/);
  const name = match ? match[1].trim() : firstLine.trim();
  const price = match ? match[2].trim() : null;

  const blocks = [];
  rest.map((l) => l.trim()).forEach((line) => {
    if (!line) return;
    const bullet = line.match(/^[-•]\s+(.*)$/);
    const last = blocks[blocks.length - 1];
    if (bullet) {
      if (last?.type === 'list') last.items.push(bullet[1]);
      else blocks.push({ type: 'list', items: [bullet[1]] });
    } else {
      blocks.push({ type: 'p', text: line });
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-1.5 py-1 text-center">
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-emerald-600 bg-emerald-50 text-emerald-600">
            <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <polyline points="1.5,4.8 3.5,7 7.5,2" />
            </svg>
          </span>
          <span className="text-sm font-bold text-slate-800">{name}</span>
        </div>
        {price && <span className="text-base font-extrabold text-ifoa-navy">{price}</span>}
      </div>
      {blocks.length > 0 && (
        <div className="space-y-2.5 border-t border-slate-200/80 pt-4 text-left text-xs sm:text-sm leading-relaxed text-slate-600">
          {blocks.map((block, i) =>
            block.type === 'list' ? (
              <ul key={i} className="space-y-1 pl-4 list-disc marker:text-slate-400">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            ) : (
              <p key={i}>{block.text}</p>
            )
          )}
        </div>
      )}
    </div>
  );
}

function parseBankDetails(content) {
  const lines = content.split('\n').map((l) => l.trim());
  const nonEmpty = (start, end) => lines.slice(start, end).filter(Boolean);
  const bankIdx = lines.findIndex((l) => l.toLowerCase() === 'bank details:');
  const ibanIdx = lines.findIndex((l) => l.toUpperCase().startsWith('IBAN'));
  const bicIdx = lines.findIndex((l) => l.toUpperCase().startsWith('BIC'));
  const noteIdx = lines.findIndex((l) => l.toUpperCase().startsWith('IMPORTANT'));
  if (bankIdx === -1 || ibanIdx === -1) return null;

  return {
    beneficiaryLines: nonEmpty(0, bankIdx),
    bankLines: nonEmpty(bankIdx + 1, ibanIdx),
    iban: lines[ibanIdx],
    bic: bicIdx !== -1 ? lines[bicIdx] : '',
    note: noteIdx !== -1 ? lines[noteIdx] : '',
  };
}

function BankDetailsBlock({ content }) {
  const parsed = parseBankDetails(content);
  if (!parsed) return <div className="whitespace-pre-line text-xs leading-relaxed text-slate-600">{content}</div>;
  const { beneficiaryLines, bankLines, iban, bic, note } = parsed;

  return (
    <div>
      <p className="mb-2 text-center text-sm font-bold text-slate-800">Bank Transfer</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs text-slate-600">
        <div className="text-center sm:text-left">
          <p className="font-semibold text-slate-800">{beneficiaryLines[0]}</p>
          {beneficiaryLines.slice(1).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        <div>
          <p className="mb-1 font-bold text-slate-800">Bank Details:</p>
          {bankLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          <p className="mt-1.5 font-bold text-slate-800">{iban}</p>
          {bic && <p className="font-bold text-slate-800">{bic}</p>}
        </div>
      </div>
      {note && <p className="mt-3 text-center text-xs font-bold text-red-600">{note}</p>}
    </div>
  );
}

// Splits a "Header: a) ... b) ... c) ..." shaped item into a bold lead-in
// plus indented lettered sub-items, matching the source form's layout.
function splitSubList(text) {
  const subMatch = text.match(/^(.*?):\s*(a\).+)$/s);
  if (!subMatch) return null;
  const subItems = subMatch[2]
    .split(/(?=[a-z]\))/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(/^([a-z])\)\s*(.*)$/s);
      return m ? { letter: m[1], text: m[2] } : { letter: '', text: s };
    });
  return { header: `${subMatch[1]}:`, subItems };
}

function renderWithEmailLinks(text) {
  if (typeof text !== 'string') return text;
  // Email addresses and the site's own privacy-policy URL become links.
  const linkRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|https:\/\/theifoa\.com\/privacy-policy)/g;
  const parts = text.split(linkRegex);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (i % 2 === 0) return part;
    const isUrl = part.startsWith('https://');
    return (
      <a
        key={i}
        href={isUrl ? '/privacy-policy' : `mailto:${part}`}
        target={isUrl ? '_blank' : undefined}
        rel={isUrl ? 'noopener' : undefined}
        className="font-bold text-ifoa-navy underline decoration-blue-400 hover:text-blue-700 transition-colors cursor-pointer"
      >
        {part}
      </a>
    );
  });
}

function FormattedStaticContent({ content }) {
  if (!content) return null;

  const rawLines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const isNumberedList = rawLines.some((l) => /^\d+\.\s+/.test(l));

  if (isNumberedList) {
    const termItems = [];
    const otherParagraphs = [];

    rawLines.forEach((line) => {
      const match = line.match(/^(\d+)\.\s+(.*)$/);
      if (match) {
        termItems.push({ number: match[1], text: match[2] });
      } else {
        otherParagraphs.push(line);
      }
    });

    return (
      <div className="space-y-4">
        {/* Numbered Terms List */}
        <ol className="space-y-3.5">
          {termItems.map((item) => {
            const sub = splitSubList(item.text);
            return (
              <li key={item.number} className="flex items-start gap-3 text-xs leading-relaxed text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-200/80 text-[11px] font-bold text-slate-700 select-none">
                  {item.number}
                </span>
                <span className="flex-1 pt-0.5">
                  {sub ? (
                    <>
                      <span className="font-bold text-slate-800">{sub.header}</span>
                      <div className="mt-1.5 space-y-1">
                        {sub.subItems.map((s) => (
                          <div key={s.letter} className="flex gap-1.5 pl-1">
                            <span className="shrink-0 font-semibold text-slate-500">{s.letter})</span>
                            <span>{s.text}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    renderWithEmailLinks(item.text)
                  )}
                </span>
              </li>
            );
          })}
        </ol>

        {/* Separated Footnotes / Privacy Notice */}
        {otherParagraphs.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-2.5">
            {otherParagraphs.map((para, i) => {
              const isPrivacy = para.toLowerCase().startsWith('privacy notice:');
              return (
                <div key={i} className="rounded-xl border border-slate-200/60 bg-white/80 p-3.5 text-xs leading-relaxed text-slate-600 shadow-2xs">
                  {isPrivacy ? (
                    <div>
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block mb-1">
                        Privacy Notice
                      </span>
                      <span>{renderWithEmailLinks(para.replace(/^privacy notice:\s*/i, ''))}</span>
                    </div>
                  ) : (
                    <span>{renderWithEmailLinks(para)}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // General text formatting with paragraph spacing
  const paragraphs = content.split('\n\n').filter(Boolean);
  if (paragraphs.length > 1) {
    return (
      <div className="space-y-3 text-xs leading-relaxed text-slate-700">
        {paragraphs.map((p, idx) => (
          <div key={idx} className="whitespace-pre-line">
            {renderWithEmailLinks(p)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="whitespace-pre-line text-xs leading-relaxed text-slate-700">
      {renderWithEmailLinks(content)}
    </div>
  );
}

export function DynamicField({ field, value, onChange, intakes = [], error }) {
  const fieldId = field.id;
  // Admin editor preview: wording is click-to-edit (field._path is set by
  // RegistrationForm). field.label stays a string for the type checks below.
  const label = field._path ? <CmsText path={`${field._path}.label`} value={field.label} /> : field.label;

  // Check for Country fields
  const isCountryField =
    field.type === 'country' ||
    field.id === 'country' ||
    field.id === 'passportCountry' ||
    field.id === 'citizenship' ||
    (field.label && field.label.toLowerCase().includes('country'));

  if (isCountryField && field.type !== 'select' && field.type !== 'radio') {
    return (
      <div id={`field-wrap-${fieldId}`}>
        <CountrySelectField
          label={label}
          name={field.id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          placeholder={field.placeholder || `Select ${field.label}...`}
          error={error}
        />
      </div>
    );
  }

  // Check for Phone / Telephone fields
  const isPhoneField =
    field.type === 'tel' ||
    field.id === 'mobilePhone' ||
    field.id === 'telephone' ||
    (field.label && (field.label.toLowerCase().includes('phone') || field.label.toLowerCase().includes('telephone')));

  if (isPhoneField) {
    return (
      <div id={`field-wrap-${fieldId}`}>
        <PhoneInputField
          label={label}
          name={field.id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          placeholder={field.placeholder || 'Phone number...'}
          error={error}
        />
      </div>
    );
  }

  switch (field.type) {
    case 'text':
    case 'email':
    case 'date':
      return (
        <div id={`field-wrap-${fieldId}`}>
          <FormField
            label={label}
            name={field.id}
            type={field.type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            error={error}
          />
        </div>
      );

    case 'textarea':
      return (
        <div id={`field-wrap-${fieldId}`} className="flex flex-col gap-1.5">
          {field.label && (
            <label htmlFor={field.id} className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-600">
              <span>
                {label}
                {field.required && <span className="text-red-500 font-bold ml-1">*</span>}
              </span>
              {!field.required && <span className="text-[10px] font-normal lowercase tracking-normal text-slate-400">Optional</span>}
            </label>
          )}
          <textarea
            id={field.id}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            rows={4}
            className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-xs transition-all duration-150 focus:outline-none focus:ring-2 ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                : 'border-slate-200 hover:border-slate-300 focus:border-ifoa-navy focus:ring-ifoa-navy/15'
            }`}
          />
          {error && <p className="text-xs font-semibold text-red-600 animate-in fade-in">{error}</p>}
        </div>
      );

    case 'select':
      return (
        <div id={`field-wrap-${fieldId}`}>
          <SelectField
            label={label}
            name={field.id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            options={field.options || []}
            required={field.required}
            error={error}
          />
        </div>
      );

    case 'intake':
      return (
        <div id={`field-wrap-${fieldId}`}>
          <SelectField
            label={label}
            name={field.id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            options={intakes.map((i) => ({
              value: i.label,
              label: i.label,
              subtitle: i.startDate
                ? `Starts ${new Date(i.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`
                : undefined,
            }))}
            required={field.required}
            placeholder={intakes.length ? 'Select an intake...' : 'No intakes scheduled'}
            error={error}
          />
        </div>
      );

    case 'radio':
      return (
        <div id={`field-wrap-${fieldId}`}>
          <RadioGroup
            label={label}
            name={field.id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            options={field.options || []}
            required={field.required}
          />
          {error && <p className="mt-1.5 text-xs font-semibold text-red-600 animate-in fade-in">{error}</p>}
        </div>
      );

    case 'checkbox':
      return (
        <div id={`field-wrap-${fieldId}`} className="space-y-1">
          <div className={error ? 'rounded-lg ring-2 ring-red-400/50' : ''}>
            <CheckboxField
              label={
                <span>
                  {label}
                  {field.required && <span className="text-red-500 font-bold ml-1">*</span>}
                </span>
              }
              name={field.id}
              checked={value === true}
              onChange={(e) => onChange(e.target.checked)}
            />
          </div>
          {error && <p className="text-xs font-semibold text-red-600 animate-in fade-in">{error}</p>}
        </div>
      );

    case 'checkboxGroup': {
      const selected = Array.isArray(value) ? value : [];
      const toggle = (opt) => {
        const next = selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt];
        onChange(next);
      };
      return (
        <div id={`field-wrap-${fieldId}`} className="flex flex-col gap-2">
          {field.label && (
            <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-600">
              <span>
                {label}
                {field.required && <span className="text-red-500 font-bold ml-1">*</span>}
              </span>
              {!field.required && <span className="text-[10px] font-normal lowercase tracking-normal text-slate-400">Optional</span>}
            </span>
          )}
          <div className={`grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 ${error ? 'p-1 rounded-xl ring-2 ring-red-300' : ''}`}>
            {(field.options || []).map((opt) => (
              <CheckboxField key={opt} label={opt} name={`${field.id}-${opt}`} checked={selected.includes(opt)} onChange={() => toggle(opt)} />
            ))}
          </div>
          {error && <p className="text-xs font-semibold text-red-600 animate-in fade-in">{error}</p>}
        </div>
      );
    }

    case 'staticText': {
      if (field._path) {
        return (
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5">
            {field.label && <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>}
            <CmsText
              as="div"
              path={`${field._path}.content`}
              value={field.content || ''}
              className="block whitespace-pre-line text-xs leading-relaxed text-slate-700"
            />
          </div>
        );
      }
      const isNotice = field.id === 'idNotice' || (field.content && field.content.includes('Passport or Government Photo ID'));
      if (isNotice) {
        return (
          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-blue-900">
            <svg className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-semibold text-blue-950">Identification Verification Notice: </span>
              <span>{renderWithEmailLinks(field.content)}</span>
            </div>
          </div>
        );
      }

      return (
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5">
          {field.label && (
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          )}
          {field.id === 'programInfo' ? (
            <ProgramInfoBlock content={field.content} />
          ) : field.id === 'bankDetails' ? (
            <BankDetailsBlock content={field.content} />
          ) : (
            <FormattedStaticContent content={field.content} />
          )}
        </div>
      );
    }

    default:
      return null;
  }
}

export default DynamicField;
