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
      viewBox="0 0 68 68"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M28.0002 48V29H22.0002V25H28.0002V20H33.0002V48H28.0002Z" />
      <path d="M33.0002 40.6V36.6H28.0002V40.6H33.0002Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M34.0002 68C52.7779 68 68.0002 52.7777 68.0002 34C68.0002 15.2223 52.7779 0 34.0002 0C15.2225 0 0.000244141 15.2223 0.000244141 34C0.000244141 52.7777 15.2225 68 34.0002 68ZM37.778 40.6C37.5558 38.4 38.2225 36.4 39.5558 34.8C37.1113 33.6 35.5558 31.4 35.1113 28.4H38.0002V23.6C35.778 17.6 40.2225 13.6 46.2225 13.6V18C43.1113 18 40.6669 19.8 39.778 22.2C42.8891 23.2 44.2225 25.4 43.3336 29H52.6669V34H49.5558C47.3336 34 46.2225 35.4 45.1113 37.8C46 40.2 46.6669 42.4 48.778 44.6C47.8891 43.8 47.3336 42.8 46.778 42L50.1113 44.2C47.5558 50.2 42.4447 53 35.3336 53V48.4C39.7225 48.4 42.8891 46.8 45.1113 43H38.0002V38.6H48.6669V40.6H37.778Z"
      />
    </svg>
  ),
};
