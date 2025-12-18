# Brand Assets

Place your brand assets in this folder for easy theming.

## Files

Any image format is accepted (SVG, PNG, JPG, WebP). Use whatever format your design team provides.

| File | Description | Recommended |
|------|-------------|-------------|
| `logo.*` | Primary logo | SVG preferred, or PNG at 2x display size |
| `logo-dark.*` | Logo for dark backgrounds (optional) | Same format as primary |
| `favicon.*` | Browser tab icon | ICO, PNG (32x32), or SVG |
| `og-image.*` | Social sharing preview | PNG/JPG at 1200x630 |
| `logo-mark.*` | Icon-only version (optional) | SVG or PNG |
| `apple-touch-icon.png` | iOS home screen (optional) | PNG at 180x180 |

## Usage in Code

```tsx
import Image from 'next/image';

// Logo - update extension to match your file
<Image src="/brand/logo.svg" alt="Logo" width={120} height={40} />
<Image src="/brand/logo.png" alt="Logo" width={120} height={40} />

// Favicon is configured in app/layout.tsx metadata
```

## Naming Convention

Use descriptive names that work across projects:

```
logo.svg           # or logo.png, logo.webp
logo-dark.svg      # for dark backgrounds
logo-mark.svg      # icon-only version
favicon.ico        # or favicon.png, favicon.svg
og-image.png       # social sharing image
```

## Tips

- SVG is ideal for logos (scales perfectly, small file size)
- PNG works well when SVG isn't available
- Test logos on both light and dark backgrounds
- For retina displays, use 2x the display size for raster images
