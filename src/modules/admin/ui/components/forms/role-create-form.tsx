"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRole } from "@/modules/roles/server/procedures";
import { roleKeys } from "@/modules/roles/server/queries";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const createRoleSchema = z.object({
    role: z.string().min(3, "Rol adı en az 3 karakter olmalıdır."),
});

type CreateRoleFormValues = z.infer<typeof createRoleSchema>;

export const RoleCreateForm = () => {
    const queryClient = useQueryClient();
    const form = useForm<CreateRoleFormValues>({
        resolver: zodResolver(createRoleSchema),
        defaultValues: {
            role: "",
        },
    });

    const { mutate, isPending } = useMutation({
        mutationFn: createRole,
        onSuccess: async () => {
            toast.success("Rol başarıyla oluşturuldu!");
            await queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
            form.reset();
        },
        onError: (error) => {
            toast.error(error.message || "Rol oluşturulamadı.");
        }
    });

    const onSubmit = (values: CreateRoleFormValues) => {
        mutate(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rol Adı</FormLabel>
                            <FormControl>
                                <Input placeholder="Örn: Yönetici" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Oluşturuluyor..." : "Rol Oluştur"}
                </Button>
            </form>
        </Form>
    );
};