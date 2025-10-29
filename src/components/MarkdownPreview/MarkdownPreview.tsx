import React from "react";
import './MarkdownPreview.css';
import './github-markdown-light.css';
import { marked } from "marked";


interface MarkdownPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  markdownContent: string;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ isOpen, onClose, markdownContent }) => {
  if (!isOpen) return null;
  const html = marked(markdownContent);

  return (
    <>
      <div className="markdown-preview-overlay" onClick={onClose}></div>
      <div className="markdown-preview-modal">
        <div className="markdown-preview-header">
          <button className="markdown-preview-close" onClick={onClose}>&times;</button>
        </div>
        <div className="markdown-preview-content">
          <div
            className="markdown-preview-body"
            dangerouslySetInnerHTML={{ __html: html}}
          ></div>
        </div>
      </div>
    </>
  );
};

export default MarkdownPreview;