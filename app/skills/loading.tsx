export default function SkillslLoading() {
  return (
    <div className="grid md:grid-cols-3 gap-6 m-4">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="card bg-base-200">
          <div className="card-body">
            <div className="skeleton h-6 w-3/4"></div>
            <div className="skeleton h-4 w-full mt-2"></div>
          </div>
        </div>
      ))}
    </div>
  )
}