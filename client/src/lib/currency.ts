/**
 * Currency formatting utilities for Yemeni Rial and other currencies
 */

export interface ExchangeRate {
  YER_USD: number;
  USD_YER: number;
  lastUpdated: string;
}

export const CURRENCIES = {
  YER: { symbol: "﷼", name: "ريال يمني", nameEn: "Yemeni Rial" },
  USD: { symbol: "$", name: "دولار أمريكي", nameEn: "US Dollar" },
  EUR: { symbol: "€", name: "يورو", nameEn: "Euro" },
  SAR: { symbol: "ر.س", name: "ريال سعودي", nameEn: "Saudi Riyal" },
} as const;

export type Currency = keyof typeof CURRENCIES;

/**
 * Format currency amount with proper Arabic numerals and RTL layout
 */
export function formatCurrency(
  amount: number | string,
  currency: Currency = "YER",
  options: {
    showSymbol?: boolean;
    useArabicNumerals?: boolean;
    precision?: number;
  } = {}
): string {
  const {
    showSymbol = true,
    useArabicNumerals = false,
    precision = 0,
  } = options;

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return "0";

  // Format number with thousands separators
  const formatted = new Intl.NumberFormat("ar-YE", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(numAmount);

  const currencyInfo = CURRENCIES[currency];
  
  if (!showSymbol) {
    return useArabicNumerals ? convertToArabicNumerals(formatted) : formatted;
  }

  // For Arabic currencies, symbol goes after the number
  if (currency === "YER" || currency === "SAR") {
    return useArabicNumerals 
      ? `${convertToArabicNumerals(formatted)} ${currencyInfo.symbol}`
      : `${formatted} ${currencyInfo.symbol}`;
  }

  // For international currencies, symbol goes before
  return useArabicNumerals
    ? `${currencyInfo.symbol} ${convertToArabicNumerals(formatted)}`
    : `${currencyInfo.symbol} ${formatted}`;
}

/**
 * Convert Western numerals to Arabic-Indic numerals
 */
export function convertToArabicNumerals(str: string): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
}

/**
 * Convert Arabic-Indic numerals to Western numerals
 */
export function convertToWesternNumerals(str: string): string {
  const arabicToWestern: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  
  return str.replace(/[٠-٩]/g, (digit) => arabicToWestern[digit] || digit);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(currencyStr: string): number {
  // Remove currency symbols and convert Arabic numerals
  const cleaned = convertToWesternNumerals(
    currencyStr.replace(/[﷼$€ر.س،,\s]/g, "")
  );
  
  return parseFloat(cleaned) || 0;
}

/**
 * Convert amount between currencies
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRates: ExchangeRate
): number {
  if (fromCurrency === toCurrency) return amount;

  // Convert to USD first if not already
  let usdAmount = amount;
  if (fromCurrency === "YER") {
    usdAmount = amount / exchangeRates.USD_YER;
  }

  // Convert from USD to target currency
  if (toCurrency === "YER") {
    return usdAmount * exchangeRates.USD_YER;
  }

  // For other currencies, you would need additional exchange rates
  return usdAmount;
}

/**
 * Format large numbers with Arabic scale words
 */
export function formatLargeNumber(amount: number): string {
  const scales = [
    { value: 1000000000, name: "مليار" },
    { value: 1000000, name: "مليون" },
    { value: 1000, name: "ألف" },
  ];

  for (const scale of scales) {
    if (Math.abs(amount) >= scale.value) {
      const scaled = amount / scale.value;
      return `${formatCurrency(scaled, "YER", { precision: 1, showSymbol: false })} ${scale.name}`;
    }
  }

  return formatCurrency(amount);
}

/**
 * Calculate percentage with proper Arabic formatting
 */
export function formatPercentage(value: number, precision: number = 1): string {
  const formatted = new Intl.NumberFormat("ar-YE", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);

  return `${formatted}%`;
}

/**
 * Format number for financial reports
 */
export function formatFinancialAmount(
  amount: number,
  currency: Currency = "YER",
  options: {
    compact?: boolean;
    showCurrency?: boolean;
  } = {}
): string {
  const { compact = false, showCurrency = true } = options;

  if (compact && Math.abs(amount) >= 1000) {
    return formatLargeNumber(amount);
  }

  return formatCurrency(amount, currency, {
    showSymbol: showCurrency,
    precision: amount % 1 === 0 ? 0 : 2,
  });
}

/**
 * Get currency display name in Arabic
 */
export function getCurrencyName(currency: Currency): string {
  return CURRENCIES[currency].name;
}

/**
 * Format exchange rate display
 */
export function formatExchangeRate(rate: number, fromCurrency: Currency, toCurrency: Currency): string {
  const formatted = formatCurrency(rate, toCurrency, { precision: 4 });
  return `1 ${getCurrencyName(fromCurrency)} = ${formatted}`;
}
