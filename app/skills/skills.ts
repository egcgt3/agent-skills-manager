export type Skill = {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export let SKILLS: Skill[] = [
  {
    id: "1",
    name: "Skill 1",
    description: "Description 1",
    category: "Category 1",
    createdAt: "2022-12-03",
    updatedAt: "2022-12-04"
  },
  {
    id: "2",
    name: "Skill 2",
    description: "Description 2",
    category: "Category 2",
    createdAt: "2022-12-05",
    updatedAt: "2022-12-06"
  }
];

export async function getSkills() {
  await new Promise(resolve => {
    setTimeout(() => resolve(null), 3000);
  })
  return [...SKILLS];
}

export async function addSkill(skill: Skill) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  SKILLS = [...SKILLS, skill];
  return getSkills();
}
