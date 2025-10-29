import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import MarkdownPreview from './MarkdownPreview';

interface MarkdownPreviewContextType {
  openMarkdownPreview: (markdownContent: string) => void;
  closeMarkdownPreview: () => void;
}

const MarkdownPreviewContext = createContext<MarkdownPreviewContextType | undefined>(undefined);

export const MarkdownPreviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string>('');

  const openMarkdownPreview = useCallback((url: string) => {
    setMarkdownContent(url);
    setIsOpen(true);
  }, []);

  const closeMarkdownPreview = useCallback(() => {
    setIsOpen(false);
    setMarkdownContent('');
  }, []);

  return (
    <MarkdownPreviewContext.Provider value={{ openMarkdownPreview, closeMarkdownPreview }}>
      {children}
      <MarkdownPreview isOpen={isOpen} onClose={closeMarkdownPreview} markdownContent={markdownContent} />
    </MarkdownPreviewContext.Provider>
  );
}

export const useMarkdownPreview = (): MarkdownPreviewContextType => {
  const context = useContext(MarkdownPreviewContext);
  if (!context) {
    throw new Error('useMarkdownPreview must be used within an MarkdownPreviewProvider');
  }
  return context;
}