import { createGradeCategory } from '../src/controllers/gradeController';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client');

const mockJson = jest.fn();
const mockStatus = jest.fn(() => ({ json: mockJson }));
const mockRes = { status: mockStatus, json: mockJson };
const mockNext = jest.fn();

const prismaMock = {
  gradeCategory: {
    create: jest.fn(),
  },
};

(PrismaClient as any).mockImplementation(() => prismaMock);

describe('createGradeCategory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if required fields are missing', async () => {
    const req = { body: { name: '', weight: 1, classId: 1, subjectId: null } } as any;
    await createGradeCategory(req, mockRes as any, mockNext);
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Missing required fields' });
  });

  it('should create and return a new grade category', async () => {
    const req = { body: { name: 'Quiz', weight: 10, classId: 1, subjectId: 2 } } as any;
    const fakeCategory = { id: 1, ...req.body };
    prismaMock.gradeCategory.create.mockResolvedValue(fakeCategory);
    await createGradeCategory(req, mockRes as any, mockNext);
    expect(prismaMock.gradeCategory.create).toHaveBeenCalledWith({ data: req.body });
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith(fakeCategory);
  });
});
