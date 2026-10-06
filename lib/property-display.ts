import type { Property, Unit } from './types';

export function getVisibleUnits(property: Property): Unit[]{
  return property.hasUnits
    ? property.units.filter((unit)=> !unit.isHidden)
    : [];
}

export function getAvailableUnits(property: Property): Unit[]{
  return getVisibleUnits(property).filter((unit)=> unit.available);
}

export function isPropertyAvailable(property: Property): boolean{
  return property.hasUnits
    ? getAvailableUnits(property).length > 0
    : property.available;
}

export function getPropertyRentRange(property: Property): { min: number | null; max: number | null }{
  const visibleUnits = getVisibleUnits(property);
  const availableUnitRents = visibleUnits
    .filter((unit): unit is Unit & { rent: number } => unit.available && unit.rent !== null)
    .map((unit)=> unit.rent);
  const visibleUnitRents = visibleUnits
    .map((unit)=> unit.rent)
    .filter((rent): rent is number => rent !== null);
  const unitRents = availableUnitRents.length ? availableUnitRents : visibleUnitRents;

  const unitMin = unitRents.length ? Math.min(...unitRents) : null;
  const unitMax = unitRents.length ? Math.max(...unitRents) : null;

  return {
    min: property.rentFrom ?? unitMin,
    max: property.rentTo ?? unitMax,
  };
}

export function getPropertyRentLabel(property: Property): string{
  const { min, max } = getPropertyRentRange(property);

  if (min !== null && max !== null){
    if (min === max) return `$${min.toLocaleString()}/mo`;
    return `$${min.toLocaleString()}-$${max.toLocaleString()}/mo`;
  }
  if (min !== null) return `From $${min.toLocaleString()}/mo`;
  if (max !== null) return `Up to $${max.toLocaleString()}/mo`;
  return 'Contact for pricing';
}
