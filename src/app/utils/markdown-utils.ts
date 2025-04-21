import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export class MarkdownUtils {
  // Método estático para formatar Markdown
  static formatMarkdown(content: string, sanitizer: DomSanitizer): SafeHtml {
    const html = marked(content).toString();
    return sanitizer.bypassSecurityTrustHtml(html);
  }
}