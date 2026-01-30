import { Dumbbell } from 'lucide-react';
import type { SVGProps } from 'react';

export const Icons = {
  qrCode: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 5h4v4H5zM5 15h4v4H5zM15 5h4v4h-4zM15 15h4v4h-4zM11 5h2v2h-2zM11 11h2v2h-2zM5 11h2v2H5zM17 11h2v2h-2z" />
      <path d="M11 17h2v2h-2z" />
    </svg>
  ),
  logo: (props: SVGProps<SVGSVGElement>) => (
    <Dumbbell {...props} />
  ),
};
