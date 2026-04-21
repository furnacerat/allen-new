'use client';
import { ReactNode } from 'react';
import { BusinessProfile } from '@/domain/types';

interface PrintLayoutProps {
  children: ReactNode;
  business: BusinessProfile;
  documentTitle: string;
  documentId?: string;
  referenceDate?: string;
  footerNotesOverride?: string;
}

export function PrintLayout({ 
  children, 
  business, 
  documentTitle, 
  documentId, 
  referenceDate,
  footerNotesOverride 
}: PrintLayoutProps) {
  
  const footerNotes = footerNotesOverride !== undefined ? footerNotesOverride : business.footerNotes;

  return (
    <div className="bg-white min-h-screen p-8 text-black font-sans leading-relaxed print:p-0 print:bg-white print:m-0">
      <div className="max-w-[800px] mx-auto bg-white p-10 border border-gray-100 shadow-sm print:border-none print:shadow-none print:max-w-none print:w-[8.5in] print:p-0 print:mx-0">
        
        {/* Universal Print Header */}
        <div className="flex justify-between items-start mb-12 border-b-2 border-black pb-8">
          <div className="space-y-4">
             <div className="space-y-1">
                <h1 className="text-4xl font-black uppercase tracking-tighter text-black">{business.businessName}</h1>
                <p className="text-sm font-bold text-gray-500 italic">Professional Contractor Services</p>
             </div>
             <div className="text-xs space-y-0.5">
                {business.address && <p>{business.address}</p>}
                <p>{[business.phone, business.email].filter(Boolean).join(' • ')}</p>
                {business.licenseNumber && <p className="font-bold">License: {business.licenseNumber}</p>}
             </div>
          </div>
          <div className="text-right space-y-2">
            <h2 className="text-5xl font-black text-gray-200 uppercase tracking-tighter">{documentTitle}</h2>
            <div className="space-y-1">
               {documentId && <p className="text-lg font-bold">#{documentId}</p>}
               {referenceDate && (
                 <div className="inline-block px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest mt-2">
                    Date: {new Date(referenceDate).toLocaleDateString()}
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="print-content-wrapper min-h-[400px]">
           {children}
        </div>

        {/* Universal Print Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 break-inside-avoid">
           {(footerNotes) && (
              <div className="mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Notes / Instructions</h3>
                <p className="text-xs text-gray-600 italic whitespace-pre-wrap">{footerNotes}</p>
              </div>
           )}
           <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] flex justify-between items-center bg-gray-50 p-4 rounded-sm">
             <div>{business.businessName} • Thank you for your business!</div>
             <div>Generated using Allen's Contractor OS</div>
           </div>
        </div>

      </div>

      {/* Global Print Overrides */}
      <style jsx global>{`
        @page {
          size: letter;
          margin: 0.5in;
        }
        @media print {
          html, body {
            width: 100%;
            height: 100%;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          nav, aside, .print\\:hidden, button {
            display: none !important;
          }
          .break-inside-avoid {
            break-inside: avoid;
          }
          /* Ensure backgrounds print correctly in webkit */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
