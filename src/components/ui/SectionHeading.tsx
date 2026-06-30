type SectionHeadingProps = {
  title: string
  eyebrow?: string
  description?: string
}

export function SectionHeading({ title, eyebrow, description }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      {eyebrow ? <span className="section-eyebrow">{eyebrow}</span> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  )
}
