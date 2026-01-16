"use client";

import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'L', value: 20 },
  { name: 'M', value: 40 },
  { name: 'M', value: 15 },
  { name: 'J', value: 50 },
  { name: 'V', value: 30 },
  { name: 'S', value: 10 },
  { name: 'D', value: 25 },
];

export default function WeeklyActivityChart() {
    const primaryColor = 'hsl(180 100% 50%)';
    const mutedColor = 'hsl(var(--muted))';

    return (
        <div className="w-full h-32">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.value > 0 ? primaryColor : mutedColor} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
