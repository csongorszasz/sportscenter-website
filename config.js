import path from 'path';

export const secret = 'asp1osm9umw4m0e5aslkj4w296rf';
export const tokenBlacklist = new Set();

export const viewsDir = path.join(process.cwd(), 'views');
export const layoutsDir = path.join(viewsDir, 'layouts');
export const partialsDir = path.join(viewsDir, 'partials');
