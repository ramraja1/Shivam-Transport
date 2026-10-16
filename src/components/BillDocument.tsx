import { forwardRef } from 'react';
import type { Bill } from '@/lib/bills';
import { additionalChargeRows, amountInWords, formatCurrency, formatDate, getAdvance, getBalance, getTotal, getTrips, safeNumber } from '@/lib/bills';

type Props = { bill: Bill };

const BillDocument = forwardRef<HTMLDivElement, Props>(({ bill }, ref) => {
  const trips = getTrips(bill);
  const total = getTotal(bill);
  return <div ref={ref} className="bill-document">
    <div className="bill-header"><div className="truck-mark">STC</div><div className="company-heading"><h1>{bill.company.companyName || 'SHIVAM TRANSPORT CARRIER'}</h1><strong>FLEET OWNER &amp; TRANSPORT CONTRACTOR</strong><p>{bill.company.address}</p><p>Email ID : {bill.company.email}</p></div><div className="contact"><span>Mob : {bill.company.phone}</span><span>Transport Bill</span></div></div>
    <div className="bill-meta"><div className="party-lines"><div>M/s. <span>{bill.partyName}</span></div><div></div><div></div></div><div className="bill-ident"><div>Bill No. <b>{bill.billNumber}</b></div><div>Date : <b>{formatDate(bill.billDate)}</b></div><div>L.R. No. <b>{bill.lrNumber}</b></div></div></div>
    <table className="transport-table"><thead><tr><th>Date</th><th>Vehicle No.</th><th>Container No.</th><th colSpan={2}>DESTINATION<div className="destination-sub"><span>From</span><span>To</span></div></th><th>AMOUNT<div className="amount-sub"><span>Rs.</span><span>P.</span></div></th></tr></thead><tbody>{trips.map((trip) => <tr className={trips.length === 1 ? 'main-transport-row' : 'trip-row'} key={trip.id}><td>{formatDate(trip.date)}</td><td>{trip.vehicleNumber}</td><td>{trip.containerNumber}</td><td>{trip.from}</td><td>{trip.to}</td><td>{formatCurrency(safeNumber(trip.freight))}</td></tr>)}<tr className="summary-start"><td colSpan={3} rowSpan={additionalChargeRows.length + 3} className="bank-cell"><strong>{bill.company.bankName}</strong><br />A/c : {bill.company.accountNumber}<br />IFSC - {bill.company.ifsc}</td><td colSpan={2}>{additionalChargeRows[0].label}</td><td>{formatCurrency(safeNumber(bill.charges[additionalChargeRows[0].key]))}</td></tr>{additionalChargeRows.slice(1).map((row) => <tr key={row.key}><td colSpan={2}>{row.label}</td><td>{formatCurrency(safeNumber(bill.charges[row.key]))}</td></tr>)}<tr><td colSpan={2} className="total-label">TOTAL</td><td className="total-value">{formatCurrency(total)}</td></tr><tr><td colSpan={2}>ADVANCE</td><td>{formatCurrency(getAdvance(bill))}</td></tr><tr><td colSpan={2} className="balance-label">BALANCE</td><td className="balance-value">{formatCurrency(getBalance(bill))}</td></tr></tbody></table>
    <div className="words-row"><span>Rupees (in words)</span><b>{amountInWords(getBalance(bill))}</b></div><div className="sign-row"><span>PAN NO. : {bill.company.pan}</span><strong>For {bill.company.companyName || 'SHIVAM TRANSPORT CARRIER'}</strong></div><div className="bill-footer"><span>{bill.company.footerNote}</span><b>GST / by Consignor/Consignee</b></div>
  </div>;
});
BillDocument.displayName = 'BillDocument';
export default BillDocument;
