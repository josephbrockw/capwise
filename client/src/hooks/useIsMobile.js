import { useState, useEffect } from 'react';

const useIsMobile = () => {
  const breakpoint = parseInt(process.env.REACT_APP_MOBILE_BREAKPOINT || 768, 10);
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    let timeoutId;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < breakpoint);
      }, 150); // Adjust debounce delay as needed
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
};


export default useIsMobile;
