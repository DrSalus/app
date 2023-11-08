import { isEmpty } from "lodash-es";

export function getUploadUrl(path: string, defaultValue?: string) {
  const val = (isEmpty(path) ? defaultValue : path) ?? "";
  if (!val.startsWith("http")) {
    return `https://${val}`;
  } else {
    return val;
  }
}
