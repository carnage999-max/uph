'use client';

import { useMemo, useState } from 'react';
import { styles } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { PROPERTY_STATUS_OPTIONS } from '@/lib/options';
import { US_STATES, DEFAULT_STATE, getCitiesForState } from '@/lib/locations';

const propertyTypeOptions = [
  'Apartment Building',
  'Duplex',
  'Townhome',
  'Single-Family Home',
  'Mixed Use',
  'Condominium',
  'Commercial',
  'Student Housing',
  'Custom',
];

type UnitForm = {
  id: string;
  label: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  rent: string;
  available: boolean;
  isHidden: boolean;
  coverFile: File | null;
  galleryFiles: File[];
};

const INITIAL_UNIT: UnitForm = {
  id: '',
  label: '',
  bedrooms: '',
  bathrooms: '',
  sqft: '',
  rent: '',
  available: true,
  isHidden: false,
  coverFile: null,
  galleryFiles: [],
};

const steps = [
  { id: 'basics', title: 'Basics', description: 'Core property details and location.' },
  { id: 'media', title: 'Media', description: 'Property image, other images, and amenities.' },
  { id: 'units', title: 'Units', description: 'Configure unit availability and pricing.' },
];

function generateId(){
  if (typeof crypto !== 'undefined' && crypto.randomUUID){
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
}

export default function PropertyCreateWizard(){
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [typeSelection, setTypeSelection] = useState(propertyTypeOptions[0]);
  const [customType, setCustomType] = useState('');
  const [hasUnits, setHasUnits] = useState(true);
  const [underConstruction, setUnderConstruction] = useState(false);
  const [units, setUnits] = useState<UnitForm[]>([]);
  const [amenitiesText, setAmenitiesText] = useState('');
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialState = DEFAULT_STATE;
  const initialCities = getCitiesForState(initialState);
  const [cityOptions, setCityOptions] = useState(initialCities);

  const [form, setForm] = useState({
    name: '',
    address: '',
    city: initialCities[0] ?? '',
    state: initialState,
    zip: '',
    status: PROPERTY_STATUS_OPTIONS[0],
    description: '',
    bedroomsSummary: '',
    bathsSummary: '',
    sqftApprox: '',
    rentFrom: '',
    rentTo: '',
    latitude: '',
    longitude: '',
  });

  function updateForm(field: keyof typeof form, value: string){
    setForm((current)=> ({ ...current, [field]: value }));
  }

  function updateState(newState: string){
    const cities = getCitiesForState(newState);
    setCityOptions(cities);
    setForm((current)=> ({
      ...current,
      state: newState,
      city: cities.includes(current.city) ? current.city : (cities[0] ?? ''),
    }));
  }

  function addUnit(){
    setUnits((current)=> [...current, { ...INITIAL_UNIT, id: generateId() }]);
  }

  function updateUnit(id: string, updates: Partial<UnitForm>){
    setUnits((current)=> current.map((unit)=> unit.id === id ? { ...unit, ...updates } : unit));
  }

  function removeUnit(id: string){
    setUnits((current)=> current.filter((unit)=> unit.id !== id));
  }

  function handleHeroChange(event: React.ChangeEvent<HTMLInputElement>){
    const file = event.target.files?.[0];
    if (file){
      setHeroFile(file);
    }
  }

  function handleGalleryChange(event: React.ChangeEvent<HTMLInputElement>){
    const files = event.target.files ? Array.from(event.target.files) : [];
    setGalleryFiles(files);
  }

  function handleUnitCoverChange(id: string, event: React.ChangeEvent<HTMLInputElement>){
    const file = event.target.files?.[0] ?? null;
    updateUnit(id, { coverFile: file });
  }

  function handleUnitGalleryChange(id: string, event: React.ChangeEvent<HTMLInputElement>){
    const files = event.target.files ? Array.from(event.target.files) : [];
    updateUnit(id, { galleryFiles: files });
  }

  function parsedAmenities(){
    return amenitiesText
      .split(/[\n,]/)
      .map((item)=> item.trim())
      .filter(Boolean);
  }

  function propertyType(){
    return typeSelection === 'Custom' ? customType.trim() : typeSelection;
  }

  function validateCurrentStep(){
    if (step === 0){
      const requiredFields: Array<keyof typeof form> = ['name', 'address', 'city', 'state', 'zip', 'description'];
      for (const field of requiredFields){
        if (!form[field].trim()){
          setError('Complete all required basics before continuing.');
          return false;
        }
      }
      if (!propertyType()){
        setError('Select or provide a property type.');
        return false;
      }
    }
    if (step === 1){
      if (!heroFile){
        setError('Upload a property image to continue.');
        return false;
      }
    }
    if (step === 2 && hasUnits){
      if (!units.length){
        setError('Add at least one unit or disable unit management.');
        return false;
      }
      for (const unit of units){
        if (!unit.label.trim()){
          setError('Each unit needs a label.');
          return false;
        }
        if (!unit.bedrooms || !unit.bathrooms || !unit.sqft){
          setError('Fill in bedrooms, bathrooms, and square footage for every unit.');
          return false;
        }
      }
    }
    setError(null);
    return true;
  }

  function handleNext(){
    if (!validateCurrentStep()) return;
    setStep((current)=> Math.min(current + 1, steps.length - 1));
  }

  function handleBack(){
    setError(null);
    setStep((current)=> Math.max(current - 1, 0));
  }

  async function handleSubmit(){
    if (!validateCurrentStep()) return;
    if (!heroFile){
      setError('Property image is required.');
      return;
    }
    setPending(true);
    setError(null);

    const formData = new FormData();
    const heroKey = 'hero';
    formData.append(heroKey, heroFile);
    const galleryFields: string[] = [];
    galleryFiles.forEach((file, index)=>{
      const field = `gallery-${index}`;
      galleryFields.push(field);
      formData.append(field, file);
    });

    const unitsPayload = hasUnits ? units.map((unit, index)=>{
      const coverField = unit.coverFile ? `unit-${index}-cover` : null;
      if (unit.coverFile){
        formData.append(coverField!, unit.coverFile);
      }
      const galleryFields = unit.galleryFiles.map((file, galleryIndex)=>{
        const fieldName = `unit-${index}-gallery-${galleryIndex}`;
        formData.append(fieldName, file);
        return fieldName;
      });
      return {
        label: unit.label,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        sqft: unit.sqft,
        rent: unit.rent,
        available: unit.available,
        isHidden: unit.isHidden,
        coverImageField: coverField,
        galleryFields,
      };
    }) : [];

    const payload = {
      ...form,
      type: propertyType(),
      status: form.status || null,
      rentFrom: form.rentFrom,
      rentTo: form.rentTo,
      amenities: parsedAmenities(),
      hasUnits,
      underConstruction,
      heroImageField: heroKey,
      galleryFields,
      units: unitsPayload,
    };

    formData.append('payload', JSON.stringify(payload));

    try {
      const response = await fetch('/api/admin/properties', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok){
        const data = await response.json().catch(()=> null);
        throw new Error(data?.message || 'Failed to create property.');
      }

      const data = await response.json();
      router.push(`/admin/edit/${data.property.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setPending(false);
    }
  }

  const stepTitle = useMemo(()=> steps[step], [step]);

  return (
    <div className={`${styles.card} ${styles.cardPad} space-y-6`}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Step {step + 1} of {steps.length}
        </div>
        <h1 className="font-montserrat text-xl font-semibold text-gray-900">
          {stepTitle.title}
        </h1>
        <p className="text-sm text-gray-600">{stepTitle.description}</p>
        <div className="flex gap-2">
          {steps.map((item, index)=> (
            <span
              key={item.id}
              className={`h-1 flex-1 rounded-full transition ${index <= step ? 'bg-gray-900' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="relative overflow-hidden">
        <div key={step} className="space-y-6 animate-step">
          {step === 0 && (
            <section className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Property name"
                  required
                  tooltip="Shown publicly across the site."
                  value={form.name}
                  onChange={(value)=> updateForm('name', value)}
                />
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Status
                    <Tooltip text="Select the marketing status you want to surface on property cards." />
                  </label>
                  <select
                    className={`${styles.inputBase} bg-white`}
                    value={form.status}
                    onChange={(event)=> updateForm('status', event.target.value)}
                  >
                    {PROPERTY_STATUS_OPTIONS.map((status)=> (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={underConstruction}
                  onChange={(e) => setUnderConstruction(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <span className="text-sm font-medium text-gray-900">Mark property as Under Construction</span>
              </label>
              <Field
                label="Street address"
                required
                value={form.address}
                onChange={(value)=> updateForm('address', value)}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">State</label>
                  <select
                    className={`${styles.inputBase} bg-white`}
                    value={form.state}
                    onChange={(event)=> updateState(event.target.value)}
                  >
                    {US_STATES.map((state)=> (
                      <option key={state.value} value={state.value}>{state.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">City</label>
                  <select
                    className={`${styles.inputBase} bg-white`}
                    value={form.city}
                    onChange={(event)=> updateForm('city', event.target.value)}
                  >
                    {cityOptions.map((city)=> (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <Field label="ZIP" required value={form.zip} onChange={(value)=> updateForm('zip', value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Property type
                    <Tooltip text="Choose the closest match; select Custom for bespoke categories." />
                  </label>
                  <select
                    className={`${styles.inputBase} bg-white`}
                    value={typeSelection}
                    onChange={(event)=> setTypeSelection(event.target.value)}
                  >
                    {propertyTypeOptions.map((option)=> (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                {typeSelection === 'Custom' && (
                  <Field
                    label="Custom type"
                    required
                    value={customType}
                    onChange={setCustomType}
                    placeholder="e.g., Mill Conversion Loft"
                  />
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Description
                  <Tooltip text="Highlight neighborhood perks, renovations, or service differentiators." />
                </label>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  value={form.description}
                  onChange={(event)=> updateForm('description', event.target.value)}
                  required
                />
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="Bedrooms summary"
                  value={form.bedroomsSummary}
                  onChange={(value)=> updateForm('bedroomsSummary', value)}
                  placeholder="Mix of 1-2 BR"
                />
                <Field
                  label="Bathrooms summary"
                  value={form.bathsSummary}
                  onChange={(value)=> updateForm('bathsSummary', value)}
                  placeholder="1 bath per unit"
                />
                <Field
                  label="Approx. square footage"
                  value={form.sqftApprox}
                  onChange={(value)=> updateForm('sqftApprox', value)}
                  placeholder="Varies by unit"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Rent from"
                  value={form.rentFrom}
                  onChange={(value)=> updateForm('rentFrom', value)}
                  placeholder="e.g., 1100"
                />
                <Field
                  label="Rent to"
                  value={form.rentTo}
                  onChange={(value)=> updateForm('rentTo', value)}
                  placeholder="e.g., 1400"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Latitude"
                  value={form.latitude}
                  onChange={(value)=> updateForm('latitude', value)}
                  placeholder="Optional"
                />
                <Field
                  label="Longitude"
                  value={form.longitude}
                  onChange={(value)=> updateForm('longitude', value)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Amenities
                  <Tooltip text="Separate amenities with commas or line breaks for the resident-facing list." />
                </label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={amenitiesText}
                  onChange={(event)=> setAmenitiesText(event.target.value)}
                  placeholder="On-site parking, Laundry hookups, 24/7 maintenance"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Property image
                    <Tooltip text="Displayed at the top of the property detail page. Landscape images work best." />
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroChange}
                    className={styles.inputBase}
                    required
                  />
                  {heroFile && (
                    <div className="text-xs text-gray-500">{heroFile.name}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Other images
                    <Tooltip text="Optional supporting photos for the property-level carousel." />
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className={styles.inputBase}
                  />
                  {!!galleryFiles.length && (
                    <div className="text-xs text-gray-500">
                      {galleryFiles.length} image{galleryFiles.length === 1 ? '' : 's'} selected
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-5">
              <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div>
                  <div className="font-semibold text-gray-900">Manage units</div>
                  <div className="text-xs text-gray-500">
                    Toggle off if this listing covers a single residence without sub-units.
                  </div>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={hasUnits}
                    onChange={(event)=> setHasUnits(event.target.checked)}
                    className="h-4 w-4"
                  />
                  Enable units
                </label>
              </div>

              {hasUnits && (
                <div className="space-y-4">
                  {units.map((unit)=> (
                    <div key={unit.id} className="rounded-2xl border border-gray-200 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-900">Unit details</div>
                        <button
                          type="button"
                          className="text-xs font-semibold text-red-600"
                          onClick={()=> removeUnit(unit.id)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field
                          label="Label"
                          required
                          value={unit.label}
                          onChange={(value)=> updateUnit(unit.id, { label: value })}
                          placeholder="Unit 1"
                        />
                        <Field
                          label="Monthly rent"
                          value={unit.rent}
                          onChange={(value)=> updateUnit(unit.id, { rent: value })}
                          placeholder="e.g., 1250"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <Field
                          label="Bedrooms"
                          required
                          value={unit.bedrooms}
                          onChange={(value)=> updateUnit(unit.id, { bedrooms: value })}
                          placeholder="2"
                        />
                        <Field
                          label="Bathrooms"
                          required
                          value={unit.bathrooms}
                          onChange={(value)=> updateUnit(unit.id, { bathrooms: value })}
                          placeholder="1"
                        />
                        <Field
                          label="Square feet"
                          required
                          value={unit.sqft}
                          onChange={(value)=> updateUnit(unit.id, { sqft: value })}
                          placeholder="820"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600">
                          <input
                            type="checkbox"
                            checked={unit.available}
                            onChange={(event)=> updateUnit(unit.id, { available: event.target.checked })}
                          />
                          Available
                        </label>
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600">
                          <input
                            type="checkbox"
                            checked={unit.isHidden}
                            onChange={(event)=> updateUnit(unit.id, { isHidden: event.target.checked })}
                          />
                          Hide from public
                        </label>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">
                            Cover image
                            <Tooltip text="Appears in unit cards. Optional but recommended." />
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event)=> handleUnitCoverChange(unit.id, event)}
                            className={styles.inputBase}
                          />
                          {unit.coverFile && (
                            <div className="text-xs text-gray-500">{unit.coverFile.name}</div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">
                            Other images
                            <Tooltip text="Upload interior shots for the lightbox carousel." />
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(event)=> handleUnitGalleryChange(unit.id, event)}
                            className={styles.inputBase}
                          />
                          {!!unit.galleryFiles.length && (
                            <div className="text-xs text-gray-500">
                              {unit.galleryFiles.length} image{unit.galleryFiles.length === 1 ? '' : 's'} selected
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={addUnit}>
                    Add unit
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 0 || pending}
          className={`${styles.btn} ${styles.btnGhost}`}
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <button type="button" onClick={handleNext} className={`${styles.btn} ${styles.btnPrimary}`} disabled={pending}>
            Next
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} className={`${styles.btn} ${styles.btnPrimary}`} disabled={pending}>
            {pending ? 'Saving…' : 'Create property'}
          </button>
        )}
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string)=> void;
  placeholder?: string;
  required?: boolean;
  tooltip?: string;
};

function Field({ label, value, onChange, placeholder, required, tooltip }: FieldProps){
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <input
        className={styles.inputBase}
        value={value}
        onChange={(event)=> onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function Tooltip({ text }: { text: string }){
  return (
    <span
      className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-700"
      title={text}
    >
      ?
    </span>
  );
}
