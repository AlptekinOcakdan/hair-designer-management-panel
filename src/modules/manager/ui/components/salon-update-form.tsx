"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Salon, updateSalon } from "@/modules/salons/server/procedures";
import { salonKeys } from "@/modules/salons/server/queries";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect } from "react";

const updateSalonSchema = z.object({
    name: z.string().min(3, "Salon adı en az 3 karakter olmalıdır."),
    location: z.string().min(3, "Konum en az 3 karakter olmalıdır."),
});

type UpdateSalonFormValues = z.infer<typeof updateSalonSchema>;

type UpdateSalonFormProps = {
    salon: Salon;
}

export const SalonUpdateForm = ({ salon }: UpdateSalonFormProps) => {
    const queryClient = useQueryClient();
    const form = useForm<UpdateSalonFormValues>({
        resolver: zodResolver(updateSalonSchema),
        defaultValues: {
            name: salon.name,
            location: salon.location,
        },
    });

    useEffect(() => {
        form.reset({
            name: salon.name,
            location: salon.location,
        });
    }, [salon, form]);

    const { mutate, isPending } = useMutation({
        mutationFn: (values: UpdateSalonFormValues) => updateSalon(salon.id, values),
        onSuccess: async () => {
            toast.success("Salon başarıyla güncellendi!");
            await queryClient.invalidateQueries({ queryKey: salonKeys.byOrganisation(salon.organisationId) });
            await queryClient.invalidateQueries({ queryKey: salonKeys.detail(salon.id) });
        },
        onError: (error) => {
            toast.error(error.message || "Salon güncellenemedi.");
        }
    });

    const onSubmit = (values: UpdateSalonFormValues) => {
        mutate(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Salon Adı</FormLabel>
                            <FormControl>
                                <Input placeholder="Örn: Merkez Şube" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Konum</FormLabel>
                            <FormControl>
                                <Input placeholder="Örn: İstanbul, Kadıköy" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Güncelleniyor..." : "Salonu Güncelle"}
                </Button>
            </form>
        </Form>
    );
};
