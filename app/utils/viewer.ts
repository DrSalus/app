import { UnitEnrollment, Video, VideoView } from "@prisma/client";
import { getRandomQuestion } from "~/services/questions";
import {
  checkPresentedQuestion,
  gotoNextChapter,
  isFinished,
  needsToPresentQuestion,
  UserQuestionWithQuestion,
} from "~/services/video";
import { getClientInfo } from "./client";
import { db } from "./db.server";
import { checkIfIsInSlot } from "./timeslot";

export const include = {
  video: true,
  chapter: {
    select: { intermediateQuestionInterval: true },
  },
};

export async function updateVideoView(
  options: {
    videoViewId: string;
    currentTime: number;
    forceCompletion: boolean;
    cmi?: string;
  },
  request: Request
) {
  const { videoViewId, currentTime, forceCompletion, cmi } = options;
  let userQuestion: UserQuestionWithQuestion | null = null;
  const clientInfo = getClientInfo(request);

  // We need to get the current video view state first.
  const videoView = await db.videoView.findUnique({
    where: { id: videoViewId },
    include: {
      unitEnrollment: {
        select: {
          enrollment: {
            select: {
              course: {
                select: {
                  timeSlot: true,
                  daysOfWeek: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (videoView == null) {
    throw new Error("Video view not found");
  }

  // Update the video view.
  const { elapsedTime } = videoView;
  let completedAt = videoView.completedAt;
  let shouldGoNextChapter: boolean = false;
  if (completedAt == null && (isFinished(videoView) || forceCompletion)) {
    completedAt = new Date();
    shouldGoNextChapter = true;
  }

  let updatedVideoView = await db.videoView.update({
    where: { id: videoViewId },
    include,
    data: {
      currentTime,
      ...clientInfo,
      completedAt,
      cmi,
      elapsedTime: currentTime > elapsedTime ? currentTime : elapsedTime,
    },
  });

  if (shouldGoNextChapter && videoView.unitEnrollmentId != null) {
    console.log("Go to next chapter");
    const nextVideoView = await gotoNextChapter(
      videoView.userId,
      videoView.unitEnrollmentId,
      forceCompletion
    );
    if (nextVideoView != null) {
      updatedVideoView = nextVideoView;
    }
  }

  // If time passed, and we have a question time, get a question.
  if (needsToPresentQuestion(updatedVideoView)) {
    // First check if we have an already presented question.
    userQuestion = await checkPresentedQuestion(updatedVideoView);

    // If not already presented.
    if (userQuestion == null) {
      // If we have to present a question.
      const question = await getRandomQuestion(updatedVideoView);
      if (question != null) {
        userQuestion = await db.userQuestion.create({
          data: {
            questionId: question.id,
            unitEnrollmentId: updatedVideoView.unitEnrollmentId,
            userId: videoView.userId,
            viewId: updatedVideoView.id,
          },
          include: {
            question: true,
          },
        });
      }
    }
  }

  return {
    videoView: updatedVideoView,
    inSlotTime: checkIfIsInSlot(videoView.unitEnrollment?.enrollment.course),
    userQuestion,
  };
}

export async function updateEnrollmentProgress(
  videoView: VideoView & { video: Video }
) {
  if (videoView.unitEnrollmentId != null) {
    const duration =
      videoView.video.duration > 0 ? videoView.video.duration : 1;

    const numberOfChapters = await db.chapter.count({
      where: {
        unitId: videoView.unitId,
      },
    });
    const numberOfCompletedVideoViews = await db.videoView.count({
      where: {
        unitId: videoView.unitId,
        userId: videoView.userId,
        NOT: {
          completedAt: null,
        },
      },
    });
    const progress = Math.max(
      0,
      Math.min(1, numberOfCompletedVideoViews / numberOfChapters)
    );
    console.log(numberOfCompletedVideoViews);
    console.log(numberOfChapters);
    console.log(numberOfCompletedVideoViews / numberOfChapters);
    console.log(progress);

    // numberOfChapter, numberOfVideoView

    await db.unitEnrollment.update({
      where: {
        id: videoView.unitEnrollmentId,
      },
      data: {
        progress,
      },
    });
  }
}

export function calculateEnrollmentProgress(enrollment: {
  units: {
    progress: number;
    unit: {
      name: string;
    };
  }[];
  course: {
    _count: {
      units: number;
    };
  };
}): number {
  const { course, units } = enrollment;
  const total = units.reduce((p, n) => p + n.progress ?? 0, 0);
  return total / course._count.units;
}
