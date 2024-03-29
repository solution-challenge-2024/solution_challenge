import { Injectable } from "@angular/core";
import {
  Auth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "@angular/fire/auth";
import { User, UserSignup } from "../models/user";
import {
  Firestore,
  Timestamp,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from "@angular/fire/firestore";
import { Observable } from "rxjs";
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytes,
} from "@angular/fire/storage";

@Injectable({
  providedIn: "root",
})
export class AuthenticationService {
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private storage: Storage,
  ) {}

  public async signUp(userData: UserSignup) {
    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        userData.email,
        userData.password,
      );

      // Add display name and photo URL
      await updateProfile(userCredential.user, {
        displayName: `${userData.firstName} ${userData.lastName}`,
        photoURL: "assets/user.svg",
      });

      // Initialize user
      const user = this.initUser({
        id: userCredential.user.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
      });

      // Save user to the database
      const userDoc = doc(this.firestore, "users", user.id);
      await setDoc(userDoc, user);

      // Return user data
      return {
        error: null,
        user,
      };
    } catch (error: any) {
      return {
        error,
        user: null,
      };
    }
  }

  public async signIn(email: string, password: string) {
    try {
      // Sign in user
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password,
      );

      // Return user data
      return {
        error: null,
        user: userCredential.user,
      };
    } catch (error: any) {
      return {
        error,
        user: null,
      };
    }
  }

  public async signInWithGoogle() {
    // Show Google sign in popup
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(this.auth, provider);

    // Check if user has an email
    if (userCredential.user.email === null) {
      return {
        error: "Google sign in failed",
        user: null,
      };
    }

    // Check if user exists in the database
    const userDoc = doc(this.firestore, "users", userCredential.user.uid);
    const userSnapshot = await getDoc(userDoc);
    let userData = userSnapshot.data() as User;

    if (!userSnapshot.exists()) {
      // Get first and last name from display name
      const [firstName, lastName] = userCredential.user.displayName?.split(
        " ",
      ) || ["", ""];

      // Initialize user
      const user = this.initUser({
        id: userCredential.user.uid,
        firstName,
        lastName,
        email: userCredential.user.email,
        picture: userCredential.user.photoURL || "assets/user.svg",
      });

      // Save user to the database
      await setDoc(userDoc, user);
      userData = user;
    }

    // Return user data
    return {
      error: null,
      user: userData,
    };
  }

  public signOut() {
    this.auth.signOut();
  }

  public getUser(userId: string): Observable<User> {
    return new Observable((observer) => {
      const userDoc = doc(this.firestore, "users", userId);
      const unsubscribe = onSnapshot(userDoc, (user) => {
        observer.next(user.data() as User);
      });

      return () => unsubscribe();
    });
  }

  public async updateUser(userId: string, user: Partial<User>) {
    // Get user document
    const userDoc = doc(this.firestore, "users", userId);

    // Update user
    await setDoc(userDoc, user, { merge: true });
  }

  public async uploadProfilePicture(image: File): Promise<string> {
    // Extract file info
    const file = {
      name: image.name.split(".")[0],
      extension: image.name.split(".")[1],
    };

    // Create a new file name
    const filename = file.name + "-" + Date.now() + "." + file.extension;
    const storageRef = ref(this.storage, `baskets/${filename}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, image);
    return getDownloadURL(snapshot.ref);
  }

  public initUser(data: Partial<User>): User {
    // Define default user
    const defaultUser: User = {
      id: "",
      firstName: "Unknown",
      lastName: "",
      picture: "assets/user.svg",
      email: "",
      location: {
        lat: 0,
        lon: 0,
      },
      ratings: [],
      blocked: false,
      lastLogin: Timestamp.now(),
      joinedAt: Timestamp.now(),
    };

    // Return user with data
    return {
      ...defaultUser,
      ...data,
      location: {
        ...defaultUser.location,
        ...data.location,
      },
    };
  }

  public async getAccessToken() {
    const token = await this.auth.currentUser?.getIdToken();
    return token;
  }
}
