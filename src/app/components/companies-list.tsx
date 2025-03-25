"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { type Company } from "@prisma/client";

export default function CompaniesList() {
  // const utils = api.useUtils();
  const queryResult = api.companies.getAll.useQuery();

  if (queryResult.isLoading) {
    return <div>Loading...</div>;
  }

  if (queryResult.isError) {
    return <div>Error loading rates</div>;
  }
  const entries: Company[] = queryResult.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Companies added</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between">
              {/* Date display */}
              <span>{entry.name}</span>

              {/* Time display */}
              <span>{entry.address}</span>
              <span>{entry.phone}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
