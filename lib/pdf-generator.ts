import PDFDocument from 'pdfkit';

type ApplicationData = {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  
  // Current Address
  currentAddress: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Previous Addresses
  previousAddress1: string;
  previousCity1: string;
  previousState1: string;
  previousZipCode1: string;
  previousAddress2: string;
  previousCity2: string;
  previousState2: string;
  previousZipCode2: string;
  
  // Landlord
  landlordName: string;
  landlordPhone: string;
  landlordEmail: string;
  
  // References
  references: Array<{name: string; relationship: string; phone: string; email: string}>;
  
  // Pet Information
  hasPet: boolean;
  petType: string;
  
  // Employment
  jobTitle: string;
  employerName: string;
  monthlyIncome: string;
  
  // Property
  property: string;
  unit: string;
  
  // Additional
  additionalNotes: string;
  authorizeCriminalCheck: boolean;
  authorizeCreditCheck: boolean;
  
  // Dates
  submittedAt: string;
};

export async function generateApplicationPDF(data: ApplicationData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('Rental Application', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text(`Submitted: ${data.submittedAt}`, { align: 'center' });
      doc.moveDown(1);

      // Personal Information Section
      doc.fontSize(14).font('Helvetica-Bold').text('Personal Information', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Name: ${data.firstName} ${data.lastName}`);
      doc.text(`Email: ${data.email}`);
      doc.text(`Phone: ${data.phone}`);
      doc.text(`Date of Birth: ${data.dateOfBirth}`);
      doc.text(`Social Security Number: ${data.ssn}`);
      doc.moveDown(1);

      // Current Address Section
      doc.fontSize(14).font('Helvetica-Bold').text('Current Address', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica');
      if (data.currentAddress) doc.text(`Address: ${data.currentAddress}`);
      if (data.city) doc.text(`City: ${data.city}`);
      if (data.state) doc.text(`State: ${data.state}`);
      if (data.zipCode) doc.text(`ZIP Code: ${data.zipCode}`);
      doc.moveDown(1);

      // Previous Address 1 Section
      if (data.previousAddress1 || data.previousCity1 || data.previousState1 || data.previousZipCode1) {
        doc.fontSize(14).font('Helvetica-Bold').text('Previous Address 1', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        if (data.previousAddress1) doc.text(`Address: ${data.previousAddress1}`);
        if (data.previousCity1) doc.text(`City: ${data.previousCity1}`);
        if (data.previousState1) doc.text(`State: ${data.previousState1}`);
        if (data.previousZipCode1) doc.text(`ZIP Code: ${data.previousZipCode1}`);
        doc.moveDown(1);
      }

      // Previous Address 2 Section
      if (data.previousAddress2 || data.previousCity2 || data.previousState2 || data.previousZipCode2) {
        doc.fontSize(14).font('Helvetica-Bold').text('Previous Address 2', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        if (data.previousAddress2) doc.text(`Address: ${data.previousAddress2}`);
        if (data.previousCity2) doc.text(`City: ${data.previousCity2}`);
        if (data.previousState2) doc.text(`State: ${data.previousState2}`);
        if (data.previousZipCode2) doc.text(`ZIP Code: ${data.previousZipCode2}`);
        doc.moveDown(1);
      }

      // Current Landlord Section
      if (data.landlordName || data.landlordPhone || data.landlordEmail) {
        doc.fontSize(14).font('Helvetica-Bold').text('Current Landlord Information', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        if (data.landlordName) doc.text(`Landlord Name: ${data.landlordName}`);
        if (data.landlordPhone) doc.text(`Landlord Phone: ${data.landlordPhone}`);
        if (data.landlordEmail) doc.text(`Landlord Email: ${data.landlordEmail}`);
        doc.moveDown(1);
      }

      // Personal References Section
      if (data.references && data.references.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('Personal References', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        data.references.forEach((ref, index) => {
          doc.text(`Reference ${index + 1}:`);
          doc.text(`  Name: ${ref.name}`);
          doc.text(`  Relationship: ${ref.relationship}`);
          doc.text(`  Phone: ${ref.phone}`);
          if (ref.email) doc.text(`  Email: ${ref.email}`);
          doc.moveDown(0.5);
        });
        doc.moveDown(1);
      }

      // Pet Information Section
      doc.fontSize(14).font('Helvetica-Bold').text('Pet Information', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Has Pet: ${data.hasPet ? 'Yes' : 'No'}`);
      if (data.hasPet && data.petType) {
        doc.text(`Pet Type: ${data.petType}`);
      }
      doc.moveDown(1);

      // Employment Information Section
      doc.fontSize(14).font('Helvetica-Bold').text('Employment Information', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica');
      if (data.jobTitle) doc.text(`Job Title: ${data.jobTitle}`);
      if (data.employerName) doc.text(`Employer: ${data.employerName}`);
      doc.text(`Monthly Income: $${data.monthlyIncome}`);
      doc.moveDown(1);

      // Property Interest Section
      doc.fontSize(14).font('Helvetica-Bold').text('Property Interest', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Property: ${data.property}`);
      if (data.unit) doc.text(`Unit: ${data.unit}`);
      doc.moveDown(1);

      // Authorizations Section
      doc.fontSize(14).font('Helvetica-Bold').text('Authorizations', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Criminal Background Check: ${data.authorizeCriminalCheck ? 'Authorized ✓' : 'Not Authorized'}`);
      doc.text(`Credit Check: ${data.authorizeCreditCheck ? 'Authorized ✓' : 'Not Authorized'}`);
      doc.moveDown(1);

      // Additional Notes Section
      if (data.additionalNotes) {
        doc.fontSize(14).font('Helvetica-Bold').text('Additional Notes', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        doc.text(data.additionalNotes, { align: 'left' });
        doc.moveDown(1);
      }

      // Footer
      doc.fontSize(8).font('Helvetica').text(
        'By submitting this application, the applicant acknowledges that all information provided is true and accurate.',
        { align: 'center' }
      );
      doc.moveDown(0.5);
      doc.text(
        'This signature authorizes Ultimate Property Holdings to process this rental application.',
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

