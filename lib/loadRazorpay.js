export const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // Set up continuous DOM observer to suppress the "Test Mode" diagonal corner ribbon
    initRazorpayRibbonRemover();

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const initRazorpayRibbonRemover = () => {
  if (typeof window === 'undefined' || window.__rzp_ribbon_cleaner_active) return;
  window.__rzp_ribbon_cleaner_active = true;

  const purgeRibbon = () => {
    try {
      // Find elements that contain "Test Mode" or the red diagonal corner banner
      const elements = document.querySelectorAll('span, div');
      elements.forEach((el) => {
        const text = el.textContent || '';
        const style = el.getAttribute('style') || '';
        if (
          text.trim() === 'Test Mode' ||
          style.includes('rotate(45deg)') ||
          style.includes('#D64444') ||
          style.includes('rgb(214, 68, 68)')
        ) {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
          el.style.setProperty('opacity', '0', 'important');
          try {
            el.remove();
          } catch (_) {}
        }
      });
    } catch (_) {}
  };

  purgeRibbon();
  const observer = new MutationObserver(purgeRibbon);
  observer.observe(document.body, { childList: true, subtree: true, attributes: true });
};
