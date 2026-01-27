const BLUR_TIMEOUT_MS = 1000;

export const smoothNavigateToHackathon = (navigate: (path: string) => void) => {
  document.body.classList.add('page-transition-blur');
  
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  
  const scrollDuration = 300;
  const navigationDelay = 100;
  
  const removeBlur = () => {
    document.body.classList.remove('page-transition-blur');
  };
  
  const safetyTimeout = setTimeout(removeBlur, BLUR_TIMEOUT_MS);
  
  setTimeout(() => {
    navigate('/hackathon');
    
    setTimeout(() => {
      clearTimeout(safetyTimeout);
      removeBlur();
    }, navigationDelay);
  }, scrollDuration);
};

export const smoothNavigateTo = (navigate: (path: string) => void, path: string) => {
  document.body.classList.add('page-transition-blur');
  
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  
  const scrollDuration = 300;
  const navigationDelay = 100;
  
  const removeBlur = () => {
    document.body.classList.remove('page-transition-blur');
  };
  
  const safetyTimeout = setTimeout(removeBlur, BLUR_TIMEOUT_MS);
  
  setTimeout(() => {
    navigate(path);
    
    setTimeout(() => {
      clearTimeout(safetyTimeout);
      removeBlur();
    }, navigationDelay);
  }, scrollDuration);
};
