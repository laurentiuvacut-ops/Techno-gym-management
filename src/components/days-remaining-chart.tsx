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
        <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                    innerRadius="80%"
                    outerRadius="100%"
                    data={data}
                    startAngle={90}
                    endAngle={-270}
                    barSize={12}
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
                        cornerRadius={6}
                        fill={primaryColor}
                    />
                </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-bold tracking-tighter">{daysLeft}</span>
                <span className="text-base text-muted-foreground -mt-2">ZILE</span>
            </div>
        </div>
    );
}
