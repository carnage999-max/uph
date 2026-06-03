import Link from 'next/link';
import { styles } from '@/lib/constants';
import { listProperties } from '@/lib/properties';
import DeletePropertyButton from './DeletePropertyButton';

export default async function AdminDashboardPage(){
  const properties = await listProperties();

  return (
    <div className={`${styles.container} space-y-6`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-montserrat text-2xl font-semibold text-gray-900">Properties</h1>
          <p className="text-sm text-gray-600">
            Manage property listings, control visibility, and oversee unit availability.
          </p>
        </div>
        <Link href="/admin/create" className={`${styles.btn} ${styles.btnPrimary}`}>
          Add Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className={`${styles.cardAdmin} ${styles.cardAdminPad} text-sm text-gray-600`}>
          No properties yet. Use the “Add Property” button to create your first listing.
        </div>
      ) : (
        <div className="grid gap-4">
          {properties.map((property)=> {
            const visibleUnits = property.units.filter((unit)=> !unit.isHidden);
            const availableUnits = visibleUnits.filter((unit)=> unit.available);
            return (
              <div key={property.id} className={`${styles.cardAdmin} ${styles.cardAdminPad} flex flex-col gap-4`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-montserrat text-lg font-semibold text-gray-900">
                      {property.name}
                    </div>
                    <div className="text-sm text-gray-600">{property.address}</div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">
                      {property.city}, {property.state}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={styles.badgeDark}>
                      {availableUnits.length}/{visibleUnits.length} available
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {property.type}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-gray-500">
                    Updated {new Date(property.updatedAt ?? property.createdAt ?? '').toLocaleString()}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/properties/${property.slug}`}
                      className={`${styles.btn} ${styles.btnGhost}`}
                      target="_blank"
                    >
                      View public page
                    </Link>
                    <Link
                      href={`/admin/edit/${property.id}`}
                      className={`${styles.btn} ${styles.btnPrimary}`}
                    >
                      Edit
                    </Link>
                    <DeletePropertyButton propertyId={property.id} propertyName={property.name} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
