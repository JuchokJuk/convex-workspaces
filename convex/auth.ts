import { convexAuth } from "@convex-dev/auth/server";
import { setDefaultUserData } from "./setDefaultUserData";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Anonymous],
  callbacks: {
    afterUserCreatedOrUpdated: setDefaultUserData,
  },
});
