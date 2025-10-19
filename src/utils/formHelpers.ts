/**
 * Generate URL-friendly slug from title
 * @param title - Original title string
 * @returns URL-friendly slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

/**
 * Validate required fields in form data
 * @param data - Form data object
 * @param requiredFields - Array of required field names
 * @returns true if any required field is empty
 */
export function hasEmptyRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): boolean {
  return requiredFields.some((field) => {
    const value = data[field];
    return typeof value !== 'string' || value.trim() === '';
  });
}