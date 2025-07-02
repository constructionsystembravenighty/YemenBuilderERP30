// Yemeni Rial currency formatting utilities
export const YER_SYMBOL = 'ر.ي';
export const USD_SYMBOL = '$';

export interface CurrencyFormatOptions {
  currency?: 'YER' | 'USD';
  showSymbol?: boolean;
  showCode?: boolean;
  precision?: number;
  useArabicNumerals?: boolean;
  compact?: boolean;
}

// Format amount as Yemeni Rial
export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    currency = 'YER',
    showSymbol = true,
    showCode = false,
    precision = 2,
    useArabicNumerals = true,
    compact = false
  } = options;

  // Handle compact formatting (K, M, B)
  if (compact && Math.abs(amount) >= 1000) {
    const units = [
      { value: 1e9, symbol: 'مليار', symbolEn: 'B' },
      { value: 1e6, symbol: 'مليون', symbolEn: 'M' },
      { value: 1e3, symbol: 'ألف', symbolEn: 'K' }
    ];

    for (const unit of units) {
      if (Math.abs(amount) >= unit.value) {
        const compactValue = (amount / unit.value).toFixed(1);
        const symbol = useArabicNumerals ? unit.symbol : unit.symbolEn;
        return `${compactValue}${symbol} ${currency === 'YER' ? YER_SYMBOL : USD_SYMBOL}`;
      }
    }
  }

  // Format the number with proper precision
  const formattedAmount = amount.toFixed(precision);
  
  // Add thousand separators
  const parts = formattedAmount.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const finalAmount = parts[1] ? `${integerPart}.${parts[1]}` : integerPart;

  // Convert to Arabic numerals if requested
  const displayAmount = useArabicNumerals 
    ? toArabicNumerals(finalAmount)
    : finalAmount;

  // Build the final string
  let result = displayAmount;
  
  if (showSymbol) {
    const symbol = currency === 'YER' ? YER_SYMBOL : USD_SYMBOL;
    result = `${result} ${symbol}`;
  }
  
  if (showCode) {
    result = `${result} ${currency}`;
  }

  return result;
}

// Convert English numbers to Arabic numerals
function toArabicNumerals(text: string): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return text.replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
}

// Convert YER to USD (mock exchange rate - replace with real API)
export function convertYERToUSD(amount: number, exchangeRate: number = 0.004): number {
  return amount * exchangeRate;
}

// Convert USD to YER (mock exchange rate - replace with real API)
export function convertUSDToYER(amount: number, exchangeRate: number = 250): number {
  return amount * exchangeRate;
}

// Format currency with conversion
export function formatCurrencyWithConversion(
  amount: number,
  fromCurrency: 'YER' | 'USD' = 'YER',
  showBoth: boolean = false
): string {
  const primary = formatCurrency(amount, { currency: fromCurrency });
  
  if (!showBoth) return primary;
  
  const convertedAmount = fromCurrency === 'YER' 
    ? convertYERToUSD(amount)
    : convertUSDToYER(amount);
  
  const targetCurrency = fromCurrency === 'YER' ? 'USD' : 'YER';
  const secondary = formatCurrency(convertedAmount, { 
    currency: targetCurrency,
    useArabicNumerals: false,
    compact: true
  });
  
  return `${primary} (≈ ${secondary})`;
}

// Parse currency string back to number
export function parseCurrency(currencyString: string): number {
  // Remove currency symbols and Arabic numerals
  const cleaned = currencyString
    .replace(/[ر\.ي\$،,]/g, '')
    .replace(/[٠-٩]/g, (digit) => {
      const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      const index = arabicNumerals.indexOf(digit);
      return index !== -1 ? index.toString() : digit;
    })
    .trim();
  
  return parseFloat(cleaned) || 0;
}

// Get exchange rate (mock implementation - replace with real API)
export async function getExchangeRate(from: 'YER' | 'USD', to: 'YER' | 'USD'): Promise<number> {
  // Mock implementation - replace with real exchange rate API
  if (from === to) return 1;
  if (from === 'YER' && to === 'USD') return 0.004;
  if (from === 'USD' && to === 'YER') return 250;
  return 1;
}

// Currency validation
export function isValidCurrency(amount: string): boolean {
  const numericValue = parseCurrency(amount);
  return !isNaN(numericValue) && numericValue >= 0;
}

// Format percentage
export function formatPercentage(value: number, precision: number = 1): string {
  const formatted = value.toFixed(precision);
  return `${toArabicNumerals(formatted)}%`;
}

// Budget variance formatting
export function formatBudgetVariance(actual: number, budget: number): {
  amount: string;
  percentage: string;
  status: 'over' | 'under' | 'on-track';
  color: string;
} {
  const variance = actual - budget;
  const percentageVariance = budget > 0 ? (variance / budget) * 100 : 0;
  
  let status: 'over' | 'under' | 'on-track' = 'on-track';
  let color = 'text-green-600';
  
  if (Math.abs(percentageVariance) > 5) {
    if (variance > 0) {
      status = 'over';
      color = 'text-red-600';
    } else {
      status = 'under';
      color = 'text-green-600';
    }
  }
  
  return {
    amount: formatCurrency(Math.abs(variance)),
    percentage: formatPercentage(Math.abs(percentageVariance)),
    status,
    color
  };
}

// Format financial amount with specific business logic
export function formatFinancialAmount(
  amount: number,
  type: 'income' | 'expense' | 'transfer' = 'income',
  options: CurrencyFormatOptions = {}
): string {
  const formattedAmount = formatCurrency(amount, options);
  
  // Add directional indicators for different transaction types
  switch (type) {
    case 'income':
      return `+ ${formattedAmount}`;
    case 'expense':
      return `- ${formattedAmount}`;
    case 'transfer':
      return `⇄ ${formattedAmount}`;
    default:
      return formattedAmount;
  }
}

export default {
  formatCurrency,
  formatFinancialAmount,
  formatCurrencyWithConversion,
  parseCurrency,
  convertYERToUSD,
  convertUSDToYER,
  getExchangeRate,
  isValidCurrency,
  formatPercentage,
  formatBudgetVariance
};