"use client";

import Image from "next/image";
import React from "react";

const testimonials: { quote: React.ReactNode }[] = [
  {
    quote:
      "My CareLens assistant helps me with patient care, allowing me to focus more on my patients.",
  },
  {
    quote:
      "I can't stop using my CareLens assistant. It has completely streamlined my administrative workflow.",
  },
  {
    quote:
      "A reliable partner that supports me when I'm overwhelmed with charting and paperwork.",
  },
  {
    quote: (
      <>
        It always feels like my CareLens assistant <em>gets</em> exactly what I
        need for my practice.
      </>
    ),
  },
];

const TestimonialCard = ({ quote }: { quote: React.ReactNode }) => (
  <div className="bg-white rounded-lg shadow-[0px_4px_10px_rgba(0,0,0,0.1)] p-6 h-[200px] flex flex-col justify-between">
    <p className="font-body text-text-secondary text-lg leading-relaxed">
      &ldquo;{quote}&rdquo;
    </p>
    <Image
      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/aa67d1e6-c127-4676-bb0f-ff37e9581d8d-tolans-com/assets/images/66849e76a78cd546aa2831bb_stars-1.svg"
      alt="5 stars rating"
      width={110}
      height={18}
      className="mt-4 self-start"
    />
  </div>
);

const TestimonialList = ({ "aria-hidden": ariaHidden = false }) => (
  <ul
    className="flex animate-scroll group-hover:[animation-play-state:paused]"
    aria-hidden={ariaHidden}
  >
    {testimonials.map((testimonial, index) => (
      <li key={index} className="flex-shrink-0 w-[300px] mx-3">
        <TestimonialCard quote={testimonial.quote} />
      </li>
    ))}
  </ul>
);

const Testimonials = () => {
  const animationStyle = `
    @keyframes scroll {
      from { transform: translateX(0); }
      to { transform: translateX(-100%); }
    }
    .animate-scroll {
      animation: scroll 40s linear infinite;
    }
  `;

  return (
    <section className="w-full py-20 md:py-24 bg-primary-background overflow-x-hidden">
      <style>{animationStyle}</style>
      <div className="group flex flex-nowrap">
        <TestimonialList />
        <TestimonialList aria-hidden={true} />
      </div>
    </section>
  );
};

export default Testimonials;