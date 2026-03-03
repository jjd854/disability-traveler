'use client';

import React from 'react';
import { gaEvent } from '@/lib/ga';

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: string;
  params?: Record<string, any>;
};

export default function OutboundLink({ event, params, onClick, ...rest }: Props) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        // Fire GA, but never block navigation
        try {
          gaEvent(event, params || {});
        } catch {}

        // Preserve any existing onClick behavior
        onClick?.(e);
      }}
    />
  );
}
