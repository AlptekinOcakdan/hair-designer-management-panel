"use client";

import {Organisation} from "@/modules/organisations/server/procedures";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {OrganisationCreateForm} from "@/modules/admin/ui/components/forms/organisation-create-form";
import {OrganisationUpdateForm} from "@/modules/admin/ui/components/forms/organisation-update-form";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

type OrganisationOperationSectionProps = {
    organisation: Organisation | null;
    activeTab: "create" | "update";
    onTabChangeAction: (tab: "create" | "update") => void;
}

export const OrganisationOperationSection = ({organisation, activeTab, onTabChangeAction}: OrganisationOperationSectionProps) => {

    return (
        <Card>
            <CardHeader>
                <CardTitle>Organizasyon İşlemleri</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => onTabChangeAction(value as "create" | "update")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="create">Yeni Oluştur</TabsTrigger>
                        <TabsTrigger value="update" disabled={!organisation}>Güncelle</TabsTrigger>
                    </TabsList>
                    <TabsContent value="create" className="mt-4">
                        <OrganisationCreateForm/>
                    </TabsContent>
                    <TabsContent value="update" className="mt-4">
                        {organisation ? (
                            <OrganisationUpdateForm organisation={organisation}/>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center p-4">
                                Güncellemek için bir organizasyon seçin.
                            </p>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};
