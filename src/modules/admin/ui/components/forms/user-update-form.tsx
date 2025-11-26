"use client";

import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {updateUser, User} from "@/modules/users/server/procedures";
import {userKeys} from "@/modules/users/server/queries";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {useEffect} from "react";

const updateUserSchema = z.object({
    firstname: z.string().min(2, "Ad en az 2 karakter olmalıdır."),
    lastname: z.string().min(2, "Soyad en az 2 karakter olmalıdır."),
    email: z.email("Geçersiz e-posta adresi."),
    phoneNumber: z.string().optional(),
});

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

type UpdateUserFormProps = {
    user: User;
}

export const UserUpdateForm = ({user}: UpdateUserFormProps) => {
    const queryClient = useQueryClient();
    const form = useForm<UpdateUserFormValues>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: {
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            phoneNumber: user.phoneNumber ?? "",
        },
    });

    useEffect(() => {
        form.reset({
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            phoneNumber: user.phoneNumber ?? "",
        });
    }, [user, form]);

    const {mutate, isPending} = useMutation({
        mutationFn: (values: UpdateUserFormValues) => updateUser(user.id, values),
        onSuccess: async () => {
            toast.success("Kullanıcı başarıyla güncellendi!");
            await queryClient.invalidateQueries({queryKey: userKeys.lists()});
            await queryClient.invalidateQueries({queryKey: userKeys.detail(user.id)});
        },
        onError: (error) => {
            toast.error(error.message || "Kullanıcı güncellenemedi.");
        }
    });

    const onSubmit = (values: UpdateUserFormValues) => {
        mutate(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="firstname" render={({field}) => (
                    <FormItem>
                        <FormLabel>Ad</FormLabel>
                        <FormControl><Input placeholder="Ahmet" {...field} /></FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/>
                <FormField control={form.control} name="lastname" render={({field}) => (
                    <FormItem>
                        <FormLabel>Soyad</FormLabel>
                        <FormControl><Input placeholder="Yılmaz" {...field} /></FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/>
                <FormField control={form.control} name="email" render={({field}) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input placeholder="ahmet@yilmaz.com" {...field} /></FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/>
                <FormField control={form.control} name="phoneNumber" render={({field}) => (
                    <FormItem>
                        <FormLabel>Telefon Numarası</FormLabel>
                        <FormControl><Input placeholder="5554443322" {...field} /></FormControl>
                        <FormMessage/>
                    </FormItem>
                )}/>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Güncelleniyor..." : "Kullanıcıyı Güncelle"}
                </Button>
            </form>
        </Form>
    );
};