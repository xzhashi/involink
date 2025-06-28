
import React from 'react';

export const AbstractHeroPattern: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <pattern id="heroPattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="scale(1.5) rotate(45)">
        <path d="M0 60V0h60" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <path d="M30 30L0 0M60 0L0 60M60 30L30 60M30 0L0 30" fill="none" stroke="currentColor" strokeWidth="0.2"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#heroPattern)" />
  </svg>
);
