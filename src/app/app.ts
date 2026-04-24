import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { TranslateService } from '@ngx-translate/core';
import { DEFAULT_LANGUAGE } from '@core/translate/translate.config';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private translateService = inject(TranslateService);
  private themeService = inject(ThemeService);

  constructor() {
    this.translateService.setDefaultLang(DEFAULT_LANGUAGE);
    this.translateService.use(DEFAULT_LANGUAGE);
  }
}
