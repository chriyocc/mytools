import React from 'react';
import './PageLoader.css'

interface PageLoaderProps {
  isShowing: boolean;
}

const Modal: React.FC<PageLoaderProps> = ({ isShowing }) => {
  if (!isShowing) return null;

  return (
    <>
      <div id="pageLoader" className="page-loader" >
        <div className="loader">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </>
  );
};

export default Modal;