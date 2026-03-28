import { useVideoPlayer, VideoView } from "expo-video";
import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface VideoCardProps {
  uri: string;
  width?: number;
}

export const VideoCard = ({ uri, width = SCREEN_WIDTH }: VideoCardProps) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });

  return (
    <VideoView
      player={player}
      style={{ width, aspectRatio: 16 / 9, backgroundColor: "#000" }}
      contentFit="contain"
      nativeControls
    />
  );
};
