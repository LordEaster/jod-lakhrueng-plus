import { ChevronDown } from 'lucide-react'
import { forwardRef, type SelectHTMLAttributes } from 'react'

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement>

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { className = '', children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={`min-h-[54px] w-full min-w-0 appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-12 text-base leading-7 text-gray-800 focus:border-green-500 focus:outline-none sm:text-lg ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
        strokeWidth={2}
      />
    </div>
  )
})

export default SelectField
