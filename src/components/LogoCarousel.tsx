const LogoCarousel = () => {
  const logos = [
    "McLaren",
    "CITY INDEX",
    "insurerio",
    "LOOMIS",
    "3M"
  ];

  return (
    <section className="py-12 md:py-16 border-y border-border/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-center gap-6 md:gap-12 lg:gap-16 flex-wrap opacity-60">
          {logos.map((logo, index) => (
            <div key={index} className="text-base md:text-lg lg:text-xl font-semibold tracking-wide">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoCarousel;
