import { getSkills } from '../skills';

type SkillDetailsPageProps = {
  params: {
    identifier: string;
  }
}

export default async function SkillDetailsPage({params}: SkillDetailsPageProps) {
  const skills = await getSkills();
  const {identifier} = await params;
  const skill = skills.find((skl) => skl.id === identifier);
  return skill ? (
    <article>
      <h1>{skill?.name}</h1>
      <p>{skill?.description}</p>
      <p>{skill?.category}</p>
      <p>{skill?.createdAt}</p>
      <p>{skill?.updatedAt}</p>
    </article>
  ) : 
  (
    <div>Skill not found</div>
  )
}
