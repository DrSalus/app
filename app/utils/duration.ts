import { UserSession } from "@prisma/client";
import { DateTime, Duration, DurationUnit } from "luxon";
import JSZip from "jszip";
import { isEmpty, isNaN } from "lodash-es";

export function getFormattedDuration(
  seconds?: number,
  units: DurationUnit[] = ["minutes", "seconds"],
  unitDisplay: "short" | "long" | "narrow" = "narrow"
): string {
  // return `${seconds}`;
  return Duration.fromObject({ seconds: seconds ?? 60 })
    .shiftTo(...units)
    .toHuman({
      unitDisplay: unitDisplay,
      listStyle: "narrow",
      maximumFractionDigits: 0,
      // maximumSignificantDigits: 1,
    });
}

export function getVideoDuration(
  file: File | undefined,
  onChangeDuration: (duration: number) => void
) {
  if (file == null) {
    return;
  }
  let video = document.createElement("video");
  video.preload = "metadata";
  video.onloadedmetadata = () => {
    window.URL.revokeObjectURL(video.src);
    onChangeDuration(video.duration);
  };
  video.src = URL.createObjectURL(file);
}
export async function getScormDuration(
  file: File | undefined,
  onChangeDuration: (duration: number) => void,
  onChangeIndexPath: (indexPath: string) => void
) {
  if (file == null) {
    return;
  }

  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const zipFile = zip.file("imsmanifest.xml");
  const body = zipFile != null ? await zipFile.async("string") : "";
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(body, "text/xml");

  const indexPath = xmlDoc
    .getElementsByTagName("resources")[0]
    .getElementsByTagName("resource")[0]
    .getAttribute("href");

  if (indexPath) {
    onChangeIndexPath(indexPath);
  }

  try {
    const name = xmlDoc.getElementsByTagName("lom:langstring")[0].innerHTML;
    const nameInput = document.getElementById("video-name") as HTMLInputElement;
    if (name != null && nameInput != null) {
      if (isEmpty(nameInput.value)) {
        nameInput.value = name;
      }
    }
  } catch {}
  try {
    const duration = xmlDoc
      .getElementsByTagName("lom:typicallearningtime")[0]
      .getElementsByTagName("lom:datetime")[0].innerHTML;
    const durationTokens = duration.split(":").map((d) => parseInt(d));
    if (durationTokens.length === 3) {
      const duration =
        durationTokens[0] * 60 * 60 +
        durationTokens[1] * 60 +
        durationTokens[2];
      onChangeDuration(duration);
    }
  } catch {}
}

export function sessionDurationBySessionList(sessions: UserSession[]) {
  let totalDuration = sessions.reduce((prev, session) => {
    return (
      prev +
      DateTime.fromISO(session.endedAt).diff(
        DateTime.fromISO(session.createdAt),
        "seconds"
      ).seconds
    );
  }, 0);
  return isNaN(totalDuration) ? 0 : totalDuration;
}

export function sessionAverageDurationBySessionList(sessions: UserSession[]) {
  let totalDuration = sessionDurationBySessionList(sessions);
  return totalDuration / sessions.length;
}
