import { VideoView } from "@prisma/client";
import { Duration } from "luxon";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    API: ScormAPI;
    API_1484_11: Scorm2004API;
    SERVICE_WORKER_ACTIVE: boolean;
  }
}

export function useScormPlayer(
  videoView: VideoView & { video: { duration: number } }
) {
  useEffect(() => {
    if (videoView.id != null) {
      const cmi =
        videoView.cmi ??
        JSON.stringify({
          cmi: {
            core: {
              entry: videoView.id,
              student_id: videoView.userId,
            },
          },
        });

      window.API = new Scorm12API({
        autocommit: true,
        autocommitSeconds: 5,
        alwaysSendTotalTime: true,
        lmsCommitUrl: "/video/cmi",
        responseHandler(response) {
          const data: { videoView: VideoView } = JSON.parse(
            response.responseText
          );
          if (data.videoView.id != null && data.videoView.id !== videoView.id) {
            window.location.replace(`/video/${data.videoView.id}`);
          }
        },
      });
      console.log(JSON.parse(cmi));
      window.API.loadFromJSON(JSON.parse(cmi), "");

      var unloaded = false;
      function unloadHandler() {
        if (!unloaded && !window.API.isTerminated()) {
          window.API.LMSSetValue("cmi.core.exit", "suspend"); //Set exit to whatever is needed
          window.API.LMSCommit(""); //save all data that has already been set
          window.API.LMSTerminate(""); //close the SCORM API connection properly
          unloaded = true;
          return false;
        }
        return false;
      }

      window.onbeforeunload = unloadHandler;
      window.onunload = unloadHandler;

      const listener = setInterval(() => {
        if (window.API.cmi?.core?.lesson_status === "completed") {
          window.API.LMSCommit("");
        }
      }, 1000);

      return () => clearInterval(listener);
    }
  }, []);
}
