import { gsap } from "gsap";

type TransitionDirection = "left" | "right";
type TransitionCallback = () => void;

// This function handles the transition animation between pages
export const animatePageTransition = (
  direction: TransitionDirection = "right",
  callback?: TransitionCallback
): void => {
  // Get the current page container
  const currentPage = document.querySelector(".page-container");

  if (!currentPage) return;

  // Create a timeline for the exit animation
  const tl = gsap.timeline({
    onComplete: () => {
      // Execute the callback (navigation) after the exit animation
      if (typeof callback === "function") callback();

      // After navigation occurs, run the entrance animation
      // This will be triggered when the new page mounts
      gsap.fromTo(
        ".page-container",
        {
          x: direction === "right" ? "100%" : "-100%",
          opacity: 0,
        },
        {
          x: "0%",
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut"
        }
      );
    },
  });

  // Exit animation
  tl.to(currentPage, {
    x: direction === "right" ? "-100%" : "100%",
    opacity: 0,
    duration: 0.5,
    ease: "power2.inOut",
  });
};

// This function sets up the initial state for a page that's about to enter
export const setupPageEnter = (): void => {
  // This should be called in the useEffect of each page component
  gsap.set(".page-container", { opacity: 1, x: "0%" });
};
