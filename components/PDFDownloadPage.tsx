import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FLAT_OWNERS } from '../constants';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FileDown, RefreshCw } from 'lucide-react';

// English months array to map logic consistently
const MONTHS_LOGIC = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

interface PaymentData {
  id?: number;
  unit_text: string;
  month_name: string;
  year_num: number;
  amount: number;
  due: number;
  paid_date: string;
}

interface MonthlyRecord {
  month: string;
  date: string;
  amount: number;
  due: number;
  status: 'PAID' | 'DUE' | 'UPCOMING' | 'PARTIAL';
}

export const PDFDownloadPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<MonthlyRecord[]>([]);
  const [unit, setUnit] = useState('');
  const [year, setYear] = useState(2026);
  const [viewMode, setViewMode] = useState<'SERVICE' | 'PARKING'>('SERVICE');
  const [ownerName, setOwnerName] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDue, setTotalDue] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const unitParam = params.get('unit') || '';
    const yearParam = parseInt(params.get('year') || '2026');
    const typeParam = params.get('type') as 'SERVICE' | 'PARKING' || 'SERVICE';

    setUnit(unitParam);
    setYear(yearParam);
    setViewMode(typeParam);

    // Fetch Data
    const fetchData = async () => {
      try {
        const { data: payData, error } = await supabase
          .from('payments')
          .select('*')
          .eq('year_num', yearParam);

        if (error) throw error;

        const dbData = payData as PaymentData[];
        const dbUnitText = typeParam === 'PARKING' ? `${unitParam}_P` : unitParam;

        const calculatedRecords = MONTHS_LOGIC.map((month, index) => {
          const paymentRecord = dbData.find(
            d => d.unit_text === dbUnitText && d.month_name === month
          );

          if (paymentRecord) {
            let recStatus: 'PAID' | 'DUE' | 'UPCOMING' | 'PARTIAL' = 'DUE';
            if (paymentRecord.amount > 0 && paymentRecord.due > 0) recStatus = 'PARTIAL';
            else if (paymentRecord.amount > 0) recStatus = 'PAID';
            else if (paymentRecord.amount === 0 && paymentRecord.due === 0) recStatus = 'UPCOMING';

            return {
              month: month,
              date: paymentRecord.paid_date || '-',
              amount: paymentRecord.amount,
              due: paymentRecord.due,
              status: recStatus
            };
          }

          // Default Logic
          const now = new Date();
          const currentRealYear = now.getFullYear();
          const currentRealMonthIdx = now.getMonth();
          const isFuture = yearParam > currentRealYear || (yearParam === currentRealYear && index > currentRealMonthIdx);

          let defaultAmount = 0;
          // Basic default logic (can be refined if needed, but 0 is safe for defaults)
           if (typeParam === 'SERVICE') {
              defaultAmount = (unitParam.slice(-1) !== 'B') ? 2000 : 500;
          }

          if (isFuture) {
            return { month: month, date: '-', amount: 0, due: 0, status: 'UPCOMING' as const };
          } else {
            return { month: month, date: '-', amount: 0, due: defaultAmount, status: 'DUE' as const };
          }
        });

        setRecords(calculatedRecords);
        setTotalAmount(calculatedRecords.reduce((sum, r) => sum + r.amount, 0));
        setTotalDue(calculatedRecords.reduce((sum, r) => sum + r.due, 0));

        // Owner Name
        const owner = FLAT_OWNERS.find(f => f.flat === unitParam)?.name || 'Unknown';
        setOwnerName(owner);

      } catch (err) {
        console.error("Error fetching PDF data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    const element = document.getElementById('pdf-content');
    if (!element) return;

    try {
      // Wait for images
      const images = element.getElementsByTagName('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => { 
            img.onload = resolve; 
            img.onerror = resolve;
            setTimeout(resolve, 2000); 
        });
      }));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = viewMode === 'PARKING' ? `Parking_Charge_${unit}_${year}.pdf` : `Service_Charge_${unit}_${year}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error("PDF Generation failed:", error);
      alert("পিডিএফ ডাউনলোড করতে সমস্যা হয়েছে।");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto text-indigo-600 mb-4" size={32} />
          <p className="text-slate-600 font-medium">তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  const title = viewMode === 'PARKING' ? 'হলান টাওয়ার - পার্কিং চার্জ স্টেটমেন্ট' : 'হলান টাওয়ার - সার্ভিস চার্জ স্টেটমেন্ট';
  const timestamp = new Date().toLocaleString('bn-BD', { 
      year: 'numeric', month: 'long', day: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex flex-col items-center">
      {/* Action Bar */}
      <div className="w-full max-w-[800px] mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <div>
           <h1 className="text-lg font-bold text-slate-800">পিডিএফ প্রিভিউ</h1>
           <p className="text-xs text-slate-500">ইউনিট: {unit} | বছর: {year}</p>
        </div>
        <button 
          onClick={handleDownload}
          disabled={isGenerating}
          className={`flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-all active:scale-95 ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isGenerating ? <RefreshCw size={20} className="animate-spin" /> : <FileDown size={20} />}
          {isGenerating ? 'তৈরি হচ্ছে...' : 'ডাউনলোড করুন'}
        </button>
      </div>

      {/* PDF Content (Visible) */}
      <div className="bg-white shadow-2xl w-full max-w-[800px] overflow-hidden" style={{ minHeight: '1131px' }}>
        <div id="pdf-content" style={{ padding: '40px', position: 'relative', minHeight: '1131px', display: 'flex', flexDirection: 'column', backgroundColor: 'white', color: 'black', fontFamily: '"Inter", sans-serif' }}>
          
          {/* Header Section */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', paddingBottom: '10px', gap: '20px' }}>
            <div>
              <img src="https://i.imghippo.com/files/xPV6164w.png" crossOrigin="anonymous" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ color: '#9333ea', margin: 0, fontSize: '42px', fontWeight: 900, fontFamily: '"Inter", sans-serif' }}>হলান টাওয়ার</h1>
              <h2 style={{ color: '#000', margin: 0, fontSize: '36px', fontWeight: 900, letterSpacing: '4px', fontFamily: '"Inter", sans-serif' }}>HOLAN TOWER</h2>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', fontWeight: 800, color: '#000' }}>HOUSE #755 | HOLAN | WARD NO : 48 | DAKSHINKHAN | DHAKA 1230</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: 700, color: '#000' }}>holantower@gmail.com | www.holantower.blogspot.com | www.facebook.com/holantower</p>
            </div>
          </div>
          
          {/* Header Line */}
          <div style={{ height: '4px', backgroundColor: '#000', marginBottom: '40px', width: '100%' }}></div>

          {/* Watermark */}
          <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.06, zIndex: 0, width: '70%', pointerEvents: 'none' }}>
            <img src="https://i.imghippo.com/files/xPV6164w.png" crossOrigin="anonymous" style={{ width: '100%' }} />
          </div>

          {/* Content Section */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ textAlign: 'center', color: '#4f46e5', marginBottom: '20px', fontSize: '24px' }}>{title}</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
              <div>
                <p style={{ margin: '5px 0', fontSize: '16px' }}><strong>ইউনিট:</strong> <span style={{ color: '#4f46e5' }}>{unit}</span></p>
                <p style={{ margin: '5px 0', fontSize: '16px' }}><strong>মালিক:</strong> {ownerName}</p>
                <p style={{ margin: '5px 0', fontSize: '16px' }}><strong>বছর:</strong> {year}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '5px 0', color: '#16a34a', fontSize: '16px' }}><strong>মোট পরিশোধ:</strong> ৳{totalAmount.toLocaleString()}</p>
                <p style={{ margin: '5px 0', color: '#dc2626', fontSize: '16px' }}><strong>মোট বকেয়া:</strong> ৳{totalDue.toLocaleString()}</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#4f46e5', color: 'white' }}>
                  <th style={{ padding: '15px', border: '1px solid #e2e8f0', textAlign: 'left' }}>মাস</th>
                  <th style={{ padding: '15px', border: '1px solid #e2e8f0', textAlign: 'left' }}>তারিখ</th>
                  <th style={{ padding: '15px', border: '1px solid #e2e8f0', textAlign: 'right' }}>পরিমাণ</th>
                  <th style={{ padding: '15px', border: '1px solid #e2e8f0', textAlign: 'right' }}>বকেয়া</th>
                  <th style={{ padding: '15px', border: '1px solid #e2e8f0', textAlign: 'center' }}>অবস্থা</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i} style={{ backgroundColor: r.status === 'DUE' ? '#fff1f2' : 'transparent' }}>
                    <td style={{ padding: '12px', border: '1px solid #e2e8f0', fontWeight: 600 }}>{r.month}</td>
                    <td style={{ padding: '12px', border: '1px solid #e2e8f0' }}>{r.date || '-'}</td>
                    <td style={{ padding: '12px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 600 }}>৳{r.amount}</td>
                    <td style={{ padding: '12px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 600, color: r.due > 0 ? '#dc2626' : 'inherit' }}>৳{r.due}</td>
                    <td style={{ padding: '12px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 800, color: r.status === 'PAID' ? '#16a34a' : (r.status === 'DUE' ? '#dc2626' : '#854d0e') }}>
                      {r.status === 'PAID' ? 'পরিশোধিত' : (r.status === 'DUE' ? 'বকেয়া' : (r.status === 'PARTIAL' ? 'আংশিক' : 'আসন্ন'))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 900, fontSize: '16px' }}>
                  <td colSpan={2} style={{ padding: '15px', border: '1px solid #e2e8f0', textAlign: 'center' }}>সর্বমোট হিসাব</td>
                  <td style={{ padding: '15px', border: '1px solid #e2e8f0', textAlign: 'right', color: '#16a34a' }}>৳{totalAmount.toLocaleString()}</td>
                  <td style={{ padding: '15px', border: '1px solid #e2e8f0', textAlign: 'right', color: '#dc2626' }}>৳{totalDue.toLocaleString()}</td>
                  <td style={{ padding: '15px', border: '1px solid #e2e8f0' }}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '12px', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '20px', paddingBottom: '20px' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>হলান টাওয়ার ম্যানেজমেন্ট সিস্টেম কর্তৃক স্বয়ংক্রিয়ভাবে জেনারেট করা রিপোর্ট।</p>
            <p style={{ margin: '5px 0 0 0' }}>House #755, Holan, Dakshinkhan, Dhaka-1230</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#94a3b8' }}>ডাউনলোডের সময়: {timestamp}</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', fontWeight: 'bold', color: '#9333ea' }}>Design By A.H.M RIFAT HASAN</p>
          </div>
        </div>
      </div>
    </div>
  );
};
