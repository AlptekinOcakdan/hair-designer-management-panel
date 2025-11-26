"use client";

import { OrganisationUser } from "@/modules/users/server/procedures";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeCreateForm } from "@/modules/manager/ui/components/employee-create-form";
import { EmployeeAssignForm } from "@/modules/manager/ui/components/employee-assign-form";

type EmployeeOperationSectionProps = {
    employee: OrganisationUser | null;
    activeTab: "create" | "assign";
    onTabChangeAction: (tab: "create" | "assign") => void;
    organisationId?: string;
}

export const EmployeeOperationSection = ({ employee, activeTab, onTabChangeAction, organisationId }: EmployeeOperationSectionProps) => {

    return (
        <Card>
            <CardHeader>
                <CardTitle>Çalışan İşlemleri</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => onTabChangeAction(value as "create" | "assign")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="create">Yeni Oluştur</TabsTrigger>
                        <TabsTrigger value="assign" disabled={!employee}>Ata</TabsTrigger>
                    </TabsList>
                    <TabsContent value="create" className="mt-4">
                        {organisationId ? (
                            <EmployeeCreateForm organisationId={organisationId} />
                        ) : (
                            <p className="text-sm text-muted-foreground text-center p-4">
                                Çalışan oluşturmak için bir organizasyon gereklidir.
                            </p>
                        )}
                    </TabsContent>
                    <TabsContent value="assign" className="mt-4">
                        {employee && organisationId ? (
                            <EmployeeAssignForm employee={employee} organisationId={organisationId} />
                        ) : (
                            <p className="text-sm text-muted-foreground text-center p-4">
                                Atama yapmak için bir çalışan seçin.
                            </p>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};