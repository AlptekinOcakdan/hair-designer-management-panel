"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setStaffNonAvailableRange } from "@/modules/users/server/procedures";
import { userKeys } from "@/modules/users/server/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { IconCalendar } from "@tabler/icons-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";

const nonAvailabilitySchema = z.object({
    range: z.object({
        from: z.date(),
        to: z.date(),
    }),
    reason: z.string().min(3, "Lütfen bir sebep belirtin."),
});

type NonAvailabilityFormValues = z.infer<typeof nonAvailabilitySchema>;

type NonAvailabilityCardProps = {
    salonId: string;
}

export const NonAvailabilityCard = ({ salonId }: NonAvailabilityCardProps) => {
    const queryClient = useQueryClient();

    const form = useForm<NonAvailabilityFormValues>({
        resolver: zodResolver(nonAvailabilitySchema),
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (values: NonAvailabilityFormValues) => setStaffNonAvailableRange(salonId, {
            start: values.range.from.toISOString(),
            end: values.range.to.toISOString(),
            reason: values.reason
        }),
        onSuccess: () => {
            toast.success("İzin aralığı oluşturuldu ve çakışan randevular iptal edildi.");
            queryClient.invalidateQueries({ queryKey: userKeys.mySalons() });
            form.reset();
        },
        onError: (error) => {
            toast.error(error.message || "İşlem başarısız.");
        }
    });

    const onSubmit = (values: NonAvailabilityFormValues) => {
        mutate(values);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>İzin / Kapalı Aralık Ekle</CardTitle>
                <CardDescription>
                    Belirli bir tarih aralığında çalışamayacaksanız buradan belirtin. Bu aralıktaki randevularınız iptal edilecektir.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="range"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Tarih Aralığı</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value?.from ? (
                                                        field.value.to ? (
                                                            <>
                                                                {format(field.value.from, "LLL dd, y", { locale: tr })} -{" "}
                                                                {format(field.value.to, "LLL dd, y", { locale: tr })}
                                                            </>
                                                        ) : (
                                                            format(field.value.from, "LLL dd, y", { locale: tr })
                                                        )
                                                    ) : (
                                                        <span>Tarih seçin</span>
                                                    )}
                                                    <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="range"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sebep</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Örn: Yıllık izin, Hastalık..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" variant="destructive" disabled={isPending}>
                            {isPending ? "İşleniyor..." : "Aralığı Kapat"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};