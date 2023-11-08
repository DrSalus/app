import { Course, PermissionAction, User } from "@prisma/client";
import { db } from "./db.server";

async function getPermissionUserCourse(
  user: Pick<User, "id">,
  course: Pick<Course, "id">
) {
  const res = await db.user.findUnique({
    where: { id: user.id },
    select: { permission: { where: { courseId: course.id } } },
  });

  return res?.permission ?? [];
}

async function getVisibleCourse(user: Pick<User, "id">, take?: number) {
  const res = await db.user.findUnique({
    where: { id: user.id },
    select: {
      permission: {
        take: take ?? undefined,
        where: {
          OR: [{ action: "VIEW" }, { action: "ENROLL" }, { action: "MANAGE" }],
        },
      },
    },
  });

  return res?.permission ?? [];
}

export async function getCoursePermissions(
  userId: string,
  companyId: string | null
) {
  return db.permission.findMany({
    where: {
      OR: [{ userId }, { companyId }],
    },
  });
}

async function getEnrolledCourse(user: Pick<User, "id">, take?: number) {
  const res = await db.user.findUnique({
    where: { id: user.id },
    select: {
      enrollments: {
        take: take ?? undefined,
      },
    },
  });

  return res?.enrollments ?? [];
}

export { getPermissionUserCourse, getVisibleCourse, getEnrolledCourse };
