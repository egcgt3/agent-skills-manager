"use server";

import { revalidatePath } from "next/cache";
import { addSkill, Skill } from "../skills/skills";
import { redirect } from "next/navigation";

export async function createSkill(prevState: any, formData: any) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string
  const category = formData.get("category") as string;

  if(!name || !description || !category) {
    return {message: "Please fill all the fields"};
  }

  const newSkill: Skill = {
    id: Date.now().toString(),
    name,
    description,
    category,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await addSkill(newSkill);
  revalidatePath("/skills");
  redirect("/skills");
}