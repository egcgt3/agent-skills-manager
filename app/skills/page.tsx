import Link from "next/link"
import { getSkills } from "./skills"
export default async function SkillsPage() {
  const skills = await getSkills();
  return (
    <section>
      <h1>Skills</h1>
      <p><Link href="/skills/create">Create a Skill</Link></p>
      <ul>
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