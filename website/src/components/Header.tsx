import { Coffee } from "lucide-react";

const Header = () => {
  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-primary to-primary/90 py-16 md:py-24">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-cafe-warm" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        {/* Logo/Icon */}
        <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary-foreground/10 p-4 backdrop-blur-sm">
          <Coffee className="h-12 w-12 text-primary-foreground md:h-16 md:w-16" />
        </div>

        {/* Cafe Name */}
        <h1 className="mb-4 font-display text-5xl font-bold tracking-tight text-primary-foreground md:text-7xl">
          Ajabo
        </h1>

        {/* Tagline */}
        <p className="mx-auto max-w-md text-lg text-primary-foreground/80 md:text-xl">
          Eng yaxshi qahva va shirinliklar uchun joy
        </p>

        {/* Decorative line */}
        <div className="mx-auto mt-8 flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-primary-foreground/30" />
          <div className="h-2 w-2 rounded-full bg-accent" />
          <div className="h-px w-16 bg-primary-foreground/30" />
        </div>
      </div>
    </header>
  );
};

export default Header;
