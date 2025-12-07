'use client';

import { useEffect, useState } from 'react';
import { styles } from '@/lib/constants';
import type { Property } from '@/lib/types';

export default function ApplicationForm({ properties }: { properties: Property[] }){
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [property, setProperty] = useState<string | null>(null);
  const [unit, setUnit] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('property');
    const u = params.get('unit');
    if(p) {
      setProperty(p);
      setSelectedProperty(p);
    }
    if(u) {
      setUnit(u);
      setSelectedUnit(u);
    }
  }, []);

  const selectedPropertyData = properties.find(p => p.slug === selectedProperty || p.name === selectedProperty);
  const availableUnits = selectedPropertyData?.units.filter(u => !u.isHidden) || [];

  const formatSSN = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`;
  };

  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value);
    e.target.value = formatted;
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setOk(null);
    setErr(null);
    const target = e.currentTarget;
    const fd = new FormData(target);
    setLoading(true);
    try{
      const propertyName = selectedPropertyData?.name || selectedProperty || '';
      const unitName = selectedUnit || null;
      
      const payload = {
        ...Object.fromEntries(fd),
        property: propertyName,
        unit: unitName,
      };

      const res = await fetch('/api/apply', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify(payload) 
      });
      const j = await res.json();
      if(!res.ok) throw new Error(j.error || 'Failed to submit application');
      setOk('Thank you! Your application has been submitted successfully. We will contact you shortly.');
      target.reset();
      setSelectedProperty('');
      setSelectedUnit('');
    }catch(e:any){ 
      setErr(e.message || 'An error occurred. Please try again.'); 
    }
    finally{ 
      setLoading(false); 
    }
  }

  return (
    <form className="grid gap-6" onSubmit={onSubmit}>
      <div className="border-b border-gray-200 pb-4">
        <h2 className="font-montserrat text-xl font-semibold text-gray-900">Property Selection</h2>
        <p className="mt-1 text-sm text-gray-600">Select the property and unit you're interested in</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="property" className="block text-sm font-medium text-gray-700 mb-1">
            Property <span className="text-red-500">*</span>
          </label>
          <select
            id="property"
            name="property"
            value={selectedProperty}
            onChange={(e) => {
              setSelectedProperty(e.target.value);
              setSelectedUnit(''); // Reset unit when property changes
            }}
            className={styles.inputBase}
            required
          >
            <option value="">Select a property...</option>
            {properties.map((p) => (
              <option key={p.id} value={p.slug || p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {availableUnits.length > 0 && (
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit (Optional)
            </label>
            <select
              id="unit"
              name="unit"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className={styles.inputBase}
            >
              <option value="">No preference</option>
              {availableUnits.map((u) => (
                <option key={u.id} value={u.label}>
                  {u.label} - {u.bedrooms} BR, {u.bathrooms} BA
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="border-b border-gray-200 pb-4 pt-2">
        <h2 className="font-montserrat text-xl font-semibold text-gray-900">Personal Information</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input 
            id="firstName"
            className={styles.inputBase} 
            name="firstName" 
            placeholder="John" 
            required 
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input 
            id="lastName"
            className={styles.inputBase} 
            name="lastName" 
            placeholder="Doe" 
            required 
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input 
            id="email"
            className={styles.inputBase} 
            name="email" 
            type="email" 
            placeholder="john@example.com" 
            required 
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <input 
            id="phone"
            className={styles.inputBase} 
            name="phone" 
            type="tel" 
            placeholder="(207) 555-0123" 
            required 
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input 
            id="dateOfBirth"
            className={styles.inputBase} 
            name="dateOfBirth" 
            type="date" 
            required 
          />
        </div>
        <div>
          <label htmlFor="ssn" className="block text-sm font-medium text-gray-700 mb-1">
            Social Security Number <span className="text-red-500">*</span>
          </label>
          <input 
            id="ssn"
            className={styles.inputBase} 
            name="ssn" 
            type="text" 
            placeholder="XXX-XX-XXXX" 
            pattern="[0-9]{3}-[0-9]{2}-[0-9]{4}"
            maxLength={11}
            onChange={handleSSNChange}
            required 
          />
          <p className="mt-1 text-xs text-gray-500">Format: XXX-XX-XXXX</p>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4 pt-2">
        <h2 className="font-montserrat text-xl font-semibold text-gray-900">Current Address</h2>
      </div>

      <div>
        <label htmlFor="currentAddress" className="block text-sm font-medium text-gray-700 mb-1">
          Street Address
        </label>
        <input 
          id="currentAddress"
          className={styles.inputBase} 
          name="currentAddress" 
          placeholder="123 Main Street" 
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input 
            id="city"
            className={styles.inputBase} 
            name="city" 
            placeholder="Detroit" 
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <input 
            id="state"
            className={styles.inputBase} 
            name="state" 
            placeholder="ME" 
            maxLength={2}
          />
        </div>
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code
          </label>
          <input 
            id="zipCode"
            className={styles.inputBase} 
            name="zipCode" 
            placeholder="04929" 
            pattern="[0-9]{5}"
            maxLength={5}
          />
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4 pt-2">
        <h2 className="font-montserrat text-xl font-semibold text-gray-900">Employment Information</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title / Position
          </label>
          <input 
            id="jobTitle"
            className={styles.inputBase} 
            name="jobTitle" 
            placeholder="Software Engineer" 
          />
        </div>
        <div>
          <label htmlFor="employerName" className="block text-sm font-medium text-gray-700 mb-1">
            Employer Name
          </label>
          <input 
            id="employerName"
            className={styles.inputBase} 
            name="employerName" 
            placeholder="Company Name" 
          />
        </div>
      </div>

      <div>
        <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700 mb-1">
          Monthly Income <span className="text-red-500">*</span>
        </label>
        <input 
          id="monthlyIncome"
          className={styles.inputBase} 
          name="monthlyIncome" 
          type="number" 
          min="0"
          step="0.01"
          placeholder="5000.00" 
          required 
        />
        <p className="mt-1 text-xs text-gray-500">Enter your total monthly income</p>
      </div>

      <div className="border-b border-gray-200 pb-4 pt-2">
        <h2 className="font-montserrat text-xl font-semibold text-gray-900">Additional Information</h2>
      </div>

      <div>
        <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes or Comments
        </label>
        <textarea 
          id="additionalNotes"
          className={styles.textarea} 
          name="additionalNotes" 
          placeholder="Any additional information you'd like us to know..." 
          rows={4}
        />
      </div>

      <button 
        className={`${styles.btn} ${styles.btnPrimary} w-full sm:w-auto`} 
        disabled={loading}
        type="submit"
      >
        {loading ? 'Submitting Application...' : 'Submit Application'}
      </button>

      {ok && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-800">{ok}</p>
        </div>
      )}
      {err && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{err}</p>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        By submitting this application, you consent to a credit and background check. All information provided is kept confidential and used solely for rental application purposes.
      </p>
    </form>
  );
}

