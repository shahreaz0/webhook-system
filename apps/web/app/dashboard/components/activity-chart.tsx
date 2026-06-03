import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";

export function ActivityChart() {
  // Simulated chart data points for SVG line chart (representing hourly delivery count)
  const chartData = [
    12, 19, 3, 5, 2, 3, 10, 15, 25, 30, 45, 35, 20, 25, 40, 55, 60, 48, 52, 64,
    75, 80, 95, 110,
  ];
  const maxChartVal = Math.max(...chartData);
  const chartPoints = chartData
    .map(
      (val, index) =>
        `${(index / (chartData.length - 1)) * 100},${100 - (val / maxChartVal) * 80}`
    )
    .join(" ");

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="font-semibold text-sm">
          Delivery Activity
        </CardTitle>
        <CardDescription>
          Visual traffic graph representing webhook deliveries over the last 24
          hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mt-4 h-48 w-full border border-border/50 bg-muted/20 p-2 dark:border-input/50">
          {/* SVG Sparkline */}
          <svg
            className="h-full w-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <title>Delivery Activity Sparkline</title>
            <defs>
              <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--primary)"
                  stopOpacity="0.25"
                />
                <stop
                  offset="100%"
                  stopColor="var(--primary)"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            {/* Gradient area */}
            <path
              d={`M 0,100 L ${chartPoints} L 100,100 Z`}
              fill="url(#chartGradient)"
            />
            {/* Stroke line */}
            <polyline
              className="stroke-primary"
              fill="none"
              points={chartPoints}
              stroke="var(--color-primary)"
              strokeWidth="1.5"
            />
          </svg>
          {/* Bottom labels */}
          <div className="absolute right-2 bottom-2 left-2 flex justify-between font-mono text-[8px] text-muted-foreground uppercase">
            <span>24 Hours Ago</span>
            <span>12 Hours Ago</span>
            <span>Just Now</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
