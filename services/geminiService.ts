
/**
 * Suggests alternative item descriptions. (AI Feature Coming Soon)
 * @param keyword - The user's input for an item description.
 * @returns A promise that resolves to an empty array.
 */
export const suggestItemDescriptions = (keyword: string): Promise<string[]> => {
  // AI suggestions are coming soon.
  if (keyword) { /* To prevent unused var error */ }
  return Promise.resolve([]);
};

/**
 * Suggests a friendly and professional note for the invoice. (AI Feature Coming Soon)
 * @param context - A string containing sender name, recipient name, and invoice total.
 * @returns A promise that resolves to a default note.
 */
export const suggestInvoiceNote = (context: string): Promise<string> => {
  // AI note suggestions are coming soon.
  if (context) { /* To prevent unused var error */ }
  return Promise.resolve("Thank you for your business.");
};
