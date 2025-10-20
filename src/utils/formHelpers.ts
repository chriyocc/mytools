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

/**
 * Validate has temporary content in temp form data
 * @param data - Temp form data object
 * @param emptyTemplate - Array of required field names
 * @returns true if any temp field is not empty
 */
export function hasTempContent<T extends Record<string, any>>(
  data: T,
  emptyTemplate: T
): boolean {
  // return true if ANY field in `data` differs from `emptyTemplate`
  return Object.keys(emptyTemplate).some((key) => {
    const value = data[key as keyof T];
    const emptyValue = emptyTemplate[key as keyof T];
    return value !== emptyValue;
  });
}