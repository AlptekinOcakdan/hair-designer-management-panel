"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSalon } from "@/modules/salons/server/procedures";
import { salonKeys } from "@/modules/salons/server/queries";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const createSalonSchema = z.object({
    name: z.string().min(3, "Salon adı en az 3 karakter olmalıdır."),
    location: z.string().min(3, "Konum en az 3 karakter olmalıdır."),
});

type CreateSalonFormValues = z.infer<typeof createSalonSchema>;

type CreateSalonFormProps = {
    organisationId: string;
}

export const SalonCreateForm = ({ organisationId }: CreateSalonFormProps) => {
    const queryClient = useQueryClient();
    const form = useForm<CreateSalonFormValues>({
        resolver: zodResolver(createSalonSchema),
        defaultValues: {
            name: "",
            location: "",
        },
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (values: CreateSalonFormValues) => createSalon({ ...values, organisationId }),
        onSuccess: async () => {
            toast.success("Salon başarıyla oluşturuldu!");
            await queryClient.invalidateQueries({ queryKey: salonKeys.byOrganisation(organisationId) });
            form.reset();
        },
        onError: (error) => {
            toast.error(error.message || "Salon oluşturulamadı.");
        }
    });

    const onSubmit = (values: CreateSalonFormValues) => {
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
                    {isPending ? "Oluşturuluyor..." : "Salon Oluştur"}
                </Button>
            </form>
        </Form>
    );
};
