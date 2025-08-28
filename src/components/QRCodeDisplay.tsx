'use client';

import React from 'react';
import QRCode from 'react-qr-code';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
}

export function QRCodeDisplay({
  value,
  size = 256,
  level = 'M',
}: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="rounded-lg bg-white p-4 shadow-lg">
        <QRCode
          value={value}
          size={size}
          level={level}
          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
        />
      </div>
      <p className="text-muted-foreground mt-2 max-w-xs text-center text-xs break-all">
        {value}
      </p>
    </div>
  );
}
