import React, { useState } from "react";
import { api } from '@/lib/api';

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

export const BulkUserUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/users/import-students", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err: any) {
      setResult({ error: err.response?.data?.error || "Upload failed" });
    }
    setLoading(false);
  };

  return (
    <Form>
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block"
            required
          />
          <a
            href="/bulk_user_template.csv"
            download
            className="text-blue-600 underline text-sm"
            style={{ marginLeft: 8 }}
          >
            Download sample CSV
          </a>
        </div>
        <Button type="submit" disabled={loading || !file}>
          {loading ? "Uploading..." : "Upload CSV"}
        </Button>
        {result && (
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mt-2">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </form>
    </Form>
  );
};