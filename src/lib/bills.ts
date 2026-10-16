export type ChargeKey = 'freight' | 'detention' | 'other' | 'unloading' | 'weight' | 'parking';

export type Trip = {
  id: string;
  date: string;
  vehicleNumber: string;
  containerNumber: string;
  from: string;
  to: string;
  freight: string;
};

export type CompanyDetails = {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  pan: string;
  gstin: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  footerNote: string;
};

export type Bill = {
  id: string;
  billNumber: string;
  billDate: string;
  lrNumber: string;
  partyName: string;
  vehicleNumber: string;
  containerNumber: string;
  from: string;
  to: string;
  weight: string;
  charges: Record<ChargeKey, string>;
  advance: string;
  trips: Trip[];
  company: CompanyDetails;
  createdAt: string;
  updatedAt: string;
};

export const chargeRows: { key: ChargeKey; label: string }[] = [
  { key: 'freight', label: 'Freight' },
  { key: 'detention', label: 'Detention' },
  { key: 'other', label: 'Other Ch.' },
  { key: 'unloading', label: 'Unloading Ch.' },
  { key: 'weight', label: 'Weight Ch.' },
  { key: 'parking', label: 'Parking Ch.' },
];

export const additionalChargeRows = chargeRows.filter((row) => row.key !== 'freight');

export const defaultCompany: CompanyDetails = {
  companyName: 'SHIVAM TRANSPORT CARRIER',
  address: 'LIG-II, Room No. G-67, Sec-2E, Kalamboli, Navi Mumbai - 410218.',
  phone: '9867941775 / 8169587895',
  email: 'banshilaljaiswal6953@gmail.com',
  pan: 'ANJPJ 1598E',
  gstin: '',
  bankName: 'HDFC BANK, KHANDA COLONY',
  accountHolder: '',
  accountNumber: '50200025273501',
  ifsc: 'HDFC0002868',
  footerNote: 'Subject to Panvel Jurisdiction\nNote : Interest Will be charges @ 24% if the bill unpaid Within 15 days after Submission of bill.',
};

export const emptyCharges = (): Record<ChargeKey, string> => ({ freight: '', detention: '', other: '', unloading: '', weight: '', parking: '' });
export const getToday = (): string => new Date().toISOString().slice(0, 10);
export const newTrip = (date = getToday()): Trip => ({ id: crypto.randomUUID(), date, vehicleNumber: '', containerNumber: '', from: '', to: '', freight: '' });
export const safeNumber = (value: string | number): number => { const parsed = Number(value); return Number.isFinite(parsed) && parsed > 0 ? parsed : 0; };

const normalizedTrips = (bill: Pick<Bill, 'trips' | 'vehicleNumber' | 'containerNumber' | 'from' | 'to' | 'billDate' | 'charges'>): Trip[] => bill.trips?.length ? bill.trips : [{ id: 'legacy-trip', date: bill.billDate, vehicleNumber: bill.vehicleNumber, containerNumber: bill.containerNumber, from: bill.from, to: bill.to, freight: bill.charges.freight || '' }];
export const getTrips = (bill: Pick<Bill, 'trips' | 'vehicleNumber' | 'containerNumber' | 'from' | 'to' | 'billDate' | 'charges'>): Trip[] => normalizedTrips(bill);
export const getFreightTotal = (bill: Pick<Bill, 'trips' | 'vehicleNumber' | 'containerNumber' | 'from' | 'to' | 'billDate' | 'charges'>): number => normalizedTrips(bill).reduce((sum, trip) => sum + safeNumber(trip.freight), 0);
export const getTotal = (bill: Pick<Bill, 'trips' | 'vehicleNumber' | 'containerNumber' | 'from' | 'to' | 'billDate' | 'charges'>): number => getFreightTotal(bill) + additionalChargeRows.reduce((total, row) => total + safeNumber(bill.charges[row.key]), 0);
export const getAdvance = (bill: Pick<Bill, 'advance'>): number => safeNumber(bill.advance);
export const getBalance = (bill: Pick<Bill, 'trips' | 'vehicleNumber' | 'containerNumber' | 'from' | 'to' | 'billDate' | 'charges' | 'advance'>): number => getTotal(bill) - getAdvance(bill);

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const underThousand = (value: number): string => value < 20 ? ones[value] : value < 100 ? `${tens[Math.floor(value / 10)]}${value % 10 ? ` ${ones[value % 10]}` : ''}` : `${ones[Math.floor(value / 100)]} Hundred${value % 100 ? ` ${underThousand(value % 100)}` : ''}`;
const indianWords = (input: number): string => { if (input === 0) return 'Zero'; let value = input; const parts: string[] = []; const crore = Math.floor(value / 10000000); value %= 10000000; const lakh = Math.floor(value / 100000); value %= 100000; const thousand = Math.floor(value / 1000); value %= 1000; if (crore) parts.push(`${underThousand(crore)} Crore`); if (lakh) parts.push(`${underThousand(lakh)} Lakh`); if (thousand) parts.push(`${underThousand(thousand)} Thousand`); if (value) parts.push(underThousand(value)); return parts.join(' '); };
export const amountInWords = (value: number): string => { const rounded = Math.max(0, Math.round(value * 100) / 100); const rupees = Math.floor(rounded); const paise = Math.round((rounded - rupees) * 100); return `Rupees ${indianWords(rupees)}${paise ? ` and ${indianWords(paise)} Paise` : ''} Only`; };
export const formatCurrency = (value: number): string => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
export const formatDate = (value: string): string => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-IN') : '';

export const nextBillNumber = (bills: Bill[]): string => String(bills.reduce((max, bill) => Math.max(max, Number(bill.billNumber.replace(/\D/g, '')) || 0), 5645) + 1);
export const makeNewBill = (bills: Bill[], company: CompanyDetails): Bill => ({ id: crypto.randomUUID(), billNumber: nextBillNumber(bills), billDate: getToday(), lrNumber: '', partyName: '', vehicleNumber: '', containerNumber: '', from: '', to: '', weight: '', charges: emptyCharges(), advance: '', trips: [newTrip()], company, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

export const migrateBill = (raw: Partial<Bill>): Bill => {
  const charges = { ...emptyCharges(), ...raw.charges };
  const trips = raw.trips?.length ? raw.trips : [{ id: 'legacy-trip', date: raw.billDate || getToday(), vehicleNumber: raw.vehicleNumber || '', containerNumber: raw.containerNumber || '', from: raw.from || '', to: raw.to || '', freight: charges.freight || '' }];
  return { id: raw.id || crypto.randomUUID(), billNumber: raw.billNumber || '', billDate: raw.billDate || getToday(), lrNumber: raw.lrNumber || '', partyName: raw.partyName || '', vehicleNumber: raw.vehicleNumber || trips[0].vehicleNumber, containerNumber: raw.containerNumber || trips[0].containerNumber, from: raw.from || trips[0].from, to: raw.to || trips[0].to, weight: raw.weight || '', charges, advance: raw.advance || '', trips, company: { ...defaultCompany, ...raw.company }, createdAt: raw.createdAt || new Date().toISOString(), updatedAt: raw.updatedAt || new Date().toISOString() };
};
export const loadBills = (): Bill[] => { try { return (JSON.parse(localStorage.getItem('shivam-bills') || '[]') as Partial<Bill>[]).map(migrateBill); } catch { return []; } };
export const saveBills = (bills: Bill[]): void => localStorage.setItem('shivam-bills', JSON.stringify(bills));
export const loadCompany = (): CompanyDetails => { try { return { ...defaultCompany, ...JSON.parse(localStorage.getItem('shivam-company') || '{}') as Partial<CompanyDetails> }; } catch { return defaultCompany; } };
export const saveCompany = (company: CompanyDetails): void => localStorage.setItem('shivam-company', JSON.stringify(company));
