"use client";

import { Permission } from "@/modules/permissions/server/procedures";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionCreateForm } from "@/modules/admin/ui/components/forms/permission-create-form";
import { PermissionUpdateForm } from "@/modules/admin/ui/components/forms/permission-update-form";

type PermissionOperationSectionProps = {
    permission: Permission | null;
    activeTab: "create" | "update";
    onTabChangeAction: (tab: "create" | "update") => void;
}

export const PermissionOperationSection = ({ permission, activeTab, onTabChangeAction }: PermissionOperationSectionProps) => {

    return (
        <Card>
            <CardHeader>
                <CardTitle>Yetki İşlemleri</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => onTabChangeAction(value as "create" | "update")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="create">Yeni Oluştur</TabsTrigger>
                        <TabsTrigger value="update" disabled={!permission}>Güncelle</TabsTrigger>
                    </TabsList>
                    <TabsContent value="create" className="mt-4">
                        <PermissionCreateForm />
                    </TabsContent>
                    <TabsContent value="update" className="mt-4">
                        {permission ? (
                            <PermissionUpdateForm permission={permission} />
                        ) : (
                            <p className="text-sm text-muted-foreground text-center p-4">
                                Güncellemek için bir yetki seçin.
                            </p>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

