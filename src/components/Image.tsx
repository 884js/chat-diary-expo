import { Image as ExpoImage } from "expo-image";

type Props = {
  source: string;
  style?: object;
}

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export const Image = ({ source, style }: Props) => {
  return (
    <ExpoImage
      source={source}
      style={{ width: "100%", height: "100%", ...style }}
      contentFit="contain"
      transition={1000}
      cachePolicy={"memory-disk"}
      placeholder={{ blurhash }}
    />
  );
};

