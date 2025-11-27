"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recordStaffProcedure } from "@/modules/users/server/procedures";
import { userKeys, userQueries } from "@/modules/users/server/queries";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {procedureQueries} from "@/modules/procedures/server/queries";

const addProcedureSchema = z.object({
    procedureId: z.string().min(1, "Lütfen bir prosedür seçin."),
    durationMinutes: z.coerce.number().min(1, "Süre en az 1 dakika olmalıdır."),
    price: z.string().min(1, "Fiyat gereklidir."),
});

type AddProcedureFormValues = z.infer<typeof addProcedureSchema>;

type ProcedureAddFormProps = {
    staffId: string;
}

export const ProcedureAddForm = ({ staffId }: ProcedureAddFormProps) => {
    const queryClient = useQueryClient();

    const { data: globalProcedures, isLoading } = useQuery(procedureQueries.list());
    const { data: myProcedures } = useQuery(userQueries.listMyProcedures());

    // Fix: Remove explicit generic <AddProcedureFormValues> to allow inference and avoid TS2322 mismatch on resolver
    const form = useForm({
        resolver: zodResolver(addProcedureSchema),
        defaultValues: {
            procedureId: "",
            durationMinutes: 30,
            price: "",
        },
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (values: AddProcedureFormValues) => recordStaffProcedure({
            staffId: staffId,
            procedureId: values.procedureId,
            durationMinutes: values.durationMinutes,
            price: values.price
        }),
        onSuccess: async () => {
            toast.success("Prosedür listenize eklendi!");
            await queryClient.invalidateQueries({ queryKey: userKeys.myProcedures() });
            form.reset();
        },
        onError: (error) => {
            toast.error(error.message || "Prosedür eklenemedi.");
        }
    });

    const onSubmit = (values: AddProcedureFormValues) => {
        if (myProcedures?.some(p => p.procedureId === values.procedureId)) {
            toast.error("Bu prosedür zaten listenizde mevcut. Güncelleme sekmesini kullanabilirsiniz.");
            return;
        }
        mutate(values);
    };

    if (isLoading) return <Skeleton className="h-40 w-full" />;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="procedureId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prosedür</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Prosedür seçin" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {globalProcedures?.map((proc) => (
                                        <SelectItem key={proc.id} value={proc.id}>
                                            {proc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="durationMinutes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Süre (Dakika)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        value={field.value as number}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fiyat (TL)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Örn: 500" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Ekleniyor..." : "Prosedürü Ekle"}
                </Button>
            </form>
        </Form>
    );
};