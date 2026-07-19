import NextImage, { type ImageProps } from 'next/image';

function shouldBypassOptimizer(src: ImageProps['src']){
  if (typeof src !== 'string') return false;
  return src.startsWith('/media/') || src.includes('.s3.') || src.includes('.s3.amazonaws.com');
}

export default function MediaImage(props: ImageProps){
  return (
    <NextImage
      {...props}
      unoptimized={props.unoptimized ?? shouldBypassOptimizer(props.src)}
    />
  );
}
