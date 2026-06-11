import { NgModule, inject, provideAppInitializer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { SharedModule } from '@shared/shared.module';
import { AppConfigService } from '@core/config/app-config.service';
import { AuthService } from '@core/auth/auth.service';
import { baseUrlInterceptor } from '@core/http/interceptors/base-url.interceptor';
import { authInterceptor } from '@core/http/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/http/interceptors/error.interceptor';

@NgModule({
  declarations: [AppComponent, WelcomeComponent],
  imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule, SharedModule],
  providers: [
    provideHttpClient(withInterceptors([baseUrlInterceptor, authInterceptor, errorInterceptor])),
    // Load runtime config, then restore any persisted session before the app renders.
    provideAppInitializer(() => {
      const config = inject(AppConfigService);
      const auth = inject(AuthService);
      return config.load().then(() => auth.restoreSession());
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
