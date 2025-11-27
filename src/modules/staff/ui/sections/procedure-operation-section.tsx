"use client";

import { StaffProcedureDetail } from "@/modules/users/server/procedures";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcedureUpdateForm } from "@/modules/staff/ui/components/procedure-update-form";
import {ProcedureAddForm} from "@/modules/staff/ui/components/procedure-create-form";

type ProcedureOperationSectionProps = {
    selectedProcedure: StaffProcedureDetail | null;
    activeTab: "create" | "update";
    onTabChangeAction: (tab: "create" | "update") => void;
    staffId: string;
}

export const ProcedureOperationSection = ({ selectedProcedure, activeTab, onTabChangeAction, staffId }: ProcedureOperationSectionProps) => {

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Prosedür İşlemleri</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => onTabChangeAction(value as "create" | "update")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="create">Yeni Ekle</TabsTrigger>
                        <TabsTrigger value="update" disabled={!selectedProcedure}>Güncelle</TabsTrigger>
                    </TabsList>

                    <TabsContent value="create" className="mt-4">
                        <ProcedureAddForm staffId={staffId} />
                    </TabsContent>

                    <TabsContent value="update" className="mt-4">
                        {selectedProcedure ? (
                            <ProcedureUpdateForm procedure={selectedProcedure} />
                        ) : (
                            <p className="text-sm text-muted-foreground text-center p-4">
                                Güncellemek için listeden bir prosedür seçin.
                            </p>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};