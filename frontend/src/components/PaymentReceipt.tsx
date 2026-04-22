import { forwardRef } from "react";
import { format } from "date-fns";
import { Building2, CheckCircle2 } from "lucide-react";

interface PaymentReceiptProps {
  tenantName: string;
  roomNumber: string;
  month: string;
  amount: number;
  paidDate: string;
  method: string;
  transactionId?: string;
}

export const PaymentReceipt = forwardRef<HTMLDivElement, PaymentReceiptProps>(
  ({ tenantName, roomNumber, month, amount, paidDate, method, transactionId }, ref) => {
    const receiptNo = transactionId || `RCP${Date.now().toString().slice(-8)}`;
    
    return (
      <div ref={ref} className="bg-white p-8 max-w-md mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="h-8 w-8 text-blue-900" />
            <h1 className="text-2xl font-bold text-gray-900">PG Accommodation</h1>
          </div>
          <p className="text-gray-600 text-sm">123 College Road, City - 560001</p>
          <p className="text-gray-600 text-sm">Phone: +91 9876543210</p>
        </div>

        {/* Receipt Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Payment Receipt</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-green-600 font-medium">Payment Successful</span>
          </div>
        </div>

        {/* Receipt Details */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Receipt No:</span>
            <span className="font-medium">{receiptNo}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Transaction ID:</span>
            <span className="font-medium">{transactionId || `TXN${Date.now().toString().slice(-10)}`}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{format(new Date(paidDate), 'dd MMM yyyy, hh:mm a')}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Tenant Name:</span>
            <span className="font-medium">{tenantName}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Room Number:</span>
            <span className="font-medium">{roomNumber}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Month:</span>
            <span className="font-medium">{month}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-medium capitalize">{method}</span>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">Total Amount Paid</span>
            <span className="text-2xl font-bold text-green-600">₹{amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs border-t pt-4">
          <p>This is a computer-generated receipt and does not require a signature.</p>
          <p className="mt-1">Thank you for your payment!</p>
        </div>
      </div>
    );
  }
);

PaymentReceipt.displayName = "PaymentReceipt";

// Function to generate and download PDF-like receipt
export const downloadReceipt = (data: PaymentReceiptProps) => {
  const transactionId = data.transactionId || `TXN${Date.now().toString().slice(-10)}`;
  const receiptNo = `RCP${Date.now().toString().slice(-8)}`;
  
  const receiptContent = `
=====================================
       PG ACCOMMODATION
    123 College Road, City - 560001
       Phone: +91 9876543210
=====================================

       PAYMENT RECEIPT
       ✓ Payment Successful

-------------------------------------
Receipt No:     ${receiptNo}
Transaction ID: ${transactionId}
Date:           ${format(new Date(data.paidDate), 'dd MMM yyyy, hh:mm a')}
-------------------------------------

Tenant Name:    ${data.tenantName}
Room Number:    ${data.roomNumber}
Month:          ${data.month}
Payment Method: ${data.method.toUpperCase()}

-------------------------------------
TOTAL AMOUNT PAID: ₹${data.amount.toLocaleString()}
-------------------------------------

This is a computer-generated receipt.
Thank you for your payment!

=====================================
  `;

  const blob = new Blob([receiptContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Receipt_${data.tenantName.replace(/\s+/g, '_')}_${data.month.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
