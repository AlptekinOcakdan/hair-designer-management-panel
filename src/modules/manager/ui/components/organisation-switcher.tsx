"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {useSuspenseQuery} from "@tanstack/react-query";
import {organisationQueries} from "@/modules/organisations/server/queries";
import {useState} from "react";
import {IconBuilding} from "@tabler/icons-react";

export const OrganisationSwitcher = () => {
    const { data: organisations } = useSuspenseQuery(organisationQueries.listMine());
    const [selectedOrganisation, setSelectedOrganisation] = useState(organisations[0]?.id || "");

    if (!organisations || organisations.length === 0) {
        return null;
    }

    return (
        <Select value={selectedOrganisation} onValueChange={setSelectedOrganisation}>
            <SelectTrigger className="w-full !justify-start">
                <IconBuilding className="size-5 shrink-0" />
                <SelectValue placeholder="Organizasyon Seçin" className="text-base font-semibold" />
            </SelectTrigger>
            <SelectContent>
                {organisations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                        {org.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
