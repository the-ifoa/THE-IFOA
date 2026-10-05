import { Link } from 'react-router-dom'
import { Pencil, FileText, FileEdit, Users } from 'lucide-react'
import { hasEnrollmentForm } from '@/components/course/CourseCard'

// One card per course with shortcuts to its page editor, settings, form and
// submissions. Used on the admin Dashboard.
export function CourseLinksGrid({ courses }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <div
          key={course._id}
          className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-xs space-y-3"
        >
          <div>
            <p className="text-sm font-bold text-rocket-dark leading-snug line-clamp-2">{course.title}</p>
            <p className="text-[11px] font-semibold text-gray-400 mt-0.5">{course.slug}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              to={`/admin/courses/${course._id}/text`}
              className="inline-flex items-center gap-1 rounded-lg border border-[#020617] bg-[#020617] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-black transition-colors"
            >
              <FileEdit className="h-3 w-3" /> Edit Page
            </Link>
            <Link
              to={`/admin/courses/${course._id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Pencil className="h-3 w-3" /> Settings
            </Link>
            {hasEnrollmentForm(course) && (
              <Link
                to={`/admin/courses/${course._id}/form`}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FileText className="h-3 w-3" /> Edit Form
              </Link>
            )}
            {hasEnrollmentForm(course) && (
              <Link
                to={`/admin/submissions?course=${course._id}`}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <Users className="h-3 w-3" /> Submissions
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CourseLinksGrid
