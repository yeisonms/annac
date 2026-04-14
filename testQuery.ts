import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
const supabase = createClient(process.env.VITE_SUPABASE_URL as string, process.env.VITE_SUPABASE_ANON_KEY as string);
async function run() {
    const { data } = await supabase.from("perfiles").select("*");
    console.log(data);
}
run();
