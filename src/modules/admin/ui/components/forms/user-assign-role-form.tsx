"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { assignRoleToUser, User } from "@/modules/users/server/procedures";
import { userKeys } from "@/modules/users/server/queries";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { organisationQueries } from "@/modules/organisations/server/queries";
import { roleQueries } from "@/modules/roles/server/queries";
import { useEffect, useState } from "react";
import { Organisation } from "@/modules/organisations/server/procedures";
import { Role } from "@/modules/roles/server/procedures";
import {Salon} from "@/modules/salons/server/procedures";
import {salonQueries} from "@/modules/salons/server/queries";

const assignRoleSchema = z.object({
    roleId: z.string().min(1, "Rol seçimi zorunludur."),
    organisationId: z.string().optional(),
    salonId: z.string().optional(),
});

type AssignRoleFormValues = z.infer<typeof assignRoleSchema>;

type UserAssignRoleFormProps = {
    user: User;
};

export const UserAssignRoleForm = ({ user }: UserAssignRoleFormProps) => {
    const queryClient = useQueryClient();
    const { data: organisations } = useSuspenseQuery(organisationQueries.list());
    const { data: roles } = useSuspenseQuery(roleQueries.list());
    const [selectedOrgId, setSelectedOrgId] = useState<string | undefined>();

    const { data: salons } = useQuery({
        ...salonQueries.listByOrganisation(selectedOrgId!),
        enabled: !!selectedOrgId,
    });

    const form = useForm<AssignRoleFormValues>({
        resolver: zodResolver(assignRoleSchema),
    });

    useEffect(() => {
        form.reset({ roleId: undefined, organisationId: undefined, salonId: undefined });
        setSelectedOrgId(undefined);
    }, [user, form]);

    const { mutate, isPending } = useMutation({
        mutationFn: (values: AssignRoleFormValues) => assignRoleToUser({ ...values, userId: user.id }),
        onSuccess: async () => {
            toast.success("Rol başarıyla atandı!");
            await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
        onError: (error) => {
            toast.error(error.message || "Rol atanamadı.");
        },
    });

    const onSubmit = (values: AssignRoleFormValues) => {
        mutate(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <p className="text-sm font-medium">Kullanıcı: {user.firstname} {user.lastname}</p>
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
                <FormField
                    control={form.control}
                    name="organisationId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Organizasyon (İsteğe Bağlı)</FormLabel>
                            <Select onValueChange={(value) => { field.onChange(value); setSelectedOrgId(value); form.setValue("salonId", undefined); }} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Bir organizasyon seçin" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {organisations.map((org: Organisation) => (
                                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="salonId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Salon (İsteğe Bağlı)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedOrgId || !salons || salons.length === 0}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Önce organizasyon seçin" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {salons?.map((salon: Salon) => (
                                        <SelectItem key={salon.id} value={salon.id}>{salon.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Yetkilendiriliyor..." : "Yetkilendir"}
                </Button>
            </form>
        </Form>
    );
};
