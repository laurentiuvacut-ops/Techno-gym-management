"use client";

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface DaysRemainingChartProps {
    daysLeft: number;
    totalDays: number;
}

export default function DaysRemainingChart({ daysLeft, totalDays }: DaysRemainingChartProps) {
    const data = [{ name: 'Days Remaining', value: daysLeft }];

    const primaryColor = 'hsl(180 100% 50%)'; 

    return (
        <div className="relative w-20 h-20">
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                    innerRadius="80%"
                    outerRadius="100%"
                    data={data}
                    startAngle={90}
                    endAngle={-270}
                    barSize={8}
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
                        cornerRadius={4}
                        fill={primaryColor}
                    />
                </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{daysLeft}</span>
                <span className="text-xs text-muted-foreground">ZILE</span>
            </div>
        </div>
    );
}
