"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Permission, updatePermission } from "@/modules/permissions/server/procedures";
import { permissionKeys } from "@/modules/permissions/server/queries";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

const updatePermissionSchema = z.object({
    action: z.string().min(3, "Yetki en az 3 karakter olmalıdır."),
    description: z.string().optional(),
});

type UpdatePermissionFormValues = z.infer<typeof updatePermissionSchema>;

type UpdatePermissionFormProps = {
    permission: Permission;
}

export const PermissionUpdateForm = ({ permission }: UpdatePermissionFormProps) => {
    const queryClient = useQueryClient();
    const form = useForm<UpdatePermissionFormValues>({
        resolver: zodResolver(updatePermissionSchema),
        defaultValues: {
            action: permission.action,
            description: permission.description || "",
        },
    });

    useEffect(() => {
        form.reset({
            action: permission.action,
            description: permission.description || "",
        });
    }, [permission, form]);

    const { mutate, isPending } = useMutation({
        mutationFn: (values: UpdatePermissionFormValues) => updatePermission(permission.id, values),
        onSuccess: async () => {
            toast.success("Yetki başarıyla güncellendi!");
            await queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
            await queryClient.invalidateQueries({ queryKey: permissionKeys.detail(permission.id) });
        },
        onError: (error) => {
            toast.error(error.message || "Yetki güncellenemedi.");
        }
    });

    const onSubmit = (values: UpdatePermissionFormValues) => {
        mutate(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="action"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Yetki</FormLabel>
                            <FormControl>
                                <Input placeholder="Örn: users:create" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Açıklama</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Yetki hakkında kısa bir açıklama." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Güncelleniyor..." : "Yetkiyi Güncelle"}
                </Button>
            </form>
        </Form>
    );
};