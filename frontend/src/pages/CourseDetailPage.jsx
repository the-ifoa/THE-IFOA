import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RiArrowLeftLine, RiLoader4Line } from 'react-icons/ri'

import { api } from '@/lib/api'
import { CourseDetailView } from '@/components/course/CourseDetailView'
import { Seo } from '@/components/common/Seo'
import { readPreload } from '@/lib/preload'
import {
  graph,
  organizationSchema,
  courseSchema,
  breadcrumbSchema,
  clampDescription
} from '@/lib/seo'

export function CourseDetailPage() {
  const { slug } = useParams()
  const preloaded = readPreload(`course:${slug}`)
  const [course, setCourse] = useState(preloaded)
  const [loading, setLoading] = useState(!preloaded)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    // A preloaded course is already on screen; refetch quietly to pick up any
    // edits made since the last build rather than flashing the spinner again.
    if (!readPreload(`course:${slug}`)) setLoading(true)
    setError('')

    api
      .getCourse(slug)
      .then((data) => {
        if (!cancelled) setCourse(data.course)
      })
      .catch(() => {
        if (!cancelled) setError('This course could not be found.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-[60vh] pt-28 flex items-center justify-center">
        <RiLoader4Line className="w-8 h-8 animate-spin text-[#34E06E]" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-[60vh] pt-28 pb-16 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Seo
          path={`/courses/${slug}`}
          title="Course not available | IFOA"
          description="This training programme is no longer listed. Browse IFOA's current flight dispatcher and flight operations intakes."
          noindex
        />
        <h1 className="text-2xl font-bold text-rocket-dark">Course not available</h1>
        <p className="text-gray-600 max-w-md">{error || 'This course could not be found.'}</p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm font-bold text-rocket-dark underline"
        >
          <RiArrowLeftLine className="w-4 h-4" /> All Events &amp; Courses
        </Link>
      </div>
    )
  }

  return (
    <>
      <Seo
        path={`/courses/${course.slug}`}
        title={course.seo?.metaTitle || `${course.title} | IFOA`}
        description={clampDescription(
          course.seo?.metaDescription || course.summary || course.whatYouWillLearn?.intro
        )}
        image={course.card?.image?.url || course.heroImage?.url}
        jsonLd={graph(
          organizationSchema(),
          courseSchema(course),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
            { name: course.title, path: `/courses/${course.slug}` }
          ])
        )}
      />
      <CourseDetailView course={course} />
    </>
  )
}

export default CourseDetailPage
