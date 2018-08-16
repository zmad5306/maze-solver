import { readFileSync } from 'fs';
import { PNG } from 'pngjs';

export class PngWrapper {
    constructor(readonly width: number, readonly height: number, readonly data: Buffer) {}
}

export function pngFactory(path: string): PngWrapper {
    const src = readFileSync(path);
    const png = PNG.sync.read(src);
    return new PngWrapper(png.width, png.height, png.data);
}