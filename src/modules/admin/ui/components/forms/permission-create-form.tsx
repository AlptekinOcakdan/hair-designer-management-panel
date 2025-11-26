"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPermission } from "@/modules/permissions/server/procedures";
import { permissionKeys } from "@/modules/permissions/server/queries";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const createPermissionSchema = z.object({
    action: z.string().min(3, "Yetki en az 3 karakter olmalıdır."),
    description: z.string().min(1, "Açıklama alanı zorunludur."),
});

type CreatePermissionFormValues = z.infer<typeof createPermissionSchema>;

export const PermissionCreateForm = () => {
    const queryClient = useQueryClient();
    const form = useForm<CreatePermissionFormValues>({
        resolver: zodResolver(createPermissionSchema),
        defaultValues: {
            action: "",
            description: "",
        },
    });

    const { mutate, isPending } = useMutation({
        mutationFn: createPermission,
        onSuccess: async () => {
            toast.success("Yetki başarıyla oluşturuldu!");
            await queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
            form.reset();
        },
        onError: (error) => {
            toast.error(error.message || "Yetki oluşturulamadı.");
        }
    });

    const onSubmit = (values: CreatePermissionFormValues) => {
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
                    {isPending ? "Oluşturuluyor..." : "Yetki Oluştur"}
                </Button>
            </form>
        </Form>
    );
};