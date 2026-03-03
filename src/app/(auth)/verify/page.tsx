'use client'
import { redirect } from "next/navigation";

export default function VerifyRoot() {
  redirect("/sign-up");
}