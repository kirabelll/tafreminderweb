"use client";

import { useState } from "react";
import { Card } from "./ui/card";

interface DriverLicenseData {
  licensePlate: string;
  issueDate: string;
  expireDate: string;
}

export default function DriverLicenseForm() {
  const [formData, setFormData] = useState<DriverLicenseData>({
    licensePlate: "",
    issueDate: "",
    expireDate: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Driver License Data:", formData);
    // Handle form submission here
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">Driver License Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="licensePlate" className="block text-sm font-medium mb-2">
            License Plate Number
          </label>
          <input
            type="text"
            id="licensePlate"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="Enter license plate number"
            required
          />
        </div>

        <div>
          <label htmlFor="issueDate" className="block text-sm font-medium mb-2">
            Issue Date
          </label>
          <input
            type="date"
            id="issueDate"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="expireDate" className="block text-sm font-medium mb-2">
            Expire Date
          </label>
          <input
            type="date"
            id="expireDate"
            name="expireDate"
            value={formData.expireDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors font-medium"
        >
          Submit
        </button>
      </form>
    </Card>
  );
}