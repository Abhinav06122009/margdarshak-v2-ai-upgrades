// src/hooks/useMaterialYou.ts
import { argbFromHex, themeFromSourceColor } from '@material/material-color-utilities';
import { useEffect } from 'react';

export const useMaterialYou = (hex = '#6750A4') => {
  useEffect(() => {
    const theme = themeFromSourceColor(argbFromHex(hex));
    const p = theme.schemes.light.primary;
    const s = theme.schemes.light.secondary;
    const t = theme.schemes.light.tertiary;
    document.documentElement.style.setProperty('--m3-primary', `${p.r} ${p.g} ${p.b}`);
    document.documentElement.style.setProperty('--m3-secondary', `${s.r} ${s.g} ${s.b}`);
    document.documentElement.style.setProperty('--m3-tertiary', `${t.r} ${t.g} ${t.b}`);
  }, [hex]);
};
