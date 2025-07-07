// Arabic date formatting utilities
export function formatArabicDate(date: Date | string | null | undefined, format: 'short' | 'long' | 'relative' = 'short'): string {
  if (!date) return 'غير محدد';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return 'تاريخ غير صحيح';
  }
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (format === 'relative') {
    if (diffMs < 60000) return 'الآن';
    if (diffMs < 3600000) return `منذ ${Math.floor(diffMs / 60000)} دقيقة`;
    if (diffMs < 86400000) return `منذ ${Math.floor(diffMs / 3600000)} ساعة`;
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
    if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} شهور`;
    return `منذ ${Math.floor(diffDays / 365)} سنوات`;
  }
  
  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  
  const day = dateObj.getDate();
  const month = arabicMonths[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  
  if (format === 'short') {
    return `${day} ${month} ${year}`;
  }
  
  const arabicDays = [
    'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
  ];
  
  const dayName = arabicDays[dateObj.getDay()];
  
  return `${dayName}، ${day} ${month} ${year}`;
}

// Convert English numbers to Arabic-Indic numerals
export function toArabicNumerals(text: string): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return text.replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
}

// Convert Arabic-Indic numerals to English numbers
export function toEnglishNumerals(text: string): string {
  const englishNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  
  return text.replace(/[٠-٩]/g, (digit) => {
    const index = arabicNumerals.indexOf(digit);
    return index !== -1 ? englishNumerals[index] : digit;
  });
}

// Format Arabic text for RTL display
export function formatArabicText(text: string, options: {
  preserveNumbers?: boolean;
  addDirectionMarks?: boolean;
} = {}): string {
  let formatted = text;
  
  if (options.preserveNumbers) {
    formatted = toArabicNumerals(formatted);
  }
  
  if (options.addDirectionMarks) {
    // Add right-to-left mark for proper direction
    formatted = '\u202E' + formatted + '\u202C';
  }
  
  return formatted;
}

// Check if text contains Arabic characters
export function containsArabic(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
}

// Get text direction based on content
export function getTextDirection(text: string): 'rtl' | 'ltr' {
  return containsArabic(text) ? 'rtl' : 'ltr';
}

// Arabic pluralization helper
export function arabicPlural(count: number, singular: string, dual: string, plural: string): string {
  if (count === 1) return `${count} ${singular}`;
  if (count === 2) return `${dual}`;
  if (count >= 3 && count <= 10) return `${count} ${plural}`;
  return `${count} ${singular}`;
}

// Format time in Arabic
export function formatArabicTime(date: Date, format12Hour = true): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  if (format12Hour) {
    const hour12 = hours % 12 || 12;
    const period = hours >= 12 ? 'مساءً' : 'صباحاً';
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${hour12}:${formattedMinutes} ${period}`;
  }
  
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes}`;
}

// Arabic sorting function
export function sortArabicStrings(arr: string[], ascending = true): string[] {
  return arr.sort((a, b) => {
    const result = a.localeCompare(b, 'ar');
    return ascending ? result : -result;
  });
}

// Get Arabic initials from name
export function getArabicInitials(name: string): string {
  if (!name) return '';
  
  const words = name.trim().split(/\s+/);
  
  // For Arabic names, take first letter of each word
  if (containsArabic(name)) {
    return words
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2); // Limit to 2 characters for avatar display
  }
  
  // For English names, use standard initials
  return words
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}

// Alias for backward compatibility
export const formatDate = formatArabicDate;

export default {
  formatArabicDate,
  formatDate,
  toArabicNumerals,
  toEnglishNumerals,
  formatArabicText,
  containsArabic,
  getTextDirection,
  arabicPlural,
  formatArabicTime,
  sortArabicStrings,
  getArabicInitials
};