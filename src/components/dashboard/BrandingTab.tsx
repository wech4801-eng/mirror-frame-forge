import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";

const BrandingTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Branding</CardTitle>
          </div>
          <CardDescription>
            Personnalisez l'identité visuelle de votre marque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fonctionnalité à venir...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandingTab;
