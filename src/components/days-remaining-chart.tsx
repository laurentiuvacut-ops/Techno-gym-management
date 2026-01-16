"use client";

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';

interface DaysRemainingChartProps {
    daysLeft: number;
    totalDays: number;
}

export default function DaysRemainingChart({ daysLeft, totalDays }: DaysRemainingChartProps) {
    const data = [{ name: 'Days Remaining', value: daysLeft }];

    // Recharts doesn't read CSS variables, so we need to get the color manually.
    // For simplicity, we'll hardcode the HSL value of primary.
    const primaryColor = 'hsl(180 100% 50%)'; 

    return (
        <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                    innerRadius="80%"
                    outerRadius="100%"
                    data={data}
                    startAngle={90}
                    endAngle={-270}
                    barSize={10}
                >
                    <PolarAngleAxis
                        type="number"
                        domain={[0, totalDays]}
                        angleAxisId={0}
                        tick={false}
                    />
                    <RadialBar
                        background={{ fill: 'hsl(var(--muted))' }}
                        dataKey="value"
                        cornerRadius={5}
                        fill={primaryColor}
                    />
                </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-primary">{daysLeft}</span>
                <span className="text-sm text-muted-foreground">Days Left</span>
            </div>
        </div>
    );
}
