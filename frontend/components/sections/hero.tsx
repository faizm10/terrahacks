import { ArrowBigRight, Check, Calendar, FileText, Phone, File } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const WATCH_ICON_URL =
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/aa67d1e6-c127-4676-bb0f-ff37e9581d8d-tolans-com/assets/icons/67abc28e98e86bb683ed1ff9_icon%20-%20edid%20this%20(1)-2.png?";
const DOWNLOAD_ICON_URL =
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/aa67d1e6-c127-4676-bb0f-ff37e9581d8d-tolans-com/assets/icons/67abc293ae0b7cdabf4a1f2c_icon%20-%20edid%20this%20(2)-1.png?";

const VIDEO_CHROME_URL =
  "https://res.cloudinary.com/dpkcvnax0/video/upload/v1721429711/vvlre11zs8tbloswpalj.webm";
const VIDEO_SAFARI_URL =
  "https://res.cloudinary.com/dpkcvnax0/video/upload/v1721429711/svvtsfvzwhc2dbovppzf.mp4";

export default function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-primary-background">
      {/* <div className="absolute inset-0 z-0">
        <video
          loop
          muted
          autoPlay
          playsInline
          className="object-cover w-full h-full"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' style='background-color: %23F5F3F0'%3E%3C/svg%3E"
        >
          <source src={VIDEO_SAFARI_URL} type="video/mp4" />
          <source src={VIDEO_CHROME_URL} type="video/webm" />
        </video>
      </div> */}

      <div className="absolute inset-0 z-0 flex items-center justify-center">
       <img
         src="/ezgif-terra.gif"
         alt="doctor animation"
         className="object-contain w-[550px] h-auto"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="font-mono font-bold text-text-primary leading-[0.8] -tracking-[0.05em] text-[clamp(4.5rem,20vw,15rem)] opacity-95">

          MediCare
        </h1>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6">
          <Link
            href="/stream"
            className="group inline-flex items-center justify-center px-4 h-11 text-sm font-medium transition-colors bg-white/80 backdrop-blur-sm border border-black/10 rounded-full hover:bg-white text-text-primary gap-2"
          >
            Start Consultation
            <ArrowBigRight className="w-4 h-4" />
          </Link>
          
          
          <Link
            href="/history"
            className="group inline-flex items-center justify-center px-4 h-11 text-sm font-medium transition-colors bg-white/80 backdrop-blur-sm border border-black/10 rounded-full hover:bg-white text-text-primary gap-2"
          >
            Medical History
            <FileText className="w-4 h-4" />
          </Link>
          
          <Link
            href="/report"
            className="group inline-flex items-center justify-center px-4 h-11 text-sm font-medium transition-colors bg-white/80 backdrop-blur-sm border border-black/10 rounded-full hover:bg-white text-text-primary gap-2"
          >
            Latest Reports
            <File className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}