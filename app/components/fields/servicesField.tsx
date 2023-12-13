import type { ServiceOffering, ClinicalService } from "@prisma/client/edge";
import type { WithSerializedTypes } from "~/utils/client";
import RelationshipField from "../relationshipField";

type Type = WithSerializedTypes<ServiceOffering & { service: ClinicalService }>;

export default function ServicesField(p: {
  name: string;
  label?: string;
  helperText?: string;
  options: Type[];
}) {
  return (
    <RelationshipField
      {...p}
      options={p.options.map((d) => ({
        id: d.id,
        name: d.service.name,
      }))}
    />
  );
}
