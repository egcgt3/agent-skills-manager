"use client";

import { useActionState } from "react";
import { createSkill } from "@/app/actions/skill";

const initialState = {
  message: "",
}

export default function NewSkillPage() {
  const [state, formAction, pending] = useActionState(createSkill, initialState);
  return (
    <form action={formAction} className="p-4 flex flex-col gap-4 form max-w-md mx-auto">
      <input placeholder="Skill name" type="text" name="name" className="input input-bordered w-full" />
      <textarea placeholder="Skill description" name="description" rows={3} className="input input-bordered w-full"  />
      <input placeholder="Skill category" type="text" name="category" className="input input-bordered w-full" />
      <p aria-live="polite" className="text-red-500">{state?.message}</p>
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "creating..." : "Create skill"}
      </button>
    </form>
  )
}
