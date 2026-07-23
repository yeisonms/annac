import React from 'react';

export function FooterAttribution() {
  return (
    <footer className="w-full py-6 md:py-8 mt-auto flex justify-center items-center">
      <p className="text-xs sm:text-sm text-neutral-500/80 dark:text-neutral-400/80 text-center tracking-wide">
        Diseñado y desarrollado por{" "}
        <a
          href="https://mursatsolutions.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-neutral-600 dark:text-neutral-300 transition-all duration-300 hover:text-primary hover:dark:text-primary relative inline-block group"
        >
          MurSat Solutions
          <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full opacity-80" />
        </a>
      </p>
    </footer>
  );
}
