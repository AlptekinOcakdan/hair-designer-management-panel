"use client";

import { UsersListSection } from "@/modules/admin/ui/sections/users-list-section";
import { UsersOperationSection } from "@/modules/admin/ui/sections/users-operation-section";
import { useState } from "react";
import { User } from "@/modules/users/server/procedures";

export const UsersView = () => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<"create" | "update" | "assign" | "authorize">("create");

    const handleUserSelectAction = (user: User) => {
        setSelectedUser(user);
        setActiveTab("update");
    };

    const handleUserAssignAction = (user: User) => {
        setSelectedUser(user);
        setActiveTab("assign");
    }

    const handleUserAuthorizeAction = (user: User) => {
        setSelectedUser(user);
        setActiveTab("authorize");
    }

    const handleTabChange = (tab: "create" | "update" | "assign" | "authorize") => {
        setActiveTab(tab);
        if (tab === "create") {
            setSelectedUser(null);
        }
    };

    return (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
            <div className="w-full">
                <UsersListSection
                    onUserSelectAction={handleUserSelectAction}
                    onUserAssignAction={handleUserAssignAction}
                    onUserAuthorizeAction={handleUserAuthorizeAction}
                />
            </div>
            <div className="w-full">
                <UsersOperationSection
                    user={selectedUser}
                    activeTab={activeTab}
                    onTabChangeAction={handleTabChange}
                />
            </div>
        </div>
    );
};