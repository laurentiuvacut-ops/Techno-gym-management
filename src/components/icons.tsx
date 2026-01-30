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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M6.38,18.44C4.19,16.8,3,14.7,3,12.5C3,8.92,5.63,6,9,6c3.38,0,6,2.92,6,6.5c0,2.2-1.19,4.3-3.38,5.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeMiterlimit="10" fill="none"/>
      <path d="M17.62,5.56C19.81,7.2,21,9.3,21,11.5c0,3.58-2.63,6.5-6,6.5c-3.38,0-6-2.92-6-6.5c0-2.2,1.19-4.3,3.38-5.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeMiterlimit="10" fill="none"/>
      <rect x="9" y="11.5" width="6" height="2" stroke="currentColor" strokeWidth="0.5" fill="currentColor"/>
      <path d="M16.9,3.28C14.4,2.46,12.42,2.5,12.42,2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeMiterlimit="10" fill="none"/>
    </svg>
  ),
};
