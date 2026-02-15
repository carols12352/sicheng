import Image from "next/image";

type FigureProps = {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
};

export function Figure({
  src,
  alt,
  caption,
  width = 1280,
  height = 720,
}: FigureProps) {
  return (
    <figure className="mt-8">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="mx-auto h-auto w-full rounded-md border border-gray-200"
      />
      {caption ? (
        <figcaption className="mt-2 text-center text-sm text-gray-500">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
