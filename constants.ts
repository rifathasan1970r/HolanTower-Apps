import { 
  Home, 
  Zap, 
  CreditCard, 
  Phone, 
  Menu as MenuIcon, 
  Key, 
  Info,
  ShieldCheck,
  Droplets,
  Trash2,
  Bot
} from 'lucide-react';
import { MenuItem, Notice } from './types';

export const APP_NAME_BN = "হলান টাওয়ার";
export const APP_NAME_EN = "Hollan Tower";

export const NOTICES: Notice[] = [
  { id: 1, text: "নোটিশ: আগামী শুক্রবার সকাল ১০টা থেকে ১২টা পর্যন্ত জেনারেটর মেইনটেনেন্স এর কাজ চলবে।", date: "2024-05-20" },
  { id: 2, text: "জরুরী: এই মাসের সার্ভিস চার্জ ১০ তারিখের মধ্যে পরিশোধ করার অনুরোধ করা হলো।", date: "2024-05-21" },
  { id: 3, text: "স্বাগতম: হলান টাওয়ার অ্যাপে আপনাকে স্বাগতম। যেকোনো তথ্যের জন্য মেনু ব্যবহার করুন।", date: "2024-05-22" }
];

export const TRANSLATIONS = {
  bn: {
    greeting: {
      morning: 'শুভ সকাল',
      afternoon: 'শুভ দুপুর',
      evening: 'শুভ বিকেল',
      night: 'শুভ সন্ধ্যা',
    },
    role: 'বাসিন্দা',
    dateLabel: 'আজকের তারিখ',
    quickAccess: 'কুইক অ্যাক্সেস',
    allServices: 'সকল সেবা',
    seeAll: 'সব দেখুন',
    recentTransactions: 'সর্বশেষ লেনদেন',
    serviceCharge: 'সার্ভিস চার্জ',
    location: 'হলান, দক্ষিণখান',
    notice: 'নোটিশ',
    months: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
    back: 'ফিরে যান',
    unit: 'ইউনিট',
    adminLogin: 'অ্যাডমিন লগইন',
    occupancy: 'বসবাসের ধরন',
    occupied: 'বসবাসরত',
    vacant: 'খালি',
    totalAmount: 'মোট টাকা',
    totalDue: 'মোট বাকি',
    totalCollected: 'মোট জমা',
    paid: 'পরিশোধিত',
    due: 'বকেয়া',
    upcoming: 'আসন্ন',
    monthDate: 'মাস ও তারিখ',
    amount: 'টাকা',
    status: 'অবস্থা',
    total: 'সর্বমোট',
    paymentStatus: 'পেমেন্ট স্ট্যাটাস',
    month: 'মাস',
    allUnitsCalc: 'সকল ইউনিট হিসাব',
    financialYear: 'অর্থবছর',
    searchUnit: 'ইউনিট খুঁজুন...',
    flatType: 'ফ্ল্যাটের ধরন',
    all: 'সকল',
    details: 'বিবরণ দেখুন',
    adminDashboard: 'অ্যাডমিন ড্যাশবোর্ড',
    editInfo: 'তথ্য পরিবর্তন করতে যেকোনো লাইনে ক্লিক করুন',
    saveFail: 'আপডেট ব্যর্থ হয়েছে',
    statusChangeFail: 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে',
    loginPrompt: 'ডেটা এডিট করতে পিন কোড দিন',
    loginBtn: 'লগইন করুন',
    demo: 'ডেমো'
  },
  en: {
    greeting: {
      morning: 'Good Morning',
      afternoon: 'Good Afternoon',
      evening: 'Good Evening',
      night: 'Good Evening',
    },
    role: 'Resident',
    dateLabel: "Today's Date",
    quickAccess: 'Quick Access',
    allServices: 'All Services',
    seeAll: 'See All',
    recentTransactions: 'Recent Transactions',
    serviceCharge: 'Service Charge',
    location: 'Holan, Dakshinkhan',
    notice: 'Notice',
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    back: 'Go Back',
    unit: 'Unit',
    adminLogin: 'Admin Login',
    occupancy: 'Occupancy',
    occupied: 'Occupied',
    vacant: 'Vacant',
    totalAmount: 'Total Amount',
    totalDue: 'Total Due',
    totalCollected: 'Total Collected',
    paid: 'Paid',
    due: 'Due',
    upcoming: 'Upcoming',
    monthDate: 'Month & Date',
    amount: 'Amount',
    status: 'Status',
    total: 'Grand Total',
    paymentStatus: 'Payment Status',
    month: 'Month',
    allUnitsCalc: 'All Units Summary',
    financialYear: 'Fiscal Year',
    searchUnit: 'Search Unit...',
    flatType: 'Flat Type',
    all: 'All',
    details: 'View Details',
    adminDashboard: 'Admin Dashboard',
    editInfo: 'Click any row to edit info',
    saveFail: 'Update failed',
    statusChangeFail: 'Status change failed',
    loginPrompt: 'Enter PIN to edit data',
    loginBtn: 'Login',
    demo: 'Demo'
  }
};

export const MENU_ITEMS: MenuItem[] = [
  { 
    id: 'service', 
    label: 'সার্ভিস চার্জ', 
    labelEn: 'Service Charge',
    icon: CreditCard, 
    view: 'SERVICE_CHARGE',
    color: 'bg-blue-500',
    description: 'মাসিক বিল ও পেমেন্ট',
    descriptionEn: 'Monthly bill & payments',
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    id: 'desco', 
    label: 'ডেসকো রিচার্জ', 
    labelEn: 'Desco Recharge',
    icon: Zap, 
    view: 'DESCO',
    color: 'bg-yellow-500',
    description: 'প্রিপেইড মিটার তথ্য',
    descriptionEn: 'Prepaid meter info',
    gradient: 'from-amber-400 to-orange-500'
  },
  { 
    id: 'tolet', 
    label: 'বাসাভাড়া / টু-লেট', 
    labelEn: 'To-Let',
    icon: Key, 
    view: 'TO_LET',
    color: 'bg-emerald-500',
    description: 'ফ্ল্যাট খালি আছে',
    descriptionEn: 'Vacant flats',
    gradient: 'from-emerald-400 to-green-600'
  },
  { 
    id: 'security', 
    label: 'নিরাপত্তা', 
    labelEn: 'Security',
    icon: ShieldCheck, 
    view: 'CONTACT',
    color: 'bg-slate-600',
    description: 'গার্ড ও জরুরি সেবা',
    descriptionEn: 'Guards & Emergency',
    gradient: 'from-slate-600 to-slate-800'
  },
  { 
    id: 'water', 
    label: 'পানির বিল', 
    labelEn: 'Water Bill',
    icon: Droplets, 
    view: 'HOME', // Placeholder
    color: 'bg-cyan-500',
    description: 'ওয়াসা বিল তথ্য',
    descriptionEn: 'WASA bill info',
    gradient: 'from-cyan-400 to-blue-500'
  },
  { 
    id: 'waste', 
    label: 'বর্জ্য ব্যবস্থাপনা', 
    labelEn: 'Waste Management',
    icon: Trash2, 
    view: 'HOME', // Placeholder
    color: 'bg-rose-500',
    description: 'ময়লা সংগ্রহ সময়সূচী',
    descriptionEn: 'Garbage collection schedule',
    gradient: 'from-rose-400 to-pink-600'
  },
];

export const BOTTOM_NAV_ITEMS = [
  { id: 'service', label: 'সার্ভিস চার্জ', labelEn: 'Service Charge', icon: CreditCard, view: 'SERVICE_CHARGE' },
  { id: 'desco', label: 'ডেসকো', labelEn: 'Desco', icon: Zap, view: 'DESCO' },
  { id: 'home', label: 'হোম', labelEn: 'Home', icon: Home, view: 'HOME' },
  { id: 'contact', label: 'যোগাযোগ', labelEn: 'Contact', icon: Phone, view: 'CONTACT' },
  { id: 'menu', label: 'মেনু', labelEn: 'Menu', icon: MenuIcon, view: 'MENU' },
] as const;