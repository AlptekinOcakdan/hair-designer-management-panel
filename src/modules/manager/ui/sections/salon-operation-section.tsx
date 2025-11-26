"use client";

import { Salon } from "@/modules/salons/server/procedures";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalonCreateForm } from "@/modules/manager/ui/components/salon-create-form";
import { SalonUpdateForm } from "@/modules/manager/ui/components/salon-update-form";

type SalonOperationSectionProps = {
    salon: Salon | null;
    activeTab: "create" | "update";
    onTabChangeAction: (tab: "create" | "update") => void;
    organisationId?: string;
}

export const SalonOperationSection = ({ salon, activeTab, onTabChangeAction, organisationId }: SalonOperationSectionProps) => {

    return (
        <Card>
            <CardHeader>
                <CardTitle>Salon İşlemleri</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => onTabChangeAction(value as "create" | "update")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="create">Yeni Oluştur</TabsTrigger>
                        <TabsTrigger value="update" disabled={!salon}>Güncelle</TabsTrigger>
                    </TabsList>
                    <TabsContent value="create" className="mt-4">
                        {organisationId ? (
                            <SalonCreateForm organisationId={organisationId} />
                        ) : (
                            <p className="text-sm text-muted-foreground text-center p-4">
                                Salon oluşturmak için bir organizasyon gereklidir.
                            </p>
                        )}
                    </TabsContent>
                    <TabsContent value="update" className="mt-4">
                        {salon ? (
                            <SalonUpdateForm salon={salon} />
                        ) : (
                            <p className="text-sm text-muted-foreground text-center p-4">
                                Güncellemek için bir salon seçin.
                            </p>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};
