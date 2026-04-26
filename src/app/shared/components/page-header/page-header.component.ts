import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { SUPPORTED_LANGUAGES } from '@core/translate/translate.config';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [Toolbar, Button, Select, FormsModule, TranslatePipe],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  title = input.required<string>();
  username = input<string>('');
  currentLang = input<string>('en');
  logoutVisible = input<boolean>(true);
  isDark = input<boolean>(false);
  wsStatus = input<string>('disconnected');

  langChange = output<string>();
  logoutClick = output<void>();
  themeToggle = output<void>();

  languages = SUPPORTED_LANGUAGES.map((l) => ({ label: l.toUpperCase(), value: l }));
  selectedLang = 'en';

  onLangChange(lang: string): void {
    this.selectedLang = lang;
    this.langChange.emit(lang);
  }
}
