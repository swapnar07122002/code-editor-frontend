'use client';
import Logo from "@/components/Logo";
import TextAnimationHeading from "@/components/TextAnimationHeading";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TypeAnimation } from "react-type-animation";

export default function Home() {

  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-b via-white from-white to-primary overflow-hidden">
      
      <header className="h-20 flex items-center"> 
        <div className="container px-4 mx-auto flex items-center justify-between gap-4">
          <Logo />
          <nav>
            <Button onClick={() => router.push('/login')}>
              Login
            </Button>
          </nav>
        </div>
      </header>

      <TextAnimationHeading />

      {/* dashboard landing image */}
      <div className="mx-auto w-fit shadow-lg">
        <Image 
          alt="banner"
          src={"/banner-animate.gif"}
          width={1000}
          height={400}
        />
      </div>

    </div>
  );
}
