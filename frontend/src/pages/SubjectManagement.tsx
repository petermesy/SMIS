import React, { useEffect, useState } from "react";
import { AddSubjectForm } from "./AddSubjectForm";
import { getGrades, getSubjects } from ".././lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Edit, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api"; // adjust import if needed

export const SubjectManagement: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [gradeOptions, setGradeOptions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await api.get('/grades/levels');
        setGradeOptions(res.data.map((g: any) => ({ id: g.id, name: g.name })));
      } catch (e) {
        setGradeOptions([]);
      }
    };
    fetchGrades();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const subjects = await getSubjects();
    setSubjects(subjects);
  };

  // Dummy handlers for edit/delete (replace with your logic)
  const handleEdit = (subject: any) => {
    toast("Edit subject: " + subject.name);
  };
  const handleDelete = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
    toast.success("Subject deleted");
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Subject Management</h2>
      <AddSubjectForm
        grades={gradeOptions}
        onSuccess={fetchSubjects}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{subject.name}</span>
                </div>
                <Badge>{subject.code}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Grade:</strong>{" "}
                  {subject.gradeId
                    ? gradeOptions.find((g) => g.id === subject.gradeId)?.name
                    : "N/A"}
                </p>
                <p className="text-sm text-gray-600">{subject.description}</p>
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(subject)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(subject.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
