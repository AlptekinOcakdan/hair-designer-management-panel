"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { assignUserToSalon, User } from "@/modules/users/server/procedures";
import { userKeys } from "@/modules/users/server/queries";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { salonQueries } from "@/modules/salons/server/queries";
import { roleQueries } from "@/modules/roles/server/queries";
import { useEffect } from "react";
import { Salon } from "@/modules/salons/server/procedures";
import { Role } from "@/modules/roles/server/procedures";

const assignToSalonSchema = z.object({
    salonId: z.string().min(1, "Salon seçimi zorunludur."),
    roleId: z.string().min(1, "Rol seçimi zorunludur."),
});

type AssignToSalonFormValues = z.infer<typeof assignToSalonSchema>;

type UserAssignToSalonFormProps = {
    user: User;
};

export const UserAssignToSalonForm = ({ user }: UserAssignToSalonFormProps) => {
    const queryClient = useQueryClient();
    const { data: salons } = useSuspenseQuery(salonQueries.list());
    const { data: roles } = useSuspenseQuery(roleQueries.list());

    const form = useForm<AssignToSalonFormValues>({
        resolver: zodResolver(assignToSalonSchema),
    });

    useEffect(() => {
        form.reset({ salonId: undefined, roleId: undefined });
    }, [user, form]);

    const { mutate, isPending } = useMutation({
        mutationFn: (values: AssignToSalonFormValues) => assignUserToSalon({ ...values, userId: user.id }),
        onSuccess: async () => {
            toast.success("Kullanıcı salona başarıyla atandı!");
            await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
        onError: (error) => {
            toast.error(error.message || "Kullanıcı salona atanamadı.");
        },
    });

    const onSubmit = (values: AssignToSalonFormValues) => {
        mutate(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <p className="text-sm font-medium">Kullanıcı: {user.firstname} {user.lastname}</p>
                <FormField
                    control={form.control}
                    name="salonId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Salon</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Bir salon seçin" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {salons.map((salon: Salon) => (
                                        <SelectItem key={salon.id} value={salon.id}>{salon.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="roleId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rol</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Bir rol seçin" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {roles?.map((role: Role) => (
                                        <SelectItem key={role.id} value={role.id}>{role.role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Atanıyor..." : "Salona Ata"}
                </Button>
            </form>
        </Form>
    );
};
