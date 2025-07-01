import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GarageClient from "./GarageClient";

export default async function GaragePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <GarageClient />;
}