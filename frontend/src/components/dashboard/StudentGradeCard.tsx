import React from 'react';

export interface StudentGradeCardProps {
  grades: Array<{
    id: string;
    student: { id: string; firstName: string; lastName: string };
    subject: { id: string; name: string };
    class: { id: string; grade: { name: string }; section: { name: string } };
    academicYear: { id: string; name: string };
    semester: { id: string; name: string };
    category: { id: string; name: string };
    pointsEarned: number;
    totalPoints: number;
    date: string;
  }>;
}


const StudentGradeCard: React.FC<StudentGradeCardProps> = ({ grades }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mt-4 border border-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Student Grades</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Student</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Subject</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Class</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Academic Year</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Semester</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Category</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Points</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {grades.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-400">No grades found.</td>
              </tr>
            ) : (
              grades.map((grade) => (
                <tr key={grade.id} className="hover:bg-blue-50 transition">
                  <td className="px-4 py-2 whitespace-nowrap font-medium">{grade.student.firstName} {grade.student.lastName}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{grade.subject.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{grade.class.grade.name} {grade.class.section.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{grade.academicYear.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{grade.semester.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{grade.category.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{grade.pointsEarned} / {grade.totalPoints}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(grade.date).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentGradeCard;
