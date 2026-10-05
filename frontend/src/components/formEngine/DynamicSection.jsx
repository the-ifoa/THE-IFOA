import { SectionCard } from './SectionCard.jsx';
import { CmsText } from '@/components/admin/CmsEditable';
import { DynamicField } from './DynamicField.jsx';
import { useState } from 'react';
import { isSectionComplete, isTrackableSection, isFieldVisible, getFormatError } from './formSchema.js';

// Fields that need the full row: long text, notices, checkboxes, addresses,
// long questions. Everything else pairs up two per row.
const FULL_WIDTH_TYPES = new Set(['staticText', 'checkbox', 'checkboxGroup', 'textarea']);
const FULL_WIDTH_IDS = new Set(['citizenship']);
const isFullWidth = (field) =>
  FULL_WIDTH_TYPES.has(field.type) ||
  FULL_WIDTH_IDS.has(field.id) ||
  /street|address|message|comment|details/i.test(field.id) ||
  (field.label || '').length > 45 ||
  (field.type === 'radio' && (field.options || []).length > 3);

export function DynamicSection({ section, value = {}, onChange, intakes, stepNumber, fieldErrors = {} }) {
  // Fields the user has left at least once: their format is checked live.
  const [touched, setTouched] = useState({});
  const setField = (fieldId) => (fieldValue) => {
    onChange({ ...value, [fieldId]: fieldValue });
  };

  const fields = [...section.fields]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((field) => isFieldVisible(field, value));

  return (
    <SectionCard
      id={`section-${section.id}`}
      stepNumber={stepNumber}
      title={section._path ? <CmsText path={`${section._path}.title`} value={section.title} /> : section.title}
      description={
        section._path ? <CmsText path={`${section._path}.description`} value={section.description || ''} /> : section.description
      }
      isCompleted={isTrackableSection(section) && isSectionComplete(section, value)}
    >
      {fields.map((field) => (
        <div
          key={field.id}
          className={isFullWidth(field) ? 'sm:col-span-2' : ''}
          onBlur={() => !touched[field.id] && setTouched((prev) => ({ ...prev, [field.id]: true }))}
        >
          <DynamicField
            field={field}
            sectionId={section.id}
            value={value[field.id]}
            onChange={setField(field.id)}
            intakes={intakes}
            error={
              (touched[field.id] && getFormatError(field, value[field.id])) ||
              fieldErrors[`${section.id}.${field.id}`] ||
              fieldErrors[field.id]
            }
          />
        </div>
      ))}
    </SectionCard>
  );
}

export default DynamicSection;
