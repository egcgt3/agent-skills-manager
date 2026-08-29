"use client";

import { useActionState } from "react";
import { createSkill } from "@/app/actions/skill";

const initialState = {
  message: "",
}

export default function NewSkillPage() {
  const [state, formAction, pending] = useActionState(createSkill, initialState);
  return (
    <form action={formAction}>
      <input type="text" name="name" className="input input-bordered w-full" />
      <textarea name="description" rows={3} className="input input-bordered w-full"  />
      <input type="text" name="category" className="input input-bordered w-full" />
      <p aria-live="polite" className="text-red-500">{state?.message}</p>
      <button disabled={pending}>
        {pending ? "creating..." : "Create skill"}
      </button>
    </form>
  )
}
