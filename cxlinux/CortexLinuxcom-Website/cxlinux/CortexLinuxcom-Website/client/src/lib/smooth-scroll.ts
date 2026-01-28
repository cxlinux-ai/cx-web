function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function applyMotionBlur(intensity: number) {
  const main = document.querySelector("main") || document.body;
  const blur = Math.min(intensity * 3, 6);
  main.style.filter = `blur(${blur}px)`;
  main.style.transition = "filter 0.15s ease-out";
}

function removeMotionBlur() {
  const main = document.querySelector("main") || document.body;
  main.style.filter = "blur(0px)";
  setTimeout(() => {
    main.style.filter = "";
    main.style.transition = "";
  }, 150);
}

export function scrollToElement(
  elementId: string,
  options: { offset?: number; duration?: number; enableMotionBlur?: boolean } = {}
): Promise<void> {
  const { offset = 80, duration = 600, enableMotionBlur = true } = options;
  
  const element = document.getElementById(elementId);
  if (!element) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const startY = window.scrollY;
    const elementRect = element.getBoundingClientRect();
    const targetY = window.scrollY + elementRect.top - offset;
    const distance = targetY - startY;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      if (enableMotionBlur && Math.abs(distance) > 200) {
        const velocity = Math.abs(1 - progress);
        if (velocity > 0.2 && progress < 0.85) {
          applyMotionBlur(velocity);
        } else {
          removeMotionBlur();
        }
      }

      window.scrollTo(0, startY + distance * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (enableMotionBlur) {
          removeMotionBlur();
        }
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}

export function handleHashOnLoad() {
  const hash = window.location.hash;
  if (hash) {
    const elementId = hash.replace("#", "");
    setTimeout(() => {
      scrollToElement(elementId);
    }, 100);
  }
}
