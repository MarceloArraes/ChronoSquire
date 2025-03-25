// CompanyForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export default function CompanyForm() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const utils = api.useUtils();

  const { mutate: createCompany } = api.companies.create.useMutation({
    onSuccess: () => {
      toast.success("Company created successfully!", {
        position: "top-center",
        duration: 3000,
      });
      setName("");
      setAddress("");
      setPhone("");
      void utils.companies.invalidate();
    },
    onError: () => {
      toast.error("Failed to create company", {
        position: "top-center",
        duration: 5000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a company name");
      return;
    }

    createCompany({
      name,
      address: address.trim() || undefined,
      phone: phone.trim() || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 md:grid-cols-1 lg:grid-cols-4"
    >
      {/* Company Name */}
      <div className="space-y-2 lg:col-span-2">
        <Label htmlFor="company-name" className="text-gray-600">
          Name
        </Label>
        <Input
          id="company-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-12 text-lg"
        />
      </div>

      {/* Company Address */}
      <div className="space-y-2">
        <Label htmlFor="company-address" className="text-gray-600">
          Address
        </Label>
        <Input
          id="company-address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="h-12 text-lg"
        />
      </div>

      {/* Company Phone */}
      <div className="space-y-2">
        <Label htmlFor="company-phone" className="text-gray-600">
          Phone
        </Label>
        <Input
          id="company-phone"
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-12 text-lg"
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-end">
        <Button
          type="submit"
          className="h-12 w-full bg-primary text-lg font-semibold hover:bg-primary/90"
        >
          Create Company
        </Button>
      </div>
    </form>
  );
}
