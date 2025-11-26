"use client";

import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {Organisation, updateOrganisation} from "@/modules/organisations/server/procedures";
import {organisationKeys} from "@/modules/organisations/server/queries";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {useEffect} from "react";

const updateOrganisationSchema = z.object({
    name: z.string().min(3, "Organizasyon adı en az 3 karakter olmalıdır."),
});

type UpdateOrganisationFormValues = z.infer<typeof updateOrganisationSchema>;

type UpdateOrganisationFormProps = {
    organisation: Organisation;
}

export const OrganisationUpdateForm = ({organisation}: UpdateOrganisationFormProps) => {
    const queryClient = useQueryClient();
    const form = useForm<UpdateOrganisationFormValues>({
        resolver: zodResolver(updateOrganisationSchema),
        defaultValues: {
            name: organisation.name,
        },
    });

    useEffect(() => {
        form.reset({name: organisation.name});
    }, [organisation, form]);

    const {mutate, isPending} = useMutation({
        mutationFn: (values: UpdateOrganisationFormValues) => updateOrganisation(organisation.id, values),
        onSuccess: async () => {
            toast.success("Organizasyon başarıyla güncellendi!");
            await queryClient.invalidateQueries({queryKey: organisationKeys.lists()});
            await queryClient.invalidateQueries({queryKey: organisationKeys.detail(organisation.id)});
        },
        onError: (error) => {
            toast.error(error.message || "Organizasyon güncellenemedi.");
        }
    });

    const onSubmit = (values: UpdateOrganisationFormValues) => {
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
                    {isPending ? "Güncelleniyor..." : "Organizasyonu Güncelle"}
                </Button>
            </form>
        </Form>
    );
};
