'use client';

import { useMemo, useState } from 'react';
import { styles } from '@/lib/constants';
import type { Property } from '@/lib/types';
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

type Props = {
  property: Property;
};

export default function PropertyBasicsForm({ property }: Props){
  const initialState = useMemo(() => (
    US_STATES.some((state)=> state.value === property.state) ? property.state : DEFAULT_STATE
  ), [property.state]);

  const initialCities = useMemo(() => {
    const cities = getCitiesForState(initialState);
    return property.city && !cities.includes(property.city)
      ? [property.city, ...cities]
      : cities;
  }, [initialState, property.city]);
  const [cityOptions, setCityOptions] = useState(initialCities);

  const [form, setForm] = useState({
    name: property.name,
    status: PROPERTY_STATUS_OPTIONS.includes(property.status)
      ? property.status
      : PROPERTY_STATUS_OPTIONS[0],
    type: property.type,
    address: property.address,
    city: initialCities[0] ? (initialCities.includes(property.city) ? property.city : initialCities[0]) : '',
    state: initialState,
    zip: property.zip,
    description: property.description,
    bedroomsSummary: property.bedroomsSummary,
    bathsSummary: property.bathsSummary,
    sqftApprox: property.sqftApprox,
    rentFrom: property.rentFrom ? String(property.rentFrom) : '',
    rentTo: property.rentTo ? String(property.rentTo) : '',
    latitude: property.latitude ? String(property.latitude) : '',
    longitude: property.longitude ? String(property.longitude) : '',
    amenities: property.amenities.join(', '),
  });
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [underConstruction, setUnderConstruction] = useState(property.underConstruction ?? false);

  const typeSelection = propertyTypeOptions.includes(property.type) ? property.type : 'Custom';
  const [typeOption, setTypeOption] = useState(typeSelection);
  const [customType, setCustomType] = useState(typeSelection === 'Custom' ? property.type : '');

  function handleChange(field: keyof typeof form, value: string){
    setForm((current)=> ({ ...current, [field]: value }));
  }

  function handleStateChange(newState: string){
    const cities = getCitiesForState(newState);
    setCityOptions(cities);
    setForm((current)=> ({
      ...current,
      state: newState,
      city: cities.includes(current.city) ? current.city : (cities[0] ?? ''),
    }));
  }

  async function handleSubmit(event: React.FormEvent){
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const payload = {
      ...form,
      type: typeOption === 'Custom' ? customType || property.type : typeOption,
      rentFrom: form.rentFrom,
      rentTo: form.rentTo,
      underConstruction,
      amenities: form.amenities
        .split(/[,\n]/)
        .map((item)=> item.trim())
        .filter(Boolean),
    };

    try {
      const response = await fetch(`/api/admin/properties/${property.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok){
        const data = await response.json().catch(()=> null);
        throw new Error(data?.message || 'Failed to update property.');
      }
      setMessage('Saved changes.');
    } catch (error: any) {
      setMessage(error.message || 'Unable to save changes.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className={`${styles.card} ${styles.cardPad}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col gap-1">
          <h2 className="font-montserrat text-lg font-semibold text-gray-900">Property basics</h2>
          <p className="text-sm text-gray-600">Update public-facing details for this listing.</p>
        </div>

        {message && (
          <div className={`rounded-xl border p-3 text-xs ${message.includes('Saved') ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={form.name} onChange={(value)=> handleChange('name', value)} />
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Status</label>
            <select
              className={`${styles.inputBase} bg-white`}
              value={form.status}
              onChange={(event)=> handleChange('status', event.target.value)}
            >
              {PROPERTY_STATUS_OPTIONS.map((status)=> (
                <option key={status} value={status}>{status}</option>
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

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Address" value={form.address} onChange={(value)=> handleChange('address', value)} />
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">State</label>
            <select
              className={`${styles.inputBase} bg-white`}
              value={form.state}
              onChange={(event)=> handleStateChange(event.target.value)}
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
              onChange={(event)=> handleChange('city', event.target.value)}
            >
              {cityOptions.map((city)=> (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="ZIP" value={form.zip} onChange={(value)=> handleChange('zip', value)} />
          <Field label="Bedrooms summary" value={form.bedroomsSummary} onChange={(value)=> handleChange('bedroomsSummary', value)} />
          <Field label="Baths summary" value={form.bathsSummary} onChange={(value)=> handleChange('bathsSummary', value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Square footage" value={form.sqftApprox} onChange={(value)=> handleChange('sqftApprox', value)} />
          <Field label="Rent from" value={form.rentFrom} onChange={(value)=> handleChange('rentFrom', value)} placeholder="1100" />
          <Field label="Rent to" value={form.rentTo} onChange={(value)=> handleChange('rentTo', value)} placeholder="1400" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Property type</label>
            <select
              className={`${styles.inputBase} bg-white`}
              value={typeOption}
              onChange={(event)=> setTypeOption(event.target.value)}
            >
              {propertyTypeOptions.map((option)=> (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          {typeOption === 'Custom' && (
            <Field label="Custom type" value={customType} onChange={setCustomType} placeholder="e.g., Mill conversion loft" />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Latitude" value={form.latitude} onChange={(value)=> handleChange('latitude', value)} />
          <Field label="Longitude" value={form.longitude} onChange={(value)=> handleChange('longitude', value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Amenities</label>
          <textarea
            className={styles.textarea}
            rows={2}
            value={form.amenities}
            onChange={(event)=> handleChange('amenities', event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Description</label>
          <textarea
            className={styles.textarea}
            rows={4}
            value={form.description}
            onChange={(event)=> handleChange('description', event.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={pending}>
            {pending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string)=> void;
  placeholder?: string;
};

function Field({ label, value, onChange, placeholder }: FieldProps){
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        className={styles.inputBase}
        value={value}
        onChange={(event)=> onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
