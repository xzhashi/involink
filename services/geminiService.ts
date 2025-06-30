// AI functionality has been removed as per the user's request.
// This file is kept to prevent import errors in other files, but it does nothing.

export const suggestItemDescriptions = async (keyword: string): Promise<string[]> => {
  return Promise.resolve([]);
};

export const suggestInvoiceNote = async (context: string): Promise<string> => {
  return Promise.resolve("Thank you for your business.");
};