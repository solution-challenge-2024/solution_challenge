import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";

import { routes } from "./app.routes";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { connectAuthEmulator, getAuth, provideAuth } from "@angular/fire/auth";
import {
  connectStorageEmulator,
  getStorage,
  provideStorage,
} from "@angular/fire/storage";
import {
  getAnalytics,
  provideAnalytics,
  ScreenTrackingService,
  UserTrackingService,
} from "@angular/fire/analytics";
import {
  connectFirestoreEmulator,
  getFirestore,
  provideFirestore,
} from "@angular/fire/firestore";
import { environment } from "../environments/environment.development";
import { provideToastr } from "ngx-toastr";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    ),
    importProvidersFrom(
      provideAuth(() => {
        const auth = getAuth();

        if (environment.useEmulators) {
          connectAuthEmulator(auth, "http://localhost:9099");
        }

        return auth;
      }),
    ),
    importProvidersFrom(
      provideStorage(() => {
        const storage = getStorage();

        if (environment.useEmulators) {
          connectStorageEmulator(storage, "localhost", 9199);
        }

        return storage;
      }),
    ),
    importProvidersFrom(provideAnalytics(() => getAnalytics())),
    ScreenTrackingService,
    UserTrackingService,
    importProvidersFrom(
      provideFirestore(() => {
        const firestore = getFirestore();

        if (environment.useEmulators) {
          connectFirestoreEmulator(firestore, "localhost", 8080);
        }

        return firestore;
      }),
    ),
    provideAnimations(),
    provideToastr(),
  ],
};
