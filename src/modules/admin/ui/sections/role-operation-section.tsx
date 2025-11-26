"use client";

import { Role } from "@/modules/roles/server/procedures";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleCreateForm } from "@/modules/admin/ui/components/forms/role-create-form";
import { RoleUpdateForm } from "@/modules/admin/ui/components/forms/role-update-form";

type RoleOperationSectionProps = {
    role: Role | null;
    activeTab: "create" | "update";
    onTabChangeAction: (tab: "create" | "update") => void;
}

export const RoleOperationSection = ({ role, activeTab, onTabChangeAction }: RoleOperationSectionProps) => {

    return (
        <Card>
            <CardHeader>
                <CardTitle>Rol İşlemleri</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => onTabChangeAction(value as "create" | "update")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="create">Yeni Oluştur</TabsTrigger>
                        <TabsTrigger value="update" disabled={!role}>Güncelle</TabsTrigger>
                    </TabsList>
                    <TabsContent value="create" className="mt-4">
                        <RoleCreateForm />
                    </TabsContent>
                    <TabsContent value="update" className="mt-4">
                        {role ? (
                            <RoleUpdateForm role={role} />
                        ) : (
                            <p className="text-sm text-muted-foreground text-center p-4">
                                Güncellemek için bir rol seçin.
                            </p>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

