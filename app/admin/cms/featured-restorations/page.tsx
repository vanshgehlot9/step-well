import { redirect } from "next/navigation";

export default function LegacyFeaturedRestorationsRedirect() {
  redirect("/admin/initiatives");
}
