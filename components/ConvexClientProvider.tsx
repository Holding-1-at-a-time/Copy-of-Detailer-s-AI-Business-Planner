import React, { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// In a real app with Clerk, you would use ConvexProviderWithClerk here.
// import { ConvexProviderWithClerk } from "convex/react-clerk";
// import { useAuth } from "@clerk/clerk-react";

const convex = new ConvexReactClient(process.env.CONVEX_URL!);

const ConvexClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // const { getToken } = useAuth(); // Example for Clerk
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
    // Example for Clerk:
    // <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
    //   {children}
    // </ConvexProviderWithClerk>
  );
};

export default ConvexClientProvider;
