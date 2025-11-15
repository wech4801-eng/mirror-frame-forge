import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

const MailTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Configuration Email</CardTitle>
          </div>
          <CardDescription>
            Paramètres et configuration de vos emails
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

export default MailTab;
