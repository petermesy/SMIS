import { PrismaClient, Role, Status } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started');
  // Passwords
  const adminPass = await bcrypt.hash('admin123', 10);
  // const teacherPass = await bcrypt.hash('teacher123', 10);
  // const studentPass = await bcrypt.hash('student123', 10);
  const parentPass = await bcrypt.hash('parent123', 10);

  // Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: {
      email: 'admin@school.com',
      passwordHash: adminPass,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      status: Status.ACTIVE,
    },
  });
  // const teacher = await prisma.user.upsert({
  //   where: { email: 'teacher@school.com' },
  //   update: {},
  //   create: {
  //     email: 'teacher@school.com',
  //     passwordHash: teacherPass,
  //     firstName: 'John',
  //     lastName: 'Doe',
  //     role: Role.TEACHER,
  //     status: Status.ACTIVE,
  //   },
  // });
  // const student = await prisma.user.upsert({
  //   where: { email: 'student@school.com' },
  //   update: {},
  //   create: {
  //     email: 'student@school.com',
  //     passwordHash: studentPass,
  //     firstName: 'Jane',
  //     lastName: 'Smith',
  //     role: Role.STUDENT,
  //     status: Status.ACTIVE,
  //   },
  // });
  const parent = await prisma.user.upsert({
    where: { email: 'parent@school.com' },
    update: {},
    create: {
      email: 'parent@school.com',
      passwordHash: parentPass,
      firstName: 'Parent',
      lastName: 'Smith',
      role: Role.PARENT,
      status: Status.ACTIVE,
    },
  });

  // // Academic Year & Semesters
  // const academicYear = await prisma.academicYear.create({
  //   data: {
  //     name: '2024-2025',
  //     startDate: new Date('2024-09-01'),
  //     endDate: new Date('2025-07-31'), // Extended to cover July 2025
  //     isCurrent: true,
  //     createdBy: admin.id,
  //     semesters: {
  //       create: [
  //         {
  //           name: 'Fall 2024',
  //           startDate: new Date('2024-09-01'),
  //           endDate: new Date('2024-12-31'),
  //           isCurrent: true,
  //         },
  //         {
  //           name: 'Spring 2025',
  //           startDate: new Date('2025-01-15'),
  //           endDate: new Date('2025-07-31'), // Extended to cover July 2025
  //           isCurrent: false,
  //         },
  //       ],
  //     },
  //   },
  //   include: { semesters: true },
  // });

  // Grades 1-8 with section 'A'
  for (let level = 1; level <= 8; level++) {
    // Check if grade already exists
    const existing = await prisma.grade.findFirst({ where: { level } });
    if (!existing) {
      await prisma.grade.create({
        data: {
          name: `Grade ${level}`,
          level,
          sections: {
            create: [{ name: 'A' }],
          },
        },
        include: { sections: true },
      });
      console.log(`Seeded Grade ${level} with section A`);
    } else {
      console.log(`Grade ${level} already exists, skipping.`);
    }
  }

  // // Subjects
  // const math = await prisma.subject.upsert({
  //   where: { code: 'MATH' },
  //   update: {},
  //   create: {
  //     name: 'Mathematics',
  //     code: 'MATH',
  //     description: 'Mathematics',
  //     gradeId: grade10.id,
  //   },
  // });
  // const physics = await prisma.subject.upsert({
  //   where: { code: 'PHYS' },
  //   update: {},
  //   create: {
  //     name: 'Physics',
  //     code: 'PHYS',
  //     description: 'Physics',
  //     gradeId: grade10.id,
  //   },
  // });
  // const chemistry = await prisma.subject.upsert({
  //   where: { code: 'CHEM' },
  //   update: {},
  //   create: {
  //     name: 'Chemistry',
  //     code: 'CHEM',
  //     description: 'Chemistry',
  //     gradeId: grade11.id,
  //   },
  // });
  // const english = await prisma.subject.upsert({
  //   where: { code: 'ENG' },
  //   update: {},
  //   create: {
  //     name: 'English',
  //     code: 'ENG',
  //     description: 'English',
  //     gradeId: grade11.id,
  //   },
  // });

  // // Classes
  // const class10A = await prisma.class.create({
  //   data: {
  //     gradeId: grade10.id,
  //     sectionId: grade10.sections[0].id,
  //     academicYearId: academicYear.id,
  //   },
  // });
  // const class11B = await prisma.class.create({
  //   data: {
  //     gradeId: grade11.id,
  //     sectionId: grade11.sections[0].id,
  //     academicYearId: academicYear.id,
  //   },
  // });

  // // Teacher Assignments
  // await prisma.teacherSubject.create({
  //   data: {
  //     teacherId: teacher.id,
  //     subjectId: math.id,
  //     classId: class10A.id,
  //     academicYearId: academicYear.id,
  //   },
  // });

  // // Student Enrollment
  // await prisma.studentEnrollment.create({
  //   data: {
  //     studentId: student.id,
  //     classId: class10A.id,
  //     academicYearId: academicYear.id,
  //   },
  // });
  console.log('Seeding finished');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
