/**
 * Downloads markdown content as a .md file to the user's local machine
 * @param content - The markdown content to download
 * @param filename - Optional custom filename (defaults to 'document.md')
 */
export const downloadMarkdown = (content: string, filename: string = 'document.md'): void => {
  try {
    // Ensure filename has .md extension
    if (!filename.endsWith('.md')) {
      filename = `${filename}.md`;
    }

    // Create a Blob with the markdown content
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading markdown:', error);
    throw new Error('Failed to download markdown file');
  }
};

/**
 * Alternative: Download with sanitized filename from title
 * @param content - The markdown content to download
 * @param title - Title to use for filename (will be sanitized)
 */
export const downloadMarkdownFromTitle = (content: string, title: string): void => {
  // Sanitize the title for use as a filename
  const sanitizedFilename = title
    .replace(/[^a-z0-9]/gi, '_') // Replace non-alphanumeric with underscore
    .replace(/_{2,}/g, '_')      // Replace multiple underscores with single
    .toLowerCase();
  
  downloadMarkdown(content, sanitizedFilename);
};