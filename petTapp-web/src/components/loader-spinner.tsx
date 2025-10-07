import { Loader2 } from "lucide-react";

const LoaderSpinner = ({width = 4, height = 4}: {width?: number, height?: number}) => {
  return <Loader2 className={`w-${width} h-${height} animate-spin`} />;
};

export default LoaderSpinner;
