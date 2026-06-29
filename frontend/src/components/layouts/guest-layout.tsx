import type { ReactNode } from "react";

export function GuestLayout({ children }: { children: ReactNode }) {
  return (
    <div className="guest-theme min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      <div className="relative hidden md:flex md:w-1/2 min-h-screen flex-col justify-center items-center p-12 text-center text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero.png"
            alt="Volunteer Campaign"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-green-950/80 to-emerald-950/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-emerald-900/30 mix-blend-overlay" />
        </div>

        <div className="relative z-10 max-w-lg text-left px-4">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-center leading-tight">
            Volunteer Yatra
          </h1>
          <p className="text-emerald-200 text-lg lg:text-xl font-medium mb-6">
            Empowering Communities, Transforming Lives.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-12 md:p-12 lg:p-16 bg-surface min-h-screen">
        <div className="w-full max-w-[460px] flex flex-col items-center">
          <div className="mb-12 flex flex-col items-center">
            <img
              src="/Logo.png"
              alt="Volunteer Yatra Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
