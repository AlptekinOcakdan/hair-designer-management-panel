"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setStaffWorkingSchedule } from "@/modules/users/server/procedures";
import { userKeys } from "@/modules/users/server/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const daysOfWeek = [
    { id: "Pazartesi", label: "Pazartesi" },
    { id: "Salı", label: "Salı" },
    { id: "Çarşamba", label: "Çarşamba" },
    { id: "Perşembe", label: "Perşembe" },
    { id: "Cuma", label: "Cuma" },
    { id: "Cumartesi", label: "Cumartesi" },
    { id: "Pazar", label: "Pazar" },
];

const scheduleSchema = z.object({
    availableWeekDays: z.array(z.string()).refine((value) => value.length > 0, {
        message: "En az bir çalışma günü seçmelisiniz.",
    }),
    startHour: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Saat formatı HH:MM olmalıdır (örn: 09:00)."),
    endHour: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Saat formatı HH:MM olmalıdır (örn: 18:00)."),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

type WorkingScheduleCardProps = {
    salonId: string;
    currentWeekDays: string[];
    currentHours: string[]; // ["09:00", "18:00"] gibi bekleniyor
}

export const WorkingScheduleCard = ({ salonId, currentWeekDays, currentHours }: WorkingScheduleCardProps) => {
    const queryClient = useQueryClient();

    const defaultStart = currentHours && currentHours.length > 0 ? currentHours[0] : "09:00";
    const defaultEnd = currentHours && currentHours.length > 1 ? currentHours[1] : "18:00";

    const form = useForm<ScheduleFormValues>({
        resolver: zodResolver(scheduleSchema),
        defaultValues: {
            availableWeekDays: currentWeekDays || [],
            startHour: defaultStart,
            endHour: defaultEnd,
        },
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (values: ScheduleFormValues) => setStaffWorkingSchedule(salonId, {
            availableWeekDays: values.availableWeekDays,
            availableHours: [values.startHour, values.endHour]
        }),
        onSuccess: () => {
            toast.success("Çalışma saatleri güncellendi.");
            queryClient.invalidateQueries({ queryKey: userKeys.mySalons() });
        },
        onError: () => {
            toast.error("Güncelleme başarısız.");
        }
    });

    const onSubmit = (values: ScheduleFormValues) => {
        mutate(values);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Çalışma Programı</CardTitle>
                <CardDescription>
                    Haftalık çalışma günlerinizi ve standart mesai saatlerinizi belirleyin.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="availableWeekDays"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Çalışma Günleri</FormLabel>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {daysOfWeek.map((item) => (
                                            <FormField
                                                key={item.id}
                                                control={form.control}
                                                name="availableWeekDays"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={item.id}
                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(item.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...field.value, item.id])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value) => value !== item.id
                                                                                )
                                                                            )
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                {item.label}
                                                            </FormLabel>
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startHour"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Başlangıç Saati</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endHour"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bitiş Saati</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Kaydediliyor..." : "Programı Kaydet"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};