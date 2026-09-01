import Link from "next/link"
import { getSkills } from "./skills"
export default async function SkillsPage() {
  const skills = await getSkills();
  return (
    <section className="p-4 flex flex-col gap-4 max-w-md mx-auto">
      <h1>Skills</h1>
      <Link href="/skills/create" className="btn btn-primary self-end">Create a Skill</Link>
      <ul className="menu">
        {skills?.map(skill => {
          return (
            <li key={skill.id}>
              <Link href={`/skills/${skill.id}`}>{skill.name}</Link>
            </li>
          )
        })}

      </ul>
    </section>
  )
}