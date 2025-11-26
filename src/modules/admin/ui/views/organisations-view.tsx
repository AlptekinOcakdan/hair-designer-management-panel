"use client";

import {OrganisationListSection} from "@/modules/admin/ui/sections/organisation-list-section";

export const OrganisationsView = () => {
    return (
        <div className="p-4">
            <div className="w-full">
                <OrganisationListSection />
            </div>
        </div>
    );
};