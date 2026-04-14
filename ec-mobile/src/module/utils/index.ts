export const formatCurrency = (value = 0) => {
  return Intl.NumberFormat(Intl.DateTimeFormat().resolvedOptions().locale, {
    currencySign: 'standard',
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}
