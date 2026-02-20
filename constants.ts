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
  { id: 1, text: "নোটিশ: আগামী শুক্রবার সকাল ১০টা থেকে ১২টা পর্যন্ত জেনারেটর মেইনটেনেন্স এর কাজ চলবে।", date: "2024-05-20" },
  { id: 2, text: "জরুরী: এই মাসের সার্ভিস চার্জ ১০ তারিখের মধ্যে পরিশোধ করার অনুরোধ করা হলো।", date: "2024-05-21" },
  { id: 3, text: "স্বাগতম: হলান টাওয়ার অ্যাপে আপনাকে স্বাগতম। যেকোনো তথ্যের জন্য মেনু ব্যবহার করুন।", date: "2024-05-22" }
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
    id: 'security', 
    label: 'নিরাপত্তা', 
    icon: ShieldCheck, 
    view: 'CONTACT',
    color: 'bg-slate-600',
    description: 'গার্ড ও জরুরি সেবা',
    gradient: 'from-slate-600 to-slate-800'
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

export const BOTTOM_NAV_ITEMS = [
  { id: 'service', label: 'সার্ভিস চার্জ', icon: CreditCard, view: 'SERVICE_CHARGE' },
  { id: 'desco', label: 'ডেসকো', icon: Zap, view: 'DESCO' },
  { id: 'home', label: 'হোম', icon: Home, view: 'HOME' },
  { id: 'contact', label: 'যোগাযোগ', icon: Phone, view: 'CONTACT' },
  { id: 'menu', label: 'মেনু', icon: MenuIcon, view: 'MENU' },
] as const;