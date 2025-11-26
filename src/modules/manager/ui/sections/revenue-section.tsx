"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { organisationQueries } from "@/modules/organisations/server/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconExclamationCircle, IconTrendingUp } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

// Demo data - Renk ataması component içinde yapılacak
const demoData = [
    { salonName: "Merkez Salon", total: 12700 },
    { salonName: "Şube 1", total: 6200 },
    { salonName: "Şube 2", total: 3000 },
    { salonName: "Pop-up Stand", total: 8780 },
    { salonName: "Mobil Kuaför", total: 5890 },
];

const chartConfig = {
    total: {
        label: "Ciro",
        color: "hsl(var(--chart-1))",
    },
};

export const RevenueSection = () => {
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [month, setMonth] = useState((new Date().getMonth() + 1).toString());

    const { data: organisations, isLoading: isLoadingOrgs } = useQuery(organisationQueries.listMine());
    const selectedOrganisationId = organisations?.[0]?.id;

    const { data: earningsData, isLoading, isError } = useQuery({
        ...organisationQueries.getEarnings(selectedOrganisationId!, { month: `${year}-${month.padStart(2, '0')}` }),
        enabled: !!selectedOrganisationId,
    });

    // Veriyi işle: Renkleri ata ve Toplamı hesapla
    const { processedData, totalRevenue } = useMemo(() => {
        const data = earningsData || [];
        const total = data.reduce((acc, curr) => acc + parseFloat(curr.total), 0);

        // Her bara sırasıyla farklı renk ata (chart-1'den chart-5'e kadar döner)
        const coloredData = data.map((item, index) => ({
            ...item,
            total: parseFloat(item.total),
            fill: `var(--chart-${(index % 5) + 1})`,
        }));

        return { processedData: coloredData, totalRevenue: total };
    }, [earningsData]);

    if (isLoadingOrgs) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[350px] w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!selectedOrganisationId) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Gelir Raporu</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center text-muted-foreground">
                        <IconExclamationCircle className="mx-auto h-12 w-12" />
                        <p className="mt-4">Yönetilecek bir organizasyon bulunamadı.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
    const months = Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString(),
        label: new Date(0, i).toLocaleString('tr', { month: 'long' }),
    }));

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-start pb-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                    <div>
                        <CardTitle>Gelir Raporu</CardTitle>
                        <CardDescription>Salon bazında aylık performans dağılımı.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Select value={month} onValueChange={setMonth}>
                            <SelectTrigger className="w-[140px] h-8 text-xs">
                                <SelectValue placeholder="Ay" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger className="w-[100px] h-8 text-xs">
                                <SelectValue placeholder="Yıl" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-0 mt-4">
                {isLoading ? (
                    <Skeleton className="h-[250px] w-full" />
                ) : isError || !processedData || processedData.length === 0 ? (
                    <div className="flex items-center justify-center h-[250px]">
                        <div className="text-center text-muted-foreground">
                            <IconExclamationCircle className="mx-auto h-12 w-12" />
                            <p className="mt-4">Veri bulunamadı.</p>
                        </div>
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="max-h-[calc(100vh-21rem)] w-full">
                        <BarChart accessibilityLayer data={processedData} margin={{ top: 20 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />

                            <XAxis
                                dataKey="salonName"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                            />

                            {/* Güncellenen YAxis */}
                            <YAxis
                                hide // Eksen çizgilerini ve sayılarını solda görmek istemiyorsan hide kalabilir
                                domain={[0, (dataMax: number) => (dataMax * 1.15)]} // %15 boşluk bırakır
                            />

                            <ChartTooltip
                                cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                                content={<ChartTooltipContent hideLabel />}
                            />

                            <Bar
                                dataKey="total"
                                radius={[8, 8, 0, 0]}
                                barSize={50}
                            >
                                <LabelList
                                    dataKey="total"
                                    position="top"
                                    offset={12}
                                    className="fill-foreground font-bold"
                                    fontSize={12}
                                    formatter={(value: number) => `₺${value}`}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>

            {/* Toplam Gelir Kısmı - Footer Olarak Eklendi */}
            <CardFooter className="flex-col items-start gap-2 text-sm border-t pt-4 bg-muted/20">
                <div className="flex w-full items-center justify-between font-medium leading-none">
                    <span className="flex items-center gap-2 text-muted-foreground">
                        <IconTrendingUp className="h-4 w-4" /> Toplam Ciro
                    </span>
                    <span className="text-2xl font-bold text-primary">
                        {totalRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </span>
                </div>
                <div className="leading-none text-muted-foreground text-xs">
                    {months.find(m => m.value === month)?.label} {year} dönemi için toplam gelir verisidir.
                </div>
            </CardFooter>
        </Card>
    );
};