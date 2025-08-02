import Handlebars from 'handlebars';
import fs from 'fs';

export function compileTemplate(templatePath, data) {
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateSource);
  return template(data);
}
