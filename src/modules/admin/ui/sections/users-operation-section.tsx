"use client";

import {User} from "@/modules/users/server/procedures";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {UserCreateForm} from "@/modules/admin/ui/components/forms/user-create-form";
import {UserUpdateForm} from "@/modules/admin/ui/components/forms/user-update-form";
import {UserAssignToSalonForm} from "@/modules/admin/ui/components/forms/user-assign-to-salon-form";
import {UserAssignRoleForm} from "@/modules/admin/ui/components/forms/user-assign-role-form";

type UserOperationSectionProps = {
    user: User | null;
    activeTab: "create" | "update" | "assign" | "authorize";
    onTabChangeAction: (tab: "create" | "update" | "assign" | "authorize") => void;
}

export const UsersOperationSection = ({user, activeTab, onTabChangeAction}: UserOperationSectionProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Kullanıcı İşlemleri</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => onTabChangeAction(value as "create" | "update" | "assign" | "authorize")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="create">Yeni Oluştur</TabsTrigger>
                        <TabsTrigger value="update" disabled={!user}>Güncelle</TabsTrigger>
                    </TabsList>
                    <TabsList className="grid w-full grid-cols-2 mt-2">
                        <TabsTrigger value="assign" disabled={!user}>Ata</TabsTrigger>
                        <TabsTrigger value="authorize" disabled={!user}>Yetkilendir</TabsTrigger>
                    </TabsList>
                    <TabsContent value="create" className="mt-4">
                        <UserCreateForm />
                    </TabsContent>
                    <TabsContent value="update" className="mt-4">
                        {user ? (
                            <UserUpdateForm user={user}/>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center p-4">
                                Güncellemek için bir kullanıcı seçin.
                            </p>
                        )}
                    </TabsContent>
                    <TabsContent value="assign" className="mt-4">
                        {user ? (
                            <UserAssignToSalonForm user={user}/>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center p-4">
                                Bir salona atamak için bir kullanıcı seçin.
                            </p>
                        )}
                    </TabsContent>
                    <TabsContent value="authorize" className="mt-4">
                        {user ? (
                            <UserAssignRoleForm user={user}/>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center p-4">
                                Yetkilendirmek için bir kullanıcı seçin.
                            </p>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};