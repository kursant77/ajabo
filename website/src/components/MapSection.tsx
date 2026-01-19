import { MapPin } from "lucide-react";

const MapSection = () => {
  return (
    <section className="border-t border-border bg-secondary/30 py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center justify-center rounded-full bg-accent/10 p-3">
            <MapPin className="h-6 w-6 text-accent" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
            Bizning manzil
          </h2>
          <p className="mt-2 text-muted-foreground">
            Toshkent shahar, Chilonzor tumani, Bunyodkor ko'chasi, 15-uy
          </p>
        </div>

        {/* Map container */}
        <div className="overflow-hidden rounded-xl shadow-cafe-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.5234567890!2d69.2044!3d41.3111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDE4JzQwLjAiTiA2OcKwMTInMTUuOCJF!5e0!3m2!1sen!2s!4v1234567890"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ajabo Cafe joylashuvi"
            className="w-full"
          />
        </div>

        {/* Additional info */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Ochiq: 09:00 - 22:00
          </span>
          <span className="hidden sm:inline">•</span>
          <span>Metro: Chilonzor bekati (5 daqiqa piyoda)</span>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
