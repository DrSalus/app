import type { DoctorSpecialty } from "@prisma/client";
import { compact, isEmpty } from "lodash-es";
import type { WithSerializedTypes } from "./client";

export function getDisplayName(
  p: { firstName?: string; lastName?: string } | null
) {
  return compact([p?.firstName, p?.lastName]).join(" ");
}

export function getSpecializations(
  p: { specialities?: WithSerializedTypes<DoctorSpecialty>[] } | null
) {
  const specialities = p?.specialities?.map((d) => d.name).join(", ") ?? "";
  if (!isEmpty(specialities)) {
    return `Specialista in ${specialities}`;
  }
  return "";
}
