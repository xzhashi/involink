import React from 'react';

export const ScaleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.153.274c-.473 0-.936-.086-1.391-.26L12 15.5l-2.619 2.031c-.455.174-.918.26-1.391.26-.798 0-1.555-.224-2.153-.659a1.2 1.2 0 01-.59-1.202L6.75 5.491m10.5-1.02c.99.204 1.99.377 3 .52M3.75 5.491L6.25 4.97M3.75 5.491A48.416 48.416 0 0112 4.5c2.291 0 4.545.16 6.75.47m0 0l-2.62 10.726" />
  </svg>
);
