"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffProcedureDetail, updateMyProcedure } from "@/modules/users/server/procedures";
import { userKeys } from "@/modules/users/server/queries";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect } from "react";

const updateProcedureSchema = z.object({
    durationMinutes: z.coerce.number().min(1, "Süre en az 1 dakika olmalıdır."),
    price: z.string().min(1, "Fiyat gereklidir."),
});

type UpdateProcedureFormValues = z.infer<typeof updateProcedureSchema>;

type ProcedureUpdateFormProps = {
    procedure: StaffProcedureDetail;
}

export const ProcedureUpdateForm = ({ procedure }: ProcedureUpdateFormProps) => {
    const queryClient = useQueryClient();

    // Fix: Remove explicit generic <UpdateProcedureFormValues> to allow inference and avoid TS2322 mismatch on resolver
    const form = useForm({
        resolver: zodResolver(updateProcedureSchema),
        defaultValues: {
            durationMinutes: procedure.duration,
            price: procedure.price,
        },
    });

    useEffect(() => {
        form.reset({
            durationMinutes: procedure.duration,
            price: procedure.price,
        });
    }, [procedure, form]);

    const { mutate, isPending } = useMutation({
        mutationFn: (values: UpdateProcedureFormValues) => updateMyProcedure(procedure.procedureId, values),
        onSuccess: async () => {
            toast.success("Prosedür güncellendi!");
            await queryClient.invalidateQueries({ queryKey: userKeys.myProcedures() });
        },
        onError: (error) => {
            toast.error(error.message || "Güncelleme başarısız.");
        }
    });

    const onSubmit = (values: UpdateProcedureFormValues) => {
        mutate(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="p-4 border rounded-md bg-muted/50 mb-4">
                    <p className="text-sm font-medium">Seçili Prosedür</p>
                    <p className="text-lg font-bold text-primary">{procedure.procedureName}</p>
                    {procedure.procedureDescription && (
                        <p className="text-sm text-muted-foreground">{procedure.procedureDescription}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="durationMinutes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Süre (Dakika)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        // Fix TS2322: field.value is inferred as unknown, explicit cast required for Input
                                        value={field.value as number}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fiyat (TL)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Örn: 500" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Güncelleniyor..." : "Bilgileri Güncelle"}
                </Button>
            </form>
        </Form>
    );
};