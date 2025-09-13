import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// Get all grade categories for a subject, optionally filtered by classId
export const getGradeCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subjectId } = req.params;
    const { classId } = req.query;
    const where: any = { subjectId };
    if (classId) where.classId = classId;
    const categories = await prisma.gradeCategory.findMany({ where });
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

// List all grades from the Grade table
export const listGrades = async (req, res) => {
  try {
    const grades = await prisma.grade.findMany();
    res.json(grades);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
};

export const createGradeCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, weight, classId, subjectId } = req.body;
    if (!name || !weight || !classId || !subjectId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const category = await prisma.gradeCategory.create({
      data: {
        name,
        weight: Number(weight),
        classId,
        subjectId,
      },
    });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};


export const getStudentGrades = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId, subjectId } = req.params;
    const { categoryId, semesterId } = req.query;
    const where: any = {
      studentId,
      subjectId,
    };
    if (categoryId) where.categoryId = categoryId;
    if (semesterId) where.semesterId = semesterId;
    const grades = await prisma.gradeEntry.findMany({
      where,
      include: {
        category: true,
        semester: true,
      },
    });
    res.json(grades);
  } catch (err) {
    next(err);
  }
};

// Get all grades for a class, subject, and category (for teacher view)
// export const getClassGrades = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
// Get all grade levels with their sections
export const getGradeLevelsWithSections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Fetch all grades and their sections via classes
    const grades = await prisma.grade.findMany({
      include: {
        classes: {
          include: {
            section: true
          }
        }
      }
    });
    // Format: [{ id, name, sections: [{ id, name }] }]
    const result = grades.map(g => ({
      id: g.id,
      name: g.name,
      sections: g.classes.map(cls => cls.section ? { id: cls.section.id, name: cls.section.name } : null).filter(Boolean)
    }));
    res.json(result);
  } catch (err) {
    next(err);
  }
};
//   try {
//     const { classId, subjectId, categoryId, semesterId, academicYearId } = req.query;
//     const where: any = {};
//     if (classId) where.classId = classId;
//     if (subjectId) where.subjectId = subjectId;
//     if (categoryId) where.categoryId = categoryId;
//     if (semesterId) where.semesterId = semesterId;
//     if (academicYearId) where.academicYearId = academicYearId;
//     console.log('getClassGrades query:', where);
//     const grades = await prisma.gradeEntry.findMany({
//       where,
//       include: {
//         student: true,
//         category: true,
//         semester: true,
//         class: true,
//       },
//     });
//     console.log('getClassGrades result:', grades);
//     if (!grades || grades.length === 0) {
//       console.warn('No grades found for query:', where);
//     }
//     res.json(grades);
//     return;
//   } catch (err) {
//     console.error('getClassGrades error:', err);
//     next(err);
//     return;
//   }
// };




// export const getClassGrades = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const { classId, subjectId, categoryId, semesterId, academicYearId } = req.query;
//     if (!classId || !subjectId) {
//       res.status(400).json({ error: 'classId and subjectId are required' });
//       return;
//     }
//     const where: any = {
//       classId: String(classId),
//       subjectId: String(subjectId),
//     };
//     if (categoryId) where.categoryId = String(categoryId);
//     if (semesterId) where.semesterId = String(semesterId);
//     if (academicYearId) where.academicYearId = String(academicYearId);
//     console.log('getClassGrades query:', where);
//     const grades = await prisma.gradeEntry.findMany({
//       where,
//       include: {
//         student: { select: { id: true, firstName: true, lastName: true } },
//         category: { select: { id: true, name: true, weight: true } },
//         semester: { select: { id: true, name: true } },
//         class: { select: { id: true, grade: { select: { name: true } }, section: { select: { name: true } } } },
//       },
//     });
//     console.log('getClassGrades result:', grades);
//     res.json(grades);
//   } catch (err) {
//     console.error('getClassGrades error:', err);
//     res.status(500).json({ error: 'Failed to fetch grades' });
//     next(err);
//   }
// };





// export const getClassGrades = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const { classId, subjectId, categoryId, semesterId, academicYearId } = req.query;
//     if (!classId || !subjectId) {
//       res.status(400).json({ error: 'classId and subjectId are required' });
//       return;
//     }
//     const where: any = {
//       classId: String(classId),
//       subjectId: String(subjectId),
//     };
//     if (categoryId) where.categoryId = String(categoryId);
//     if (semesterId) where.semesterId = String(semesterId);
//     if (academicYearId) where.academicYearId = String(academicYearId);
//     console.log('getClassGrades query:', where);
//     const grades = await prisma.gradeEntry.findMany({
//       where,
//       include: {
//         student: { select: { id: true, firstName: true, lastName: true } },
//         subject: { select: { id: true, name: true } },
//         category: { select: { id: true, name: true, weight: true } },
//         semester: { select: { id: true, name: true } },
//         class: { select: { id: true, grade: { select: { name: true } }, section: { select: { name: true } } } },
//       },
//     });
//     console.log('getClassGrades result:', grades);
//     res.json(grades.map((g) => ({
//       id: g.id,
//       studentId: g.studentId,
//       studentName: `${g.student.firstName} ${g.student.lastName}`,
//       subjectId: g.subjectId,
//       subjectName: g.subject.name,
//       examType: g.category.name,
//       score: g.pointsEarned,
//       maxScore: g.totalPoints,
//       percentage: g.totalPoints > 0 ? (g.pointsEarned / g.totalPoints) * 100 : 0,
//       grade: getLetterGrade((g.pointsEarned / g.totalPoints) * 100),
//       date: g.date ? new Date(g.date).toLocaleDateString() : '',
//       semester: g.semester?.name || '',
//       remarks: g.remarks || '',
//     })));
//   } catch (err) {
//     console.error('getClassGrades error:', err);
//     res.status(500).json({ error: 'Failed to fetch grades' });
//     next(err);
//   }
// };

// const getLetterGrade = (percentage: number): string => {
//   if (percentage >= 90) return 'A';
//   if (percentage >= 85) return 'A-';
//   if (percentage >= 80) return 'B+';
//   if (percentage >= 75) return 'B';
//   if (percentage >= 70) return 'B-';
//   if (percentage >= 65) return 'C+';
//   if (percentage >= 60) return 'C';
//   if (percentage >= 55) return 'C-';
//   if (percentage >= 50) return 'D';
//   return 'F';
// };





// export const getClassGrades = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const { classId, subjectId, categoryId, semesterId, academicYearId } = req.query;
//     if (!classId || !subjectId) {
//       res.status(400).json({ error: 'classId and subjectId are required' });
//       return;
//     }
//     const where: any = {
//       classId: String(classId),
//       subjectId: String(subjectId),
//     };
//     if (categoryId) where.categoryId = String(categoryId);
//     if (semesterId) where.semesterId = String(semesterId);
//     if (academicYearId) where.academicYearId = String(academicYearId);
//     console.log('getClassGrades query:', where);
//     const grades = await prisma.gradeEntry.findMany({
//       where,
//       include: {
//         student: { select: { id: true, firstName: true, lastName: true } },
//         subject: { select: { id: true, name: true } },
//         category: { select: { id: true, name: true, weight: true } },
//         semester: { select: { id: true, name: true } },
//         class: { select: { id: true, grade: { select: { name: true } }, section: { select: { name: true } } } },
//       },
//     });
//     console.log('getClassGrades result:', grades);
//     res.json(grades.map((g) => ({
//       id: g.id,
//       studentId: g.studentId,
//       studentName: `${g.student.firstName} ${g.student.lastName}`,
//       subjectId: g.subjectId,
//       subjectName: g.subject.name,
//       examType: g.category.name,
//       score: g.pointsEarned,
//       maxScore: g.totalPoints,
//       percentage: g.totalPoints > 0 ? (g.pointsEarned / g.totalPoints) * 100 : 0,
//       grade: getLetterGrade(g.totalPoints > 0 ? (g.pointsEarned / g.totalPoints) * 100 : 0),
//       date: g.date ? new Date(g.date).toLocaleDateString() : '',
//       semester: g.semester?.name || '',
//       remarks: g.remarks || '',
//     })));
//   } catch (err) {
//     console.error('getClassGrades error:', err);
//     res.status(500).json({ error: 'Failed to fetch grades' });
//     next(err);
//   }
// };

// const getLetterGrade = (percentage: number): string => {
//   if (percentage >= 90) return 'A';
//   if (percentage >= 85) return 'A-';
//   if (percentage >= 80) return 'B+';
//   if (percentage >= 75) return 'B';
//   if (percentage >= 70) return 'B-';
//   if (percentage >= 65) return 'C+';
//   if (percentage >= 60) return 'C';
//   if (percentage >= 55) return 'C-';
//   if (percentage >= 50) return 'D';
//   return 'F';
// };



// controllers/gradeController.ts
// import { Request, Response, NextFunction } from 'express';
// import { prisma } from '../prisma'; // Adjust path to Prisma client

export const getClassGrades = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { classId, subjectId, categoryId, semesterId, academicYearId } = req.query;
    
    // Validate required parameters
    if (!classId || !subjectId) {
      res.status(400).json({ error: 'classId and subjectId are required' });
      return;
    }

    // Build the where clause
    const where: any = {
      classId: String(classId),
      subjectId: String(subjectId),
    };

    // Add optional filters
    if (categoryId) where.categoryId = String(categoryId);
    if (semesterId) where.semesterId = String(semesterId);
    if (academicYearId) where.academicYearId = String(academicYearId);

    console.log('Final where clause:', where);

    // Fetch grades with related data
    const grades = await prisma.gradeEntry.findMany({
      where,
      include: {
        student: { 
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            email: true 
          } 
        },
        subject: { 
          select: { 
            id: true, 
            name: true 
          } 
        },
        category: { 
          select: { 
            id: true, 
            name: true, 
            weight: true 
          } 
        },
        semester: { 
          select: { 
            id: true, 
            name: true 
          } 
        },
        class: { 
          select: { 
            id: true, 
            academicYearId: true,
            grade: { 
              select: { 
                name: true 
              } 
            }, 
            section: { 
              select: { 
                name: true 
              } 
            } 
          } 
        },
      },
      orderBy: {
        student: {
          firstName: 'asc'
        }
      }
    });

    // Transform the data for the frontend
    const transformedGrades = grades.map((g) => ({
      id: g.id,
      studentId: g.student.id,
      studentName: `${g.student.firstName} ${g.student.lastName}`,
      studentEmail: g.student.email,
      subjectId: g.subject.id,
      subjectName: g.subject.name,
      examType: g.category.name,
      score: g.pointsEarned,
      maxScore: g.totalPoints,
      percentage: g.totalPoints > 0 ? (g.pointsEarned / g.totalPoints) * 100 : 0,
      grade: getLetterGrade(g.totalPoints > 0 ? (g.pointsEarned / g.totalPoints) * 100 : 0),
      date: g.date ? new Date(g.date).toISOString() : '',
      semester: g.semester?.name || '',
      className: `${g.class.grade.name} ${g.class.section.name}`,
      academicYearId: g.class.academicYearId,
    }));

    res.json(transformedGrades);
  } catch (err) {
    console.error('Error in getClassGrades:', err);
    res.status(500).json({ error: 'Failed to fetch grades' });
    next(err);
  }
};






// export const getGrades = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const grades = await prisma.gradeEntry.findMany({
//       include: {
//         student: { select: { id: true, firstName: true, lastName: true, email: true } },
//         subject: { select: { id: true, name: true } },
//         category: { select: { id: true, name: true, weight: true } },
//         semester: { select: { id: true, name: true } },
//         class: { select: { id: true, grade: { select: { name: true } }, section: { select: { name: true } } } },
//       },
//     });
//     console.log('getGrades result:', grades);
//     res.json(grades.map((g) => ({
//       id: g.id,
//       studentId: g.studentId,
//       studentName: `${g.student.firstName} ${g.student.lastName}`,
//       studentEmail: g.student.email,
//       subjectId: g.subjectId,
//       subjectName: g.subject.name,
//       examType: g.category.name,
//       score: g.pointsEarned,
//       maxScore: g.totalPoints,
//       percentage: g.totalPoints > 0 ? (g.pointsEarned / g.totalPoints) * 100 : 0,
//       grade: getLetterGrade(g.totalPoints > 0 ? (g.pointsEarned / g.totalPoints) * 100 : 0),
//       date: g.date ? new Date(g.date).toLocaleDateString() : '',
//       semester: g.semester?.name || '',
//       // remarks: g.remarks || '',
//       className: g.class && g.class.grade && g.class.section ? `${g.class.grade.name} ${g.class.section.name}` : '',
//       class: g.class ? {
//         id: g.class.id,
//         grade: g.class.grade ? { name: g.class.grade.name } : null,
//         section: g.class.section ? { name: g.class.section.name } : null,
//       } : null,
//     })));
//   } catch (err) {
//     console.error('getGrades error:', err);
//     res.status(500).json({ error: 'Failed to fetch grades' });
//     next(err);
//   }
// };





// List all grades (raw, for admin/debug)
// ...existing code...

// Add a grade entry
// export const addGradeEntry = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { studentId, subjectId, categoryId, classId, academicYearId, pointsEarned, totalPoints, date, semesterId, createdBy } = req.body;
//     if (!studentId || !subjectId || !categoryId || !classId || !academicYearId || pointsEarned == null || totalPoints == null || !date || !semesterId || !createdBy) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }
//     const entry = await prisma.gradeEntry.create({
//       data: {
//         studentId,
//         subjectId,
//         categoryId,
//         classId,
//         academicYearId,
//         pointsEarned: Number(pointsEarned),
//         totalPoints: Number(totalPoints),
//         date: new Date(date),
//         semesterId,
//         createdById: createdBy,
//       },
//     });
//     res.status(201).json(entry);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to add grade entry' });
//     next(err);
//   }
// };




const getLetterGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A';
  if (percentage >= 85) return 'A-';
  if (percentage >= 80) return 'B+';
  if (percentage >= 75) return 'B';
  if (percentage >= 70) return 'B-';
  if (percentage >= 65) return 'C+';
  if (percentage >= 60) return 'C';
  if (percentage >= 55) return 'C-';
  if (percentage >= 50) return 'D';
  return 'F';
};





export const addGradeEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('addGradeEntry received:', req.body);
    const { studentId, subjectId, categoryId, classId, pointsEarned, totalPoints, date, semesterId, academicYearId, createdBy } = req.body;
    if (
      !studentId ||
      !subjectId ||
      !categoryId ||
      !classId ||
      pointsEarned === undefined || pointsEarned === null ||
      totalPoints === undefined || totalPoints === null ||
      !date ||
      !semesterId ||
      !academicYearId ||
      !createdBy
    ) {
      console.warn('addGradeEntry missing fields:', req.body);
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Optionally, validate that semesterId belongs to academicYearId
    const entry = await prisma.gradeEntry.create({
      data: {
        studentId,
        subjectId,
        categoryId,
        classId,
        academicYearId, // new direct field
        pointsEarned: Number(pointsEarned),
        totalPoints: Number(totalPoints),
        date: new Date(date),
        semesterId,
        createdById: createdBy,
      },
    });
    console.log('addGradeEntry created:', entry);
    res.status(201).json(entry);
  } catch (err) {
    console.error('addGradeEntry error:', err);
    next(err);
  }
};


// Update a grade entry
export const updateGrade = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { pointsEarned, totalPoints } = req.body;
  
  try {
    const entry = await prisma.gradeEntry.update({
      where: { id },
      data: {
        ...(pointsEarned !== undefined && { pointsEarned: Number(pointsEarned) }),
        ...(totalPoints !== undefined && { totalPoints: Number(totalPoints) }),
      },
    });
    res.json(entry);
  } catch (e) {
    res.status(404).json({ error: 'Grade entry not found' });
    next(e);
  }
};

// Delete a grade entry
export const deleteGrade = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    await prisma.gradeEntry.delete({ where: { id } });
    res.status(204).end();
  } catch (e) {
    res.status(404).json({ error: 'Grade entry not found' });
    next(e);
  }
};

// Get grade statistics (e.g., average, highest, lowest) for a class, subject, or student
export const getGradeStatistics = async (req: Request, res: Response, next: NextFunction) => {
  const { classId, subjectId, studentId, semesterId } = req.query;
  try {
    const where: any = {};
    if (classId) where.classId = Number(classId);
    if (subjectId) where.subjectId = Number(subjectId);
    if (studentId) where.studentId = Number(studentId);
    if (semesterId) where.semesterId = Number(semesterId);

    const grades = await prisma.gradeEntry.findMany({ where });
    if (!grades.length) {
      return res.json({ count: 0, average: null, highest: null, lowest: null });
    }
    const points = grades.map((g: any) => g.pointsEarned / g.totalPoints);
    const average = points.reduce((a: number, b: number) => a + b, 0) / points.length;
    const highest = Math.max(...points);
    const lowest = Math.min(...points);
    res.json({ count: grades.length, average, highest, lowest });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute grade statistics' });
    next(err);
  }
};


export const listAllGrades = async (req: Request, res: Response) => {
  try {
    const grades = await prisma.gradeEntry.findMany({
      include: {
        student: true,
        subject: true,
        category: true,
        semester: true,
        class: {
          include: {
            academicYear: true,
          },
        },
      },
    });
    res.json(grades);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
};
