import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full bg-[var(--color-primary-background)] py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center text-center">
          {/* Doctor Character Illustration - placeholder with provided asset */}
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/aa67d1e6-c127-4676-bb0f-ff37e9581d8d-tolans-com/assets/svgs/668499ce7cef6042b2f1a2c6_tolan-2.svg"
            alt="Doctor Character Illustration"
            width={192}
            height={192}
            className="w-40 h-40 md:w-48 md:h-48"
          />

          <Link
            href="https://www.tolans.com/about-tolan"
            className="mt-8 text-base font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Learn more
          </Link>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="https://www.tolans.com/#"
              className="flex items-center justify-center gap-2.5 rounded-lg border border-black/10 bg-white/50 px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] shadow-sm transition-transform hover:scale-105"
            >
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/aa67d1e6-c127-4676-bb0f-ff37e9581d8d-tolans-com/assets/icons/67abc28e98e86bb683ed1ff9_icon%20-%20edid%20this%20(1)-2.png"
                alt="Play icon"
                width={20}
                height={20}
              />
              <span>Watch Demo</span>
            </Link>
            <Link
              href="https://apps.apple.com/us/app/tolan-alien-best-friend/id6477549878"
              className="flex items-center justify-center gap-2.5 rounded-lg border border-black/10 bg-white/50 px-4 py-2 text-[var(--color-text-primary)] shadow-sm transition-transform hover:scale-105"
            >
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/aa67d1e6-c127-4676-bb0f-ff37e9581d8d-tolans-com/assets/icons/67abc293ae0b7cdabf4a1f2c_icon%20-%20edid%20this%20(2)-1.png"
                alt="App Store icon"
                width={20}
                height={25}
                className="w-5 h-auto"
              />
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] leading-tight">Download on the</span>
                <span className="text-sm font-medium leading-tight">App Store</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
