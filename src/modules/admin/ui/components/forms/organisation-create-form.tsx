"use client";

import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {createOrganisation} from "@/modules/organisations/server/procedures";
import {organisationKeys} from "@/modules/organisations/server/queries";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";

const createOrganisationSchema = z.object({
    name: z.string().min(3, "Organizasyon adı en az 3 karakter olmalıdır."),
});

type CreateOrganisationFormValues = z.infer<typeof createOrganisationSchema>;

export const OrganisationCreateForm = () => {
    const queryClient = useQueryClient();
    const form = useForm<CreateOrganisationFormValues>({
        resolver: zodResolver(createOrganisationSchema),
        defaultValues: {
            name: "",
        },
    });

    const {mutate, isPending} = useMutation({
        mutationFn: createOrganisation,
        onSuccess: async () => {
            toast.success("Organizasyon başarıyla oluşturuldu!");
            await queryClient.invalidateQueries({queryKey: organisationKeys.lists()});
            form.reset();
        },
        onError: (error) => {
            toast.error(error.message || "Organizasyon oluşturulamadı.");
        }
    });

    const onSubmit = (values: CreateOrganisationFormValues) => {
        mutate(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Organizasyon Adı</FormLabel>
                            <FormControl>
                                <Input placeholder="Harika Organizasyonum" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Oluşturuluyor..." : "Organizasyon Oluştur"}
                </Button>
            </form>
        </Form>
    );
};
