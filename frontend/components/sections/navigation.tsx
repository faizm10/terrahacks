"use client";

import Link from "next/link";
import Image from "next/image";

// A custom component for the hamburger icon to precisely match the design.
const HamburgerIcon = () => (
  <div className="space-y-[6px]">
    <span className="block h-[2px] w-6 bg-text-primary" />
    <span className="block h-[2px] w-6 bg-text-primary" />
  </div>
);

const Navigation = () => {
  // As per design instructions, adapting content for medical professionals.
  const medicalTestimonial = '"An AI assistant that truly understands my workflow"';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary-background font-navigation">
      <div className="mx-auto max-w-[1728px] px-6 md:px-12">
        <div className="relative flex h-[72px] items-center justify-between">

          {/* Left side: Hamburger menu button */}
          {/* <button aria-label="Open menu" className="p-2 -ml-2">
            <HamburgerIcon />
          </button> */}

          
{/*           
          <Link href="/" className="text-sm font-medium text-text-primary transition-colors hover:text-accent">
            Home
          </Link> */}

        </div>
      </div>
    </header>
  );
};

export default Navigation;
