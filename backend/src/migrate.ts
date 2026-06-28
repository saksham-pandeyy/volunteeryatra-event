import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

async function migrate() {
  console.log("Running migrations...");

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const dir = path.join(__dirname, "../../supabase/migrations");
  const files = fs.readdirSync(dir).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), "utf-8");
    console.log(`Running: ${file}...`);

    const { error } = await supabase.rpc("exec_sql", { query: sql });
    if (error) {
      console.log(`rpc failed: ${error.message}`);

      // Try alternative: use raw REST endpoint
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseServiceKey,
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "Prefer": "tx=commit",
          },
          body: JSON.stringify({ query: sql }),
        });
        if (response.ok) {
          console.log(`  Success via REST`);
        } else {
          console.log(`  REST also failed: ${response.status}`);
          console.log(`  Please run this SQL manually in Supabase SQL Editor:`);
          console.log(`  https://supabase.com/dashboard/project/zvznxpngdoyuygsoigiy/sql/new`);
          console.log(sql);
        }
      } catch (e) {
        console.log(`  REST error: ${e}`);
      }
    } else {
      console.log(`  Done`);
    }
  }

  console.log("\nMigrations complete!");
}

migrate().catch(console.error);
