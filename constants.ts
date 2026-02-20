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

export const APP_NAME = "হলান টাওয়ার";

export const NOTICES: Notice[] = [
  { id: 1, text: "হলান টাওয়ারে আপনাকে স্বাগতম। আমাদের ভবনের সকল গুরুত্বপূর্ণ তথ্য ও দৈনন্দিন সেবাগুলি এখানে দ্রুত পেয়ে যাবেন।", date: "2024-05-20" },
  { id: 2, text: "এখানে জরুরী নোটিশ, ইউটিলিটি ও সার্ভিস চার্জ, ডেসকো রিচার্জ, যোগাযোগ ও জরুরী হেল্পলাইন, ম্যাপ ও রুট নির্দেশনা, প্রিপেইড মিটার নাম্বার, লিফট ব্যবহারের নিয়ম, গ্যালারি এবং বাসাভাড়ার তথ্য একসাথে সহজে খুঁজে পাবেন।", date: "2024-05-21" },
  { id: 3, text: "এটি হলান টাওয়ারের বাসিন্দাদের জন্য একটি দ্রুত, সহজ ও নির্ভরযোগ্য ডিজিটাল সার্ভিস কেন্দ্র।", date: "2024-05-22" }
];

export const MENU_ITEMS: MenuItem[] = [
  { 
    id: 'service', 
    label: 'সার্ভিস চার্জ', 
    icon: CreditCard, 
    view: 'SERVICE_CHARGE',
    color: 'bg-blue-500',
    description: 'মাসিক বিল ও পেমেন্ট',
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    id: 'desco', 
    label: 'ডেসকো রিচার্জ', 
    icon: Zap, 
    view: 'DESCO',
    color: 'bg-yellow-500',
    description: 'প্রিপেইড মিটার তথ্য',
    gradient: 'from-amber-400 to-orange-500'
  },
  { 
    id: 'tolet', 
    label: 'বাসাভাড়া / টু-লেট', 
    icon: Key, 
    view: 'TO_LET',
    color: 'bg-emerald-500',
    description: 'ফ্ল্যাট খালি আছে',
    gradient: 'from-emerald-400 to-green-600'
  },
  { 
    id: 'emergency', 
    label: 'জরুরী নম্বর', 
    icon: ShieldCheck, 
    view: 'EMERGENCY',
    color: 'bg-red-600',
    description: 'পুলিশ, ফায়ার, অ্যাম্বুলেন্স',
    gradient: 'from-red-500 to-rose-700'
  },
  { 
    id: 'water', 
    label: 'পানির বিল', 
    icon: Droplets, 
    view: 'HOME', // Placeholder
    color: 'bg-cyan-500',
    description: 'ওয়াসা বিল তথ্য',
    gradient: 'from-cyan-400 to-blue-500'
  },
  { 
    id: 'waste', 
    label: 'বর্জ্য ব্যবস্থাপনা', 
    icon: Trash2, 
    view: 'HOME', // Placeholder
    color: 'bg-rose-500',
    description: 'ময়লা সংগ্রহ সময়সূচী',
    gradient: 'from-rose-400 to-pink-600'
  },
];

export const FLAT_OWNERS = [
  { flat: '2A', name: 'MATIN', account: '41371285' },
  { flat: '2B', name: 'HANIF', account: '41371286' },
  { flat: '2C', name: 'MINA', account: '41371287' },
  { flat: '3A', name: 'JILLUR', account: '41371298' },
  { flat: '3B', name: 'KAIYUM', account: '41371308' },
  { flat: '3C', name: 'FARUK', account: '41371291' },
  { flat: '4A', name: 'SAIDUR', account: '41371310' },
  { flat: '4B', name: 'IBRAHIM', account: '41371303' },
  { flat: '4C', name: 'AYUB', account: '41371296' },
  { flat: '5A', name: 'MOJAMMEL', account: '41371302' },
  { flat: '5B', name: 'NESAR', account: '41371295' },
  { flat: '5C', name: 'JUWEL', account: '41371309' },
  { flat: '6A', name: 'NESAR', account: '41371299' },
  { flat: '6B', name: 'SHAHIN', account: '41371305' },
  { flat: '6C', name: 'SHAHIDULAH', account: '41371292' },
  { flat: '7A', name: 'AZAD', account: '41371294' },
  { flat: '7B', name: 'MOROL', account: '41371293' },
  { flat: '7C', name: 'NAZRUL', account: '41371284' },
  { flat: '8A', name: 'ATIQ', account: '41371306' },
  { flat: '8B', name: 'MOSTOFA', account: '41371304' },
  { flat: '8C', name: 'FIROZ', account: '41371301' },
  { flat: '9A', name: 'KAIYUM', account: '41371307' },
  { flat: '9B', name: 'AZHAR', account: '41371297' },
  { flat: '9C', name: 'SAYED', account: '41371300' },
  { flat: '10A', name: 'HAKIM', account: '41371288' },
  { flat: '10B', name: 'MOTIUR', account: '41371289' },
  { flat: '10C', name: 'ASHRAF', account: '41371290' },
  { flat: 'MAIN', name: 'NAZRUL', account: '41371283' }
];

export const TRANSLATIONS = {
  bn: {
    serviceCharge: 'সার্ভিস চার্জ',
    demo: 'ডেমো',
    adminDashboard: 'অ্যাডমিন ড্যাশবোর্ড',
    editInfo: 'যেকোনো ইউনিটে ক্লিক করে পেমেন্ট স্ট্যাটাস পরিবর্তন করুন।',
    allUnitsCalc: 'সকল ইউনিট হিসাব',
    financialYear: 'অর্থবছর',
    total: 'সর্বমোট',
    status: 'অবস্থা',
    unit: 'ইউনিট',
    totalCollected: 'মোট জমা',
    totalDue: 'মোট বাকি',
    searchUnit: 'ইউনিট খুঁজুন (যেমন: 2A)',
    details: 'বিস্তারিত দেখতে ক্লিক করুন',
    all: 'সকল',
    flatType: 'ফ্ল্যাটের ধরন',
    paid: 'পরিশোধিত',
    due: 'বকেয়া',
    upcoming: 'আসন্ন',
    adminLogin: 'অ্যাডমিন লগইন',
    loginPrompt: 'ডেটা এডিট করতে পিন কোড দিন',
    loginBtn: 'লগইন করুন',
    back: 'ফিরে যান',
    totalAmount: 'মোট টাকা',
    occupancy: 'বসবাসের ধরন',
    occupied: 'বসবাসরত',
    vacant: 'খালি',
    monthDate: 'মাস ও তারিখ',
    amount: 'টাকা',
    saveFail: 'সেভ করতে ব্যর্থ হয়েছে',
    statusChangeFail: 'স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে',
    month: 'মাস',
    paymentStatus: 'পেমেন্ট স্ট্যাটাস',
    notice: 'নোটিশ',
    months: [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ]
  },
  en: {
    serviceCharge: 'Service Charge',
    demo: 'Demo',
    adminDashboard: 'Admin Dashboard',
    editInfo: 'Click any unit to change payment status.',
    allUnitsCalc: 'All Units Calculation',
    financialYear: 'Financial Year',
    total: 'Total',
    status: 'Status',
    unit: 'Unit',
    totalCollected: 'Total Collected',
    totalDue: 'Total Due',
    searchUnit: 'Search Unit (e.g., 2A)',
    details: 'Click to view details',
    all: 'All',
    flatType: 'Flat Type',
    paid: 'Paid',
    due: 'Due',
    upcoming: 'Upcoming',
    adminLogin: 'Admin Login',
    loginPrompt: 'Enter PIN to edit data',
    loginBtn: 'Login',
    back: 'Back',
    totalAmount: 'Total Amount',
    occupancy: 'Occupancy',
    occupied: 'Occupied',
    vacant: 'Vacant',
    monthDate: 'Month & Date',
    amount: 'Amount',
    saveFail: 'Failed to save',
    statusChangeFail: 'Failed to change status',
    month: 'Month',
    paymentStatus: 'Payment Status',
    notice: 'Notice',
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
  }
};

export const BOTTOM_NAV_ITEMS = [
  { id: 'service', label: 'সার্ভিস চার্জ', icon: CreditCard, view: 'SERVICE_CHARGE' },
  { id: 'desco', label: 'ডেসকো', icon: Zap, view: 'DESCO' },
  { id: 'home', label: 'হোম', icon: Home, view: 'HOME' },
  { id: 'emergency', label: 'জরুরী', icon: ShieldCheck, view: 'EMERGENCY' },
  { id: 'menu', label: 'মেনু', icon: MenuIcon, view: 'MENU' },
] as const;