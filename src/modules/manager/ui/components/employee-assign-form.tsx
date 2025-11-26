"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignUserToSalon, OrganisationUser } from "@/modules/users/server/procedures";
import { userKeys } from "@/modules/users/server/queries";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { salonQueries } from "@/modules/salons/server/queries";
import { roleQueries } from "@/modules/roles/server/queries";
import { useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const assignEmployeeSchema = z.object({
    salonId: z.string(),
    roleId: z.string(),
});

type AssignEmployeeFormValues = z.infer<typeof assignEmployeeSchema>;

type EmployeeAssignFormProps = {
    organisationId: string;
    employee: OrganisationUser;
}

export const EmployeeAssignForm = ({ organisationId, employee }: EmployeeAssignFormProps) => {
    const queryClient = useQueryClient();

    const { data: salons, isLoading: isLoadingSalons } = useQuery(salonQueries.listByOrganisation(organisationId));
    const { data: roles, isLoading: isLoadingRoles } = useQuery(roleQueries.list());

    const filteredRoles = useMemo(() => {
        return roles?.filter(role => role.role === 'STAFF' || role.role === 'MANAGER');
    }, [roles]);

    const form = useForm<AssignEmployeeFormValues>({
        resolver: zodResolver(assignEmployeeSchema),
        defaultValues: {
            salonId: employee.salon?.id || "",
            roleId: employee.roles[0]?.id || "",
        },
    });

    useEffect(() => {
        form.reset({
            salonId: employee.salon?.id || "",
            roleId: employee.roles[0]?.id || "",
        });
    }, [employee, form]);

    const { mutate, isPending } = useMutation({
        mutationFn: assignUserToSalon,
        onSuccess: async () => {
            toast.success("Çalışan başarıyla atandı!");
            await queryClient.invalidateQueries({ queryKey: userKeys.byOrganisation(organisationId) });
        },
        onError: (error) => {
            toast.error(error.message || "Atama işlemi başarısız oldu.");
        }
    });

    const onSubmit = (values: AssignEmployeeFormValues) => {
        mutate({
            ...values,
            userId: employee.user.id,
        });
    };

    if (isLoadingSalons || isLoadingRoles) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="p-4 border rounded-md bg-muted/50">
                    <p className="text-sm font-medium">{employee.user.firstname} {employee.user.lastname}</p>
                    <p className="text-sm text-muted-foreground">{employee.user.email}</p>
                </div>
                <FormField control={form.control} name="salonId" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Salon</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Salon seçin" /></SelectTrigger></FormControl>
                            <SelectContent>
                                {salons?.map(salon => <SelectItem key={salon.id} value={salon.id}>{salon.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="roleId" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Rol</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Rol seçin" /></SelectTrigger></FormControl>
                            <SelectContent>
                                {filteredRoles?.map(role => <SelectItem key={role.id} value={role.id}>{role.role}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Atanıyor..." : "Çalışanı Ata"}
                </Button>
            </form>
        </Form>
    );
};

