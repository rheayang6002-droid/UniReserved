import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className, alt = 'UniReserve BEO', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/images/beo-logo.png"
            alt={alt}
            className={`object-contain ${className ?? 'size-8'}`}
            {...props}
        />
    );
}
