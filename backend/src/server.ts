import { app } from "./app";
import { environment } from "./config/environment";

app.listen(environment.port, () => {
  console.log(`Server running on port ${environment.port}`);
});
