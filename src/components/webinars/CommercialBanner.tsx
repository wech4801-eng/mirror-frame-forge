import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkle } from "@phosphor-icons/react";

interface CommercialBannerProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
}

const CommercialBanner = ({ title, description, ctaText, ctaLink }: CommercialBannerProps) => {
  if (!title && !description) return null;

  return (
    <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 border-0">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
          <Sparkle className="h-6 w-6" />
        </div>
        <div className="flex-1 space-y-3">
          {title && <h3 className="text-xl font-bold">{title}</h3>}
          {description && <p className="text-white/90 text-sm leading-relaxed">{description}</p>}
          {ctaLink && (
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="bg-white text-purple-600 hover:bg-white/90 font-semibold"
            >
              <a href={ctaLink} target="_blank" rel="noopener noreferrer">
                {ctaText || "Acheter maintenant"}
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CommercialBanner;
