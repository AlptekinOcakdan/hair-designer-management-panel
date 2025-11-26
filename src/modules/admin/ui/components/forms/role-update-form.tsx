"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Role, updateRole } from "@/modules/roles/server/procedures";
import { roleKeys } from "@/modules/roles/server/queries";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect } from "react";

const updateRoleSchema = z.object({
    role: z.string().min(3, "Rol adı en az 3 karakter olmalıdır."),
});

type UpdateRoleFormValues = z.infer<typeof updateRoleSchema>;

type UpdateRoleFormProps = {
    role: Role;
}

export const RoleUpdateForm = ({ role }: UpdateRoleFormProps) => {
    const queryClient = useQueryClient();
    const form = useForm<UpdateRoleFormValues>({
        resolver: zodResolver(updateRoleSchema),
        defaultValues: {
            role: role.role,
        },
    });

    useEffect(() => {
        form.reset({ role: role.role });
    }, [role, form]);

    const { mutate, isPending } = useMutation({
        mutationFn: (values: UpdateRoleFormValues) => updateRole(role.id, values),
        onSuccess: async () => {
            toast.success("Rol başarıyla güncellendi!");
            await queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
            await queryClient.invalidateQueries({ queryKey: roleKeys.detail(role.id) });
        },
        onError: (error) => {
            toast.error(error.message || "Rol güncellenemedi.");
        }
    });

    const onSubmit = (values: UpdateRoleFormValues) => {
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
                    {isPending ? "Güncelleniyor..." : "Rolü Güncelle"}
                </Button>
            </form>
        </Form>
    );
};