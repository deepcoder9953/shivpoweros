import React, { useRef } from 'react';
import {
  Quotation,
  getStatusLabel,
  getStatusBadgeClass,
  isQuotationExpired,
  formatINR,
} from '../../types/quotation';
import {
  X,
  Printer,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShieldCheck,
} from 'lucide-react';

interface QuotationPreviewModalProps {
  isOpen: boolean;
  quotation: Quotation | null;
  onClose: () => void;
  onEdit?: (quotation: Quotation) => void;
}

export const QuotationPreviewModal: React.FC<QuotationPreviewModalProps> = ({
  isOpen,
  quotation,
  onClose,
  onEdit,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !quotation) return null;

  const expired = isQuotationExpired(quotation);
  const statusLabel = getStatusLabel(quotation.status);

  // Line items
  const items = quotation.items || [];
  const amount = quotation.amount || quotation.subtotal || 0;
  const tax = quotation.tax || 0;
  const total = quotation.total || amount + tax;
  const taxPercent = amount > 0 ? Math.round((tax / amount) * 100) : 18;

  const quotationDate = quotation.quotation_date || quotation.created_at.split('T')[0];
  const validityDate = quotation.valid_until || quotation.validity_date || '30 Days from issue';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      {/* Container with Print Specific styling */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Modal Action Bar (Hidden during window.print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Quotation Preview — {quotation.quotation_number}</span>
                <span
                  className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(
                    quotation.status,
                    expired
                  )}`}
                >
                  {expired ? 'Expired' : statusLabel}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Official document format for Shiv Power Solution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(quotation)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
              >
                Edit Details
              </button>
            )}

            <button
              id="print-quotation-action-btn"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div
          ref={printAreaRef}
          id="printable-quotation-sheet"
          className="p-6 sm:p-10 bg-white text-slate-900 print:p-0 print:m-0 print:text-black font-sans"
        >
          {/* Print specific CSS inline for full fidelity */}
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-quotation-sheet, #printable-quotation-sheet * {
                visibility: visible;
              }
              #printable-quotation-sheet {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 15mm !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
                background: white !important;
              }
              nav, header, footer, button, .print\\:hidden {
                display: none !important;
              }
              @page {
                size: A4 portrait;
                margin: 10mm;
              }
            }
          `}</style>

          {/* 1. Shiv Power Solution Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-xl tracking-tight shadow-xs">
                  SPS
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                    Shiv Power Solution
                  </h1>
                  <p className="text-2xs sm:text-xs font-semibold text-blue-700 tracking-wide uppercase">
                    Industrial Power Backup • Solar EPC • HT/LT Panels • Transformers
                  </p>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-600 space-y-0.5 leading-relaxed">
                <p className="font-medium">Plot No. 128, Industrial Area Phase-2, Panchkula, Haryana - 134113</p>
                <p>Regional Office: Institutional Area, Sector 62, Noida, Uttar Pradesh - 201309</p>
                <p className="font-semibold text-slate-800">
                  GSTIN: <span className="font-mono">06AAFPS9988K1Z4</span> | PAN: <span className="font-mono">AAFPS9988K</span>
                </p>
                <p>Phone: +91 98120 12345, +91 98120 67890 | Email: sales@shivpower.com</p>
              </div>
            </div>

            {/* Quotation Identity Card */}
            <div className="sm:text-right bg-slate-50 print:bg-slate-50 p-4 rounded-xl border border-slate-200 min-w-[240px]">
              <span className="text-2xs font-extrabold uppercase tracking-widest text-blue-700 block">
                COMMERCIAL QUOTATION
              </span>
              <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                {quotation.quotation_number}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 text-xs space-y-1">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-medium">Date:</span>
                  <span className="font-semibold text-slate-800">{quotationDate}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-medium">Valid Until:</span>
                  <span className={`font-semibold ${expired ? 'text-rose-600' : 'text-slate-800'}`}>
                    {validityDate}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 font-medium">Status:</span>
                  <span className="font-bold uppercase text-2xs text-slate-900">{statusLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Customer & Project Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
            <div>
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Quotation Prepared For:
              </span>
              <div className="text-base font-bold text-slate-900">
                {quotation.customer?.company_name || quotation.customer_name || 'Client Account'}
              </div>
              {quotation.customer?.contact_person && (
                <div className="text-xs text-slate-700 font-medium mt-0.5">
                  Attn: {quotation.customer.contact_person}
                </div>
              )}
              {quotation.customer?.address && (
                <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {quotation.customer.address}
                </div>
              )}
              <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                {quotation.customer?.phone && <p>Phone: {quotation.customer.phone}</p>}
                {quotation.customer?.email && <p>Email: {quotation.customer.email}</p>}
                {quotation.customer?.gst_number && (
                  <p className="font-medium text-slate-800">
                    GSTIN: <span className="font-mono">{quotation.customer.gst_number}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="sm:border-l sm:border-slate-200 sm:pl-6">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Project & Scope Reference:
              </span>
              <div className="text-sm font-bold text-slate-900">{quotation.title}</div>
              {quotation.description && (
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {quotation.description}
                </p>
              )}
              {quotation.project && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md border border-blue-200 text-2xs font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  <span>Linked Project: {quotation.project.project_name}</span>
                </div>
              )}
              {quotation.lead && (
                <div className="mt-1 text-2xs text-slate-500">
                  Lead Ref: {quotation.lead.company_name} ({quotation.lead.source || 'Direct'})
                </div>
              )}
            </div>
          </div>

          {/* 3. Itemized Bill of Materials / Services */}
          <div className="my-6">
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-2xs">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center w-16">Unit</th>
                    <th className="py-2.5 px-3 text-right w-16">Qty</th>
                    <th className="py-2.5 px-3 text-right w-28">Unit Price (₹)</th>
                    <th className="py-2.5 px-4 text-right w-32">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400 italic">
                        No line items added yet.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 text-center text-slate-500 font-mono font-medium">
                          {index + 1}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{item.item_name}</div>
                          {item.description && (
                            <div className="text-2xs text-slate-500 mt-0.5 leading-relaxed">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600 font-medium">
                          {item.unit || 'Nos'}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-800">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700">
                          {Number(item.unit_price).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {Number(item.total).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Totals Breakdown */}
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="text-xs text-slate-500 sm:max-w-md space-y-1">
                <span className="font-bold text-slate-700 uppercase tracking-wide text-2xs block">
                  Amount in Words:
                </span>
                <p className="italic text-slate-600 capitalize bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  Indian Rupees {numberToIndianWords(Math.round(total))} Only
                </p>
              </div>

              <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal (Net Amount):</span>
                  <span className="font-mono font-semibold text-slate-900">{formatINR(amount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST / Tax ({taxPercent}%):</span>
                  <span className="font-mono font-semibold text-slate-900">{formatINR(tax)}</span>
                </div>
                <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline font-black text-sm text-slate-900">
                  <span>Total Amount:</span>
                  <span className="text-base text-blue-700 font-mono">{formatINR(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Terms & Conditions and Bank Details */}
          <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-2xs mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Commercial Terms & Conditions</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-2xs text-slate-600 leading-relaxed">
                <li>Price Basis: FOR Site delivery inclusive of freight and transit insurance.</li>
                <li>Payment: 40% Advance with PO, 50% against PI before dispatch, 10% on commissioning.</li>
                <li>Delivery Schedule: 2-3 weeks from receipt of clear purchase order with advance.</li>
                <li>Warranty: 24 Months standard OEM warranty from date of commissioning.</li>
                <li>Validity: Valid up to {validityDate}. Subject to review thereafter.</li>
              </ol>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-2xs mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Official Bank Account for RTGS / NEFT</span>
              </h4>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5 text-2xs text-slate-700 font-mono">
                <p className="font-bold font-sans text-slate-900">A/C Name: SHIV POWER SOLUTION</p>
                <p>Bank: HDFC Bank Ltd.</p>
                <p>Account No: 50200045678912 (Current A/C)</p>
                <p>IFSC Code: HDFC0000180</p>
                <p>Branch: Industrial Area Phase-2, Panchkula</p>
              </div>
            </div>
          </div>

          {/* 5. Authorized Signatures */}
          <div className="mt-8 pt-6 border-t-2 border-slate-900 flex justify-between items-end text-xs">
            <div className="text-2xs text-slate-500">
              <p>This is a computer-generated commercial quotation.</p>
              <p>Shiv Power Solution • Powering Industries with Reliability</p>
            </div>

            <div className="text-center w-52">
              <div className="h-12 flex items-center justify-center text-slate-400 italic text-2xs">
                [Authorized Commercial Seal & Signature]
              </div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                For SHIV POWER SOLUTION
              </div>
              <div className="text-2xs text-slate-500">Authorized Signatory</div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer (Hidden during window.print) */}
        <div className="print:hidden px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500">
            Click "Print / Save PDF" to generate an official printout or save as a digital PDF file.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper: Convert integer amount into Indian Rupees in words
function numberToIndianWords(num: number): string {
  if (num === 0) return 'Zero';

  const a = [
    '',
    'One ',
    'Two ',
    'Three ',
    'Four ',
    'Five ',
    'Six ',
    'Seven ',
    'Eight ',
    'Nine ',
    'Ten ',
    'Eleven ',
    'Twelve ',
    'Thirteen ',
    'Fourteen ',
    'Fifteen ',
    'Sixteen ',
    'Seventeen ',
    'Eighteen ',
    'Nineteen ',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number): string => {
    let str = '';
    if (n > 19) {
      str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
    } else {
      str += a[n];
    }
    return str.trim();
  };

  let output = '';
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = Math.floor(num / 100);
  const rem = num % 100;

  if (crore > 0) output += inWords(crore) + ' Crore ';
  if (lakh > 0) output += inWords(lakh) + ' Lakh ';
  if (thousand > 0) output += inWords(thousand) + ' Thousand ';
  if (hundred > 0) output += inWords(hundred) + ' Hundred ';
  if (rem > 0) output += (output !== '' ? 'and ' : '') + inWords(rem) + ' ';

  return output.trim();
}
