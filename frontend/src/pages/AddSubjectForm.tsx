import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../components/ui/select";
import { createSubject } from "../lib/api";
import { api } from "../lib/api";
interface AddSubjectFormProps {
  grades: { id: string; name: string }[];
  onSuccess?: () => void;
}

interface SubjectFormValues {
  name: string;
  code: string;
  gradeId: string;
}

export const AddSubjectForm: React.FC<AddSubjectFormProps> = ({ grades, onSuccess }) => {
  const form = useForm<SubjectFormValues>({
    defaultValues: { name: "", code: "", gradeId: "" },
  });

  const onSubmit: SubmitHandler<SubjectFormValues> = async (data) => {
    await createSubject(data);
    form.reset();
    if (onSuccess) onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter subject name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter subject code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gradeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grade</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Add Subject</Button>
      </form>
    </Form>
  );
};