/**
 * Arabic language and RTL utility functions
 */

/**
 * Check if text contains Arabic characters
 */
export function isArabicText(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
}

/**
 * Format Arabic names with proper capitalization
 */
export function formatArabicName(name: string): string {
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Convert Arabic date format
 */
export function formatArabicDate(date: Date | string, format: "short" | "long" | "relative" = "short"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return "تاريخ غير صحيح";

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (format === "relative") {
    if (diffDays === 0) return "اليوم";
    if (diffDays === 1) return "أمس";
    if (diffDays === -1) return "غداً";
    if (diffDays > 1 && diffDays <= 7) return `منذ ${diffDays} أيام`;
    if (diffDays < -1 && diffDays >= -7) return `خلال ${Math.abs(diffDays)} أيام`;
  }

  const options: Intl.DateTimeFormatOptions = {
    calendar: "gregory",
    numberingSystem: "arab",
  };

  if (format === "short") {
    options.year = "numeric";
    options.month = "2-digit";
    options.day = "2-digit";
  } else {
    options.year = "numeric";
    options.month = "long";
    options.day = "numeric";
    options.weekday = "long";
  }

  return new Intl.DateTimeFormat("ar-YE", options).format(dateObj);
}

/**
 * Arabic month names
 */
export const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

/**
 * Arabic day names
 */
export const ARABIC_DAYS = [
  "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"
];

/**
 * Format time in Arabic
 */
export function formatArabicTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  return new Intl.DateTimeFormat("ar-YE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    numberingSystem: "arab",
  }).format(dateObj);
}

/**
 * Pluralization rules for Arabic
 */
export function arabicPlural(count: number, singular: string, dual: string, plural: string): string {
  if (count === 1) return `${count} ${singular}`;
  if (count === 2) return `${dual}`;
  if (count >= 3 && count <= 10) return `${count} ${plural}`;
  return `${count} ${singular}`;
}

/**
 * Common Arabic plurals for UI elements
 */
export const ARABIC_PLURALS = {
  project: {
    singular: "مشروع",
    dual: "مشروعان",
    plural: "مشاريع"
  },
  employee: {
    singular: "موظف",
    dual: "موظفان",
    plural: "موظفين"
  },
  document: {
    singular: "وثيقة",
    dual: "وثيقتان",
    plural: "وثائق"
  },
  day: {
    singular: "يوم",
    dual: "يومان",
    plural: "أيام"
  },
  month: {
    singular: "شهر",
    dual: "شهران",
    plural: "أشهر"
  },
  year: {
    singular: "سنة",
    dual: "سنتان",
    plural: "سنوات"
  }
};

/**
 * Format count with Arabic plural
 */
export function formatArabicCount(count: number, type: keyof typeof ARABIC_PLURALS): string {
  const pluralForm = ARABIC_PLURALS[type];
  return arabicPlural(count, pluralForm.singular, pluralForm.dual, pluralForm.plural);
}

/**
 * Sort Arabic text properly
 */
export function sortArabicText(items: string[]): string[] {
  return items.sort((a, b) => a.localeCompare(b, "ar", { numeric: true }));
}

/**
 * Validate Arabic input (letters, numbers, and common punctuation)
 */
export function isValidArabicInput(text: string): boolean {
  const arabicInputRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d\.,،؛:؟!()-]+$/;
  return arabicInputRegex.test(text);
}

/**
 * Clean Arabic text (remove extra spaces, normalize characters)
 */
export function cleanArabicText(text: string): string {
  return text
    .replace(/\s+/g, " ") // Multiple spaces to single space
    .replace(/[ي]/g, "ي") // Normalize Ya
    .replace(/[ك]/g, "ك") // Normalize Kaf
    .replace(/[ة]/g, "ة") // Normalize Ta Marbuta
    .trim();
}

/**
 * Generate Arabic initials from name
 */
export function getArabicInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0);
  }
  return words.slice(0, 2).map(word => word.charAt(0)).join("");
}

/**
 * Format Arabic address with proper line breaks
 */
export function formatArabicAddress(address: {
  street?: string;
  district?: string;
  city?: string;
  governorate?: string;
}): string {
  const parts = [
    address.street,
    address.district,
    address.city,
    address.governorate
  ].filter(Boolean);
  
  return parts.join("، ");
}

/**
 * Arabic text search utility (case-insensitive, diacritic-insensitive)
 */
export function searchArabicText(text: string, query: string): boolean {
  if (!query.trim()) return true;
  
  const normalizeText = (str: string) => 
    str
      .toLowerCase()
      .replace(/[ًٌٍَُِّْ]/g, "") // Remove diacritics
      .replace(/[أإآ]/g, "ا") // Normalize Alef
      .replace(/[ؤ]/g, "و") // Normalize Waw
      .replace(/[ئ]/g, "ي"); // Normalize Ya
  
  return normalizeText(text).includes(normalizeText(query));
}

/**
 * Format Arabic business titles
 */
export const ARABIC_BUSINESS_TITLES = {
  ceo: "الرئيس التنفيذي",
  manager: "مدير",
  supervisor: "مشرف",
  engineer: "مهندس",
  technician: "فني",
  worker: "عامل",
  accountant: "محاسب",
  secretary: "سكرتير",
  driver: "سائق",
  security: "أمن"
};

/**
 * Get Arabic business title
 */
export function getArabicBusinessTitle(role: string): string {
  return ARABIC_BUSINESS_TITLES[role as keyof typeof ARABIC_BUSINESS_TITLES] || role;
}

/**
 * Format Arabic phone number (Yemen format)
 */
export function formatYemeniPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  
  // Yemen country code handling
  if (cleaned.startsWith("967")) {
    const number = cleaned.substring(3);
    if (number.length === 9) {
      return `+967 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
  }
  
  // Local format
  if (cleaned.length === 9) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  
  return phone; // Return as-is if doesn't match expected formats
}

/**
 * Validate Yemeni phone number
 */
export function isValidYemeniPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  
  // Check if it's a valid Yemen mobile number
  const yemenMobileRegex = /^(967)?[0-9]{9}$/;
  return yemenMobileRegex.test(cleaned);
}
