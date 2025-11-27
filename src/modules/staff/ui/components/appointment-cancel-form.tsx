"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppointmentResponse, cancelAppointment } from "@/modules/users/server/procedures";
import { userKeys } from "@/modules/users/server/queries";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEffect } from "react";

const cancelAppointmentSchema = z.object({
    reason: z.string().min(5, "İptal nedeni en az 5 karakter olmalıdır."),
});

type CancelAppointmentFormValues = z.infer<typeof cancelAppointmentSchema>;

type AppointmentCancelFormProps = {
    appointment: AppointmentResponse;
    onSuccessAction?: () => void;
}

export const AppointmentCancelForm = ({ appointment, onSuccessAction }: AppointmentCancelFormProps) => {
    const queryClient = useQueryClient();
    const form = useForm<CancelAppointmentFormValues>({
        resolver: zodResolver(cancelAppointmentSchema),
        defaultValues: {
            reason: "",
        },
    });

    // Appointment değiştiğinde formu sıfırla
    useEffect(() => {
        form.reset({ reason: "" });
    }, [appointment, form]);

    const { mutate, isPending } = useMutation({
        mutationFn: (values: CancelAppointmentFormValues) => cancelAppointment(appointment.id, values),
        onSuccess: async () => {
            toast.success("Randevu başarıyla iptal edildi.");
            // Tüm tarihlerin randevu listesini invalidate edebiliriz veya spesifik tarih varsa onu
            await queryClient.invalidateQueries({ queryKey: userKeys.staffAppointments() });
            form.reset();
            if (onSuccessAction) onSuccessAction();
        },
        onError: (error) => {
            toast.error(error.message || "İptal işlemi başarısız.");
        }
    });

    const onSubmit = (values: CancelAppointmentFormValues) => {
        mutate(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="p-4 border rounded-md bg-muted/50 mb-4">
                    <p className="text-sm font-medium">Randevu Detayı</p>
                    <p className="text-sm text-muted-foreground">
                        {appointment.client?.firstname} {appointment.client?.lastname} - {new Date(appointment.appointmentDate).toLocaleDateString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>İptal Nedeni</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Lütfen iptal nedenini belirtin..."
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" variant="destructive" disabled={isPending} className="w-full">
                    {isPending ? "İptal Ediliyor..." : "Randevuyu İptal Et"}
                </Button>
            </form>
        </Form>
    );
};