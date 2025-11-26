"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAndAssignUser } from "@/modules/users/server/procedures";
import { userKeys } from "@/modules/users/server/queries";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { salonQueries } from "@/modules/salons/server/queries";
import { roleQueries } from "@/modules/roles/server/queries";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const createEmployeeSchema = z.object({
    firstname: z.string().min(2, "Ad en az 2 karakter olmalıdır."),
    lastname: z.string().min(2, "Soyad en az 2 karakter olmalıdır."),
    email: z.email("Geçersiz e-posta adresi."),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
    phoneNumber: z.string().optional(),
    salonId: z.string(),
    roleId: z.string(),
});

type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;

type CreateEmployeeFormProps = {
    organisationId: string;
}

export const EmployeeCreateForm = ({ organisationId }: CreateEmployeeFormProps) => {
    const queryClient = useQueryClient();

    const { data: salons, isLoading: isLoadingSalons } = useQuery(salonQueries.listByOrganisation(organisationId));
    const { data: roles, isLoading: isLoadingRoles } = useQuery(roleQueries.list());

    const filteredRoles = useMemo(() => {
        return roles?.filter(role => role.role === 'STAFF' || role.role === 'MANAGER');
    }, [roles]);

    const form = useForm<CreateEmployeeFormValues>({
        resolver: zodResolver(createEmployeeSchema),
        defaultValues: {
            firstname: "",
            lastname: "",
            email: "",
            password: "",
            phoneNumber: "",
        },
    });

    const { mutate, isPending } = useMutation({
        mutationFn: createAndAssignUser,
        onSuccess: async () => {
            toast.success("Çalışan başarıyla oluşturuldu ve atandı!");
            await queryClient.invalidateQueries({ queryKey: userKeys.byOrganisation(organisationId) });
            form.reset();
        },
        onError: (error) => {
            toast.error(error.message || "Çalışan oluşturulamadı.");
        }
    });

    const onSubmit = (values: CreateEmployeeFormValues) => {
        const { salonId, roleId, ...userData } = values;
        mutate({
            userData: {
                ...userData,
                username: userData.email, // or generate a unique username
                phoneNumber: userData.phoneNumber || "",
            },
            salonId,
            roleId,
        });
    };

    if (isLoadingSalons || isLoadingRoles) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="firstname" render={({ field }) => (
                    <FormItem><FormLabel>Ad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="lastname" render={({ field }) => (
                    <FormItem><FormLabel>Soyad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>E-posta</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Şifre</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                    <FormItem><FormLabel>Telefon Numarası</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
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
                    {isPending ? "Oluşturuluyor..." : "Çalışan Oluştur"}
                </Button>
            </form>
        </Form>
    );
};

