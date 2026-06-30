import { app } from "./app";
import { environment } from "./config/environment";

// Start the server for local development
// On Vercel serverless, the app is exported as a default export
if (!process.env.VERCEL) {
  app.listen(environment.port, () => {
    console.log(`Server running on port ${environment.port}`);
  });
}

// Export the Express app for Vercel serverless runtime
export default app;
