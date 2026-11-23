import "dotenv/config";
import { PrismaClient, Role, EnrollmentStatus, AttendanceStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Clean existing records in reverse dependency order
  console.log("🧹 Cleaning existing data...");
  await prisma.attendance.deleteMany();
  await prisma.lecture.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.class.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash("Password@123", 10);

  // 2. Create 3 Users (1 Admin, 1 Staff, 1 Teacher)
  console.log("👤 Creating users (Admin, Staff, Teacher)...");

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@attendance.center",
      passwordHash: defaultPasswordHash,
      phone: "+201000000001",
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "Staff Member",
      email: "staff@attendance.center",
      passwordHash: defaultPasswordHash,
      phone: "+201000000002",
      role: Role.STAFF,
      isActive: true,
    },
  });

  const teacher = await prisma.user.create({
    data: {
      name: "Dr. Tarek Teacher",
      email: "teacher@attendance.center",
      passwordHash: defaultPasswordHash,
      phone: "+201000000003",
      role: Role.TEACHER,
      isActive: true,
    },
  });

  console.log(` Created 3 users: Admin (${admin.email}), Staff (${staff.email}), Teacher (${teacher.email})`);

  // 3. Create 2 Classes assigned to Teacher
  console.log("🏫 Creating classes...");

  const mathClass = await prisma.class.create({
    data: {
      name: "Mathematics - Grade 10",
      description: "Advanced Algebra, Trigonometry, and Geometry preparatory course.",
      room: "Room 101",
      teacherId: teacher.id,
      isActive: true,
    },
  });

  const physicsClass = await prisma.class.create({
    data: {
      name: "Physics - Grade 11",
      description: "Classical Mechanics, Optics, and Modern Physics laboratory sessions.",
      room: "Lab 204",
      teacherId: teacher.id,
      isActive: true,
    },
  });

  console.log(` Created 2 classes: "${mathClass.name}" and "${physicsClass.name}"`);

  // 4. Create 5 Students
  console.log("🎒 Creating 5 students...");

  const studentsData = [
    {
      fullName: "Omar Youssef",
      phone: "+201111222333",
      parentName: "Youssef Ibrahim",
      parentPhone: "+201011112222",
      notes: "Excels in algebra; prefers front-row seating.",
      isActive: true,
    },
    {
      fullName: "Salma Khaled",
      phone: "+201122334455",
      parentName: "Khaled Mostafa",
      parentPhone: "+201033334444",
      notes: "Enrolled in scientific track.",
      isActive: true,
    },
    {
      fullName: "Karim Ahmed",
      phone: "+201144556677",
      parentName: "Ahmed Hassan",
      parentPhone: "+201055556666",
      notes: "Transferred from another center.",
      isActive: true,
    },
    {
      fullName: "Layla Mahmoud",
      phone: "+201166778899",
      parentName: "Mahmoud Ali",
      parentPhone: "+201077778888",
      notes: "Honor student; physics olympiad candidate.",
      isActive: true,
    },
    {
      fullName: "Youssef Nabil",
      phone: "+201188990011",
      parentName: "Nabil Farouk",
      parentPhone: "+201099990000",
      notes: "Evening class preference.",
      isActive: true,
    },
  ];

  const students = await Promise.all(
    studentsData.map((student) => prisma.student.create({ data: student }))
  );

  console.log(` Created ${students.length} students.`);

  // 5. Enroll Students into Classes
  console.log("📝 Enrolling students into classes...");

  await prisma.enrollment.createMany({
    data: [
      { studentId: students[0].id, classId: mathClass.id, status: EnrollmentStatus.ACTIVE },
      { studentId: students[1].id, classId: mathClass.id, status: EnrollmentStatus.ACTIVE },
      { studentId: students[2].id, classId: mathClass.id, status: EnrollmentStatus.ACTIVE },
      { studentId: students[1].id, classId: physicsClass.id, status: EnrollmentStatus.ACTIVE },
      { studentId: students[2].id, classId: physicsClass.id, status: EnrollmentStatus.ACTIVE },
      { studentId: students[3].id, classId: physicsClass.id, status: EnrollmentStatus.ACTIVE },
      { studentId: students[4].id, classId: physicsClass.id, status: EnrollmentStatus.ACTIVE },
    ],
  });

  console.log(" Enrolled students into respective classes.");

  // 6. Create Lectures with Start Time & Attendance
  console.log("📅 Creating initial lectures with attendance...");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mathLecture = await prisma.lecture.create({
    data: {
      classId: mathClass.id,
      date: today,
      startTime: "16:00",
      notes: "Algebra: Quadratic Equations and Applications",
      createdById: admin.id,
      attendances: {
        create: [
          {
            studentId: students[0].id,
            status: AttendanceStatus.PRESENT,
            markedById: teacher.id,
          },
          {
            studentId: students[1].id,
            status: AttendanceStatus.PRESENT,
            markedById: teacher.id,
          },
          {
            studentId: students[2].id,
            status: AttendanceStatus.ABSENT,
            note: "Excused absence - medical appointment",
            markedById: teacher.id,
          },
        ],
      },
    },
  });

  console.log(` Created lecture for "${mathClass.name}" at 16:00 with initial attendance.`);
  console.log(" Seeding completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
