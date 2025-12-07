'use client';

import { useEffect, useState, useRef } from 'react';
import { styles } from '@/lib/constants';
import type { Property } from '@/lib/types';
import SignatureCanvas from 'react-signature-canvas';
import { ChevronLeft, ChevronRight, Upload, X, Check } from 'lucide-react';
import Captcha from './Captcha';

type Reference = {
  name: string;
  relationship: string;
  phone: string;
  email: string;
};

type FormData = {
  // Step 1: Property Selection
  property: string;
  unit: string;
  
  // Step 2: Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  
  // Step 3: Current Address
  currentAddress: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Step 4: Current Landlord
  landlordName: string;
  landlordPhone: string;
  landlordEmail: string;
  
  // Step 5: References
  references: Reference[];
  
  // Step 6: Pet Information
  hasPet: boolean;
  petType: string;
  petPhoto: File | null;
  
  // Step 7: Driver's License
  driversLicensePhoto: File | null;
  
  // Step 8: Authorizations
  authorizeCriminalCheck: boolean;
  authorizeCreditCheck: boolean;
  
  // Step 9: E-Signature
  signature: string | null;
  
  // Step 10: Employment
  jobTitle: string;
  employerName: string;
  monthlyIncome: string;
  additionalNotes: string;
};

const INITIAL_FORM_DATA: FormData = {
  property: '',
  unit: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  ssn: '',
  currentAddress: '',
  city: '',
  state: '',
  zipCode: '',
  landlordName: '',
  landlordPhone: '',
  landlordEmail: '',
  references: [{ name: '', relationship: '', phone: '', email: '' }, { name: '', relationship: '', phone: '', email: '' }],
  hasPet: false,
  petType: '',
  petPhoto: null,
  driversLicensePhoto: null,
  authorizeCriminalCheck: false,
  authorizeCreditCheck: false,
  signature: null,
  jobTitle: '',
  employerName: '',
  monthlyIncome: '',
  additionalNotes: '',
};

export default function ApplicationForm({ properties }: { properties: Property[] }){
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const signatureRef = useRef<SignatureCanvas>(null);
  const [petPhotoPreview, setPetPhotoPreview] = useState<string | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);

  const totalSteps = 10;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('property');
    const u = params.get('unit');
    if(p) {
      setFormData(prev => ({ ...prev, property: p }));
    }
    if(u) {
      setFormData(prev => ({ ...prev, unit: u }));
    }
  }, []);

  const selectedPropertyData = properties.find(p => p.slug === formData.property || p.name === formData.property);
  const availableUnits = selectedPropertyData?.units.filter(u => !u.isHidden) || [];

  const formatSSN = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`;
  };

  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value);
    setFormData(prev => ({ ...prev, ssn: formatted }));
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateReference = (index: number, field: keyof Reference, value: string) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: value } : ref
      ),
    }));
  };

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, { name: '', relationship: '', phone: '', email: '' }],
    }));
  };

  const removeReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index),
    }));
  };

  const handlePetPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData('petPhoto', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPetPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLicensePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData('driversLicensePhoto', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLicensePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
    updateFormData('signature', null);
  };

  const saveSignature = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const dataURL = signatureRef.current.toDataURL();
      updateFormData('signature', dataURL);
    }
  };

  const validateStep = (step: number): boolean => {
    switch(step) {
      case 1:
        return !!formData.property;
      case 2:
        return !!(formData.firstName && formData.lastName && formData.email && formData.phone && formData.dateOfBirth && formData.ssn);
      case 3:
        return true; // Current address is optional
      case 4:
        return true; // Landlord info is optional but recommended
      case 5:
        return formData.references.length >= 2 && 
               formData.references.every(ref => ref.name && ref.relationship && ref.phone);
      case 6:
        if (formData.hasPet) {
          return !!formData.petType && !!formData.petPhoto;
        }
        return true;
      case 7:
        return !!formData.driversLicensePhoto;
      case 8:
        return formData.authorizeCriminalCheck && formData.authorizeCreditCheck;
      case 9:
        return !!formData.signature;
      case 10:
        return !!(formData.monthlyIncome);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 9) {
        saveSignature();
      }
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      setErr('Please complete all required fields before proceeding.');
      setTimeout(() => setErr(null), 5000);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErr(null);
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setOk(null);
    setErr(null);

    // Ensure signature is saved if we're on step 9 or 10
    if (currentStep >= 9 && signatureRef.current && !signatureRef.current.isEmpty()) {
      saveSignature();
    }

    if (!validateStep(currentStep)) {
      setErr('Please complete all required fields.');
      return;
    }

    if (!captchaToken) {
      setErr('Please complete the CAPTCHA verification.');
      return;
    }

    if (!formData.signature) {
      setErr('Please provide your signature.');
      return;
    }

    setLoading(true);
    try{
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'references') {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (key === 'petPhoto' || key === 'driversLicensePhoto') {
          if (value instanceof File) {
            formDataToSend.append(key, value);
          }
        } else if (key === 'signature') {
          if (value) {
            formDataToSend.append(key, value);
          }
        } else {
          formDataToSend.append(key, String(value || ''));
        }
      });

      formDataToSend.append('captchaToken', captchaToken);

      const res = await fetch('/api/apply', { 
        method: 'POST', 
        body: formDataToSend
      });
      
      const j = await res.json();
      if(!res.ok) throw new Error(j.error || 'Failed to submit application');
      
      setOk('Thank you! Your application has been submitted successfully. We will contact you shortly.');
      setFormData(INITIAL_FORM_DATA);
      setCurrentStep(1);
      setPetPhotoPreview(null);
      setLicensePreview(null);
      signatureRef.current?.clear();
      setCaptchaToken(null);
    }catch(e:any){ 
      setErr(e.message || 'An error occurred. Please try again.'); 
    }
    finally{ 
      setLoading(false); 
    }
  }

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-montserrat text-xl font-semibold text-gray-900 mb-2">Property Selection</h2>
              <p className="text-sm text-gray-600">Select the property and unit you're interested in</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="property" className="block text-sm font-medium text-gray-700 mb-1">
                  Property <span className="text-red-500">*</span>
                </label>
                <select
                  id="property"
                  value={formData.property}
                  onChange={(e) => {
                    updateFormData('property', e.target.value);
                    updateFormData('unit', '');
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
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => updateFormData('unit', e.target.value)}
                    className={styles.inputBase}
                    required
                  >
                    <option value="">Select a unit...</option>
                    {availableUnits.map((u) => (
                      <option key={u.id} value={u.label}>
                        {u.label} - {u.bedrooms} BR, {u.bathrooms} BA
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-montserrat text-xl font-semibold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-sm text-gray-600">Please provide your personal details</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input 
                  id="firstName"
                  className={styles.inputBase} 
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
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
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
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
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
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
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
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
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
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
                  type="text"
                  value={formData.ssn}
                  onChange={handleSSNChange}
                  placeholder="XXX-XX-XXXX" 
                  pattern="[0-9]{3}-[0-9]{2}-[0-9]{4}"
                  maxLength={11}
                  required 
                />
                <p className="mt-1 text-xs text-gray-500">Format: XXX-XX-XXXX</p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-montserrat text-xl font-semibold text-gray-900 mb-2">Current Address</h2>
              <p className="text-sm text-gray-600">Your current residential address</p>
            </div>

            <div>
              <label htmlFor="currentAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input 
                id="currentAddress"
                className={styles.inputBase} 
                value={formData.currentAddress}
                onChange={(e) => updateFormData('currentAddress', e.target.value)}
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
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
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
                  value={formData.state}
                  onChange={(e) => updateFormData('state', e.target.value)}
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
                  value={formData.zipCode}
                  onChange={(e) => updateFormData('zipCode', e.target.value)}
                  placeholder="04929" 
                  pattern="[0-9]{5}"
                  maxLength={5}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-montserrat text-xl font-semibold text-gray-900 mb-2">Current Landlord Information</h2>
              <p className="text-sm text-gray-600">Please provide your current landlord's contact information</p>
            </div>

            <div>
              <label htmlFor="landlordName" className="block text-sm font-medium text-gray-700 mb-1">
                Landlord Name
              </label>
              <input 
                id="landlordName"
                className={styles.inputBase} 
                value={formData.landlordName}
                onChange={(e) => updateFormData('landlordName', e.target.value)}
                placeholder="John Smith" 
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="landlordPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Landlord Phone
                </label>
                <input 
                  id="landlordPhone"
                  className={styles.inputBase} 
                  type="tel"
                  value={formData.landlordPhone}
                  onChange={(e) => updateFormData('landlordPhone', e.target.value)}
                  placeholder="(207) 555-0123" 
                />
              </div>
              <div>
                <label htmlFor="landlordEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Landlord Email
                </label>
                <input 
                  id="landlordEmail"
                  className={styles.inputBase} 
                  type="email"
                  value={formData.landlordEmail}
                  onChange={(e) => updateFormData('landlordEmail', e.target.value)}
                  placeholder="landlord@example.com" 
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-montserrat text-xl font-semibold text-gray-900 mb-2">Personal References</h2>
              <p className="text-sm text-gray-600">Please provide at least two personal references</p>
            </div>

            {formData.references.map((ref, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Reference {index + 1}</h3>
                  {formData.references.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeReference(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    className={styles.inputBase} 
                    value={ref.name}
                    onChange={(e) => updateReference(index, 'name', e.target.value)}
                    placeholder="Jane Doe" 
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <input 
                    className={styles.inputBase} 
                    value={ref.relationship}
                    onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                    placeholder="Friend, Colleague, etc." 
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input 
                      className={styles.inputBase} 
                      type="tel"
                      value={ref.phone}
                      onChange={(e) => updateReference(index, 'phone', e.target.value)}
                      placeholder="(207) 555-0123" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input 
                      className={styles.inputBase} 
                      type="email"
                      value={ref.email}
                      onChange={(e) => updateReference(index, 'email', e.target.value)}
                      placeholder="jane@example.com" 
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addReference}
              className={`${styles.btn} ${styles.btnGhost} text-sm`}
            >
              + Add Another Reference
            </button>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-montserrat text-xl font-semibold text-gray-900 mb-2">Pet Information</h2>
              <p className="text-sm text-gray-600">Do you have any pets?</p>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasPet}
                  onChange={(e) => {
                    updateFormData('hasPet', e.target.checked);
                    if (!e.target.checked) {
                      updateFormData('petType', '');
                      updateFormData('petPhoto', null);
                      setPetPhotoPreview(null);
                    }
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <span className="text-sm font-medium text-gray-700">I have a pet</span>
              </label>
            </div>

            {formData.hasPet && (
              <>
                <div>
                  <label htmlFor="petType" className="block text-sm font-medium text-gray-700 mb-1">
                    Pet Type <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="petType"
                    className={styles.inputBase} 
                    value={formData.petType}
                    onChange={(e) => updateFormData('petType', e.target.value)}
                    placeholder="Dog, Cat, etc." 
                    required
                  />
                </div>

                <div>
                  <label htmlFor="petPhoto" className="block text-sm font-medium text-gray-700 mb-1">
                    Pet Photo <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <input 
                      id="petPhoto"
                      type="file"
                      accept="image/*"
                      onChange={handlePetPhotoChange}
                      className="hidden"
                      required={formData.hasPet}
                    />
                    <label
                      htmlFor="petPhoto"
                      className={`${styles.btn} ${styles.btnGhost} cursor-pointer inline-flex items-center gap-2`}
                    >
                      <Upload className="h-4 w-4" />
                      Upload Pet Photo
                    </label>
                    {petPhotoPreview && (
                      <div className="relative inline-block mt-2">
                        <img 
                          src={petPhotoPreview} 
                          alt="Pet preview" 
                          className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updateFormData('petPhoto', null);
                            setPetPhotoPreview(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-montserrat text-xl font-semibold text-gray-900 mb-2">Driver's License</h2>
              <p className="text-sm text-gray-600">Please upload a photo of your driver's license</p>
            </div>

            <div>
              <label htmlFor="driversLicensePhoto" className="block text-sm font-medium text-gray-700 mb-1">
                Driver's License Photo <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <input 
                  id="driversLicensePhoto"
                  type="file"
                  accept="image/*"
                  onChange={handleLicensePhotoChange}
                  className="hidden"
                  required
                />
                <label
                  htmlFor="driversLicensePhoto"
                  className={`${styles.btn} ${styles.btnGhost} cursor-pointer inline-flex items-center gap-2`}
                >
                  <Upload className="h-4 w-4" />
                  Upload Driver's License
                </label>
                {licensePreview && (
                  <div className="relative inline-block mt-2">
                    <img 
                      src={licensePreview} 
                      alt="License preview" 
                      className="h-48 w-auto object-contain rounded-lg border border-gray-200 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        updateFormData('driversLicensePhoto', null);
                        setLicensePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-montserrat text-xl font-semibold text-gray-900 mb-2">Authorizations</h2>
              <p className="text-sm text-gray-600">Please authorize the following checks</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.authorizeCriminalCheck}
                  onChange={(e) => updateFormData('authorizeCriminalCheck', e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  required
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900 block">
                    Criminal Background Check Authorization <span className="text-red-500">*</span>
                  </span>
                  <span className="text-xs text-gray-600 mt-1 block">
                    I authorize Ultimate Property Holdings to conduct a criminal background check as part of my rental application.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.authorizeCreditCheck}
                  onChange={(e) => updateFormData('authorizeCreditCheck', e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  required
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900 block">
                    Credit Check Authorization <span className="text-red-500">*</span>
                  </span>
                  <span className="text-xs text-gray-600 mt-1 block">
                    I authorize Ultimate Property Holdings to conduct a credit check as part of my rental application.
                  </span>
                </div>
              </label>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-montserrat text-xl font-semibold text-gray-900 mb-2">E-Signature</h2>
              <p className="text-sm text-gray-600">Please sign below to authorize this application</p>
            </div>

            <div className="border-2 border-gray-200 rounded-xl p-4 bg-white">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: 'w-full h-48 border border-gray-300 rounded-lg',
                }}
                backgroundColor="#ffffff"
                penColor="#111827"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={clearSignature}
                className={`${styles.btn} ${styles.btnGhost} text-sm`}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={saveSignature}
                className={`${styles.btn} ${styles.btnGhost} text-sm`}
              >
                Save Signature
              </button>
            </div>

            {formData.signature && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                Signature saved
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-800">
                <strong>Legal Notice:</strong> By signing this application, you acknowledge that all information provided is true and accurate to the best of your knowledge. This signature is legally binding and authorizes Ultimate Property Holdings to process your rental application.
              </p>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-montserrat text-xl font-semibold text-gray-900 mb-2">Employment Information</h2>
              <p className="text-sm text-gray-600">Please provide your employment details</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title / Position
                </label>
                <input 
                  id="jobTitle"
                  className={styles.inputBase} 
                  value={formData.jobTitle}
                  onChange={(e) => updateFormData('jobTitle', e.target.value)}
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
                  value={formData.employerName}
                  onChange={(e) => updateFormData('employerName', e.target.value)}
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
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => updateFormData('monthlyIncome', e.target.value)}
                min="0"
                step="0.01"
                placeholder="5000.00" 
                required 
              />
              <p className="mt-1 text-xs text-gray-500">Enter your total monthly income</p>
            </div>

            <div>
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes or Comments
              </label>
              <textarea 
                id="additionalNotes"
                className={styles.textarea} 
                value={formData.additionalNotes}
                onChange={(e) => updateFormData('additionalNotes', e.target.value)}
                placeholder="Any additional information you'd like us to know..." 
                rows={4}
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">CAPTCHA Verification</h3>
              <p className="text-sm text-gray-600 mb-4">Please complete the verification to prevent spam</p>
              <Captcha
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                onVerify={setCaptchaToken}
                onError={() => setCaptchaToken(null)}
                onExpire={() => setCaptchaToken(null)}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };


  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gray-900 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`${styles.btn} ${styles.btnGhost} ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''} flex items-center gap-2`}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={nextStep}
            className={`${styles.btn} ${styles.btnPrimary} flex items-center gap-2`}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button 
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary} flex items-center gap-2`}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        )}
      </div>

      {/* Status Messages */}
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
    </form>
  );
}
