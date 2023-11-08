import { Video, VideoView } from "@prisma/client";
import axios from "axios";
import { useRef, useState, useEffect, useCallback } from "react";
import ReactPlayer from "react-player";
import { useNavigate } from "react-router-dom";
import { isFinished, UserQuestionWithQuestion } from "~/services/video";
const MIN_PROGRESS_DELTA = 5;

export function useVideoPlayer(
  videoView: VideoView & { video: { duration: number } },
  video: Video,
  presentedUserQuestion: UserQuestionWithQuestion | null
) {
  const player = useRef<ReactPlayer | null>(null);

  // const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(0);
  const [state, setState] = useState<VideoView>(videoView);
  const [userQuestion, setUserQuestion] =
    useState<UserQuestionWithQuestion | null>(presentedUserQuestion);
  const [playing, setPlaying] = useState(false);

  const { currentTime: remoteCurrentTime } = videoView;

  useEffect(() => {
    setState(videoView);
    setUserQuestion(null);
    setPlaying(false);
    setCurrentTime(0);
    player.current?.seekTo(0);
  }, [videoView.id]);

  useEffect(() => {
    if (state.id !== videoView.id) {
      // navigate(`/video/${state.id}`);
      setPlaying(false);
      setCurrentTime(0);
      player.current?.seekTo(0);
    }
  }, [state]);

  const sendRequest = async (
    action: "view" | "reset" | "next" | "nextQuestion" = "view"
  ) => {
    return axios
      .post<{
        videoView: VideoView;
        inSlotTime: boolean;
        userQuestion: UserQuestionWithQuestion | null;
      }>("/video/" + action, {
        videoViewId: videoView.id,
        currentTime,
      })
      .then(({ data }) => {
        const { videoView, userQuestion, inSlotTime } = data;
        setState(videoView);
        if (!inSlotTime) {
          setPlaying(false);
          return window.location.reload();
        }
        if (userQuestion != null) {
          setUserQuestion(userQuestion);
          setPlaying(false);
        }
      });
  };

  const reset = useCallback(() => {
    sendRequest("reset");
  }, []);

  const next = useCallback(() => {
    sendRequest("next");
  }, []);
  const nextQuestion = useCallback(() => {
    sendRequest("nextQuestion");
  }, []);

  const handleReady = useCallback(
    (r: ReactPlayer) => {
      if (player.current == null) {
        r.seekTo(remoteCurrentTime);
        player.current = r;
      }
    },
    [remoteCurrentTime]
  );
  const handleSeek = useCallback(
    (e: number) => {
      console.log("Seek to", e, state.elapsedTime);
      if (e > state.elapsedTime) {
        player?.current?.seekTo(state.elapsedTime, "seconds");
        setCurrentTime(state.elapsedTime);
        setPlaying(false);
      }
    },
    [state.elapsedTime]
  );
  const handleProgress = useCallback(
    (e: { playedSeconds: number }) => {
      if (playing) {
        setCurrentTime(e.playedSeconds);
      }
    },
    [playing]
  );
  const handlePlay = useCallback(() => setPlaying(true), []);
  const handlePause = useCallback(() => setPlaying(false), []);
  const tick = () => sendRequest("view");

  // We should remove the user questiond and get the video view again.
  const handleQuestionClosed = useCallback(() => {
    setUserQuestion(null);
    sendRequest();
  }, []);

  useEffect(() => {
    const hasProgressDelta =
      Math.abs(currentTime - state.currentTime) > MIN_PROGRESS_DELTA;
    if (hasProgressDelta || isFinished(state)) {
      sendRequest();
    }
  }, [currentTime]);

  return {
    handleReady,
    handleSeek,
    handlePause,
    handlePlay,
    handleProgress,
    handleQuestionClosed,
    reset,
    next,
    tick,
    playing,
    setCurrentTime,
    currentTime,
    state,
    nextQuestion,
    userQuestion,
  };
}

export type VideoPlayerState = ReturnType<typeof useVideoPlayer>;
