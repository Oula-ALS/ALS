import type { Metadata } from "next";
import { EditProfile } from "./EditProfile";

export const metadata: Metadata = { title: "My details · Alsama Arabic Lab" };

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <EditProfile />
    </div>
  );
}
