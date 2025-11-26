"use client";

import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {createUser} from "@/modules/users/server/procedures";
import {userKeys} from "@/modules/users/server/queries";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";

const createUserSchema = z.object({
    firstname: z.string().min(2, "Ad en az 2 karakter olmalıdır."),
    lastname: z.string().min(2, "Soyad en az 2 karakter olmalıdır."),
    email: z.email("Geçersiz e-posta adresi."),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
    phoneNumber: z.string().optional(),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const UserCreateForm = () => {
    const queryClient = useQueryClient();
    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            firstname: "",
            lastname: "",
            email: "",
            password: "",
            phoneNumber: "",
        },
    });

    const {mutate, isPending} = useMutation({
        mutationFn: createUser,
        onSuccess: async () => {
            toast.success("Kullanıcı başarıyla oluşturuldu!");
            await queryClient.invalidateQueries({queryKey: userKeys.lists()});
            form.reset();
        },
        onError: (error) => {
            toast.error(error.message || "Kullanıcı oluşturulamadı.");
        }
    });

    const onSubmit = (values: CreateUserFormValues) => {
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
                <FormField control={form.control} name="password" render={({field}) => (
                    <FormItem>
                        <FormLabel>Şifre</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
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
                    {isPending ? "Oluşturuluyor..." : "Kullanıcı Oluştur"}
                </Button>
            </form>
        </Form>
    );
};