import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import ImagePreview from './ImagePreview';

interface ImagePreviewContextType {
  openImagePreview: (imageUrl: string) => void;
  closeImagePreview: () => void;
}

const ImagePreviewContext = createContext<ImagePreviewContextType | undefined>(undefined);

export const ImagePreviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  const openImagePreview = useCallback((url: string) => {
    setImageUrl(url);
    setIsOpen(true);
  }, []);

  const closeImagePreview = useCallback(() => {
    setIsOpen(false);
    setImageUrl('');
  }, []);

  return (
    <ImagePreviewContext.Provider value={{ openImagePreview, closeImagePreview }}>
      {children}
      <ImagePreview isOpen={isOpen} onClose={closeImagePreview} imageUrl={imageUrl} />
    </ImagePreviewContext.Provider>
  );
}

export const useImagePreview = (): ImagePreviewContextType => {
  const context = useContext(ImagePreviewContext);
  if (!context) {
    throw new Error('useImagePreview must be used within an ImagePreviewProvider');
  }
  return context;
}