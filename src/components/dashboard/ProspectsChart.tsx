import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ProspectsChart = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchProspectsData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prospects } = await supabase
        .from("prospects")
        .select("created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (!prospects) return;

      // Grouper par jour sur les 30 derniers jours
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      const chartData = last30Days.map(day => {
        const count = prospects.filter(p => 
          p.created_at.startsWith(day)
        ).length;
        
        return {
          date: new Date(day).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
          prospects: count
        };
      });

      // Calcul cumulatif
      let cumulative = 0;
      const cumulativeData = chartData.map(item => {
        cumulative += item.prospects;
        return { ...item, total: cumulative };
      });

      setData(cumulativeData);
    };

    fetchProspectsData();
  }, []);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Évolution des Prospects</CardTitle>
        <p className="text-sm text-muted-foreground">30 derniers jours</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6 }}
              name="Total"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProspectsChart;
