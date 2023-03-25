import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteStudent, getStudent, getStudents } from 'apis/students.api'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { useQueryString } from 'utils/utils'
import classnames from 'classnames'
import { toast } from 'react-toastify'

const LIMIT = 10
export default function Students() {
  const queryString: { page?: string } = useQueryString()
  const page = Number(queryString?.page) || 1
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['students', page],
    // queryFn: ({ signal }) => {
    //   return getStudents(page, LIMIT, signal) // signal duoc truyen khi cancelQueries function duoc run
    // }
    queryFn: () => {
      const controller = new AbortController()
      setTimeout(() => {
        controller.abort()
      }, 5000)
      return getStudents(page, LIMIT, controller.signal) // signal duoc truyen khi cancelQueries function duoc run
    },
    // staleTime: 1000  // data sẽ trở thành cũ sao 1s
    // cacheTime: 1000 // data được cache trong 1s
    // keepPreviousData: true // keep previous data to avoid isloading is set true, test o? phant trang
    // retry: 4 // retry 4 lan
  })

  const totalStudentCount = Number(data?.headers['x-total-count'] || 0)
  const totalPage = Math.ceil(totalStudentCount / LIMIT)

  const queryClient = useQueryClient()
  const deleteStudentMutation = useMutation({
    mutationFn: (id: number) => {
      return deleteStudent(id)
    },
    onSuccess: (_, id) => {
      toast.success(`Xoa thanh cong student voi id la ${id}`)
      // lam cho data bi. invalidate de? fetch lai. data
      queryClient.invalidateQueries({ queryKey: ['students', page], exact: true })
    }
  })

  const handleDelete = (id: number) => {
    deleteStudentMutation.mutate(id)
  }

  const handlePrefetchStudent = (id: number) => {
    queryClient.prefetchQuery(['student', String(id)], {
      queryFn: () => getStudent(id),
      staleTime: 1000 * 10
    })
  }

  const refetchStudent = () => {
    refetch()
  }

  const cancelRequestStudents = () => {
    queryClient.cancelQueries({ queryKey: ['students', page] })
  }

  return (
    <div>
      <h1 className='text-lg'>Students</h1>
      <div className='mt-2 mb-2 '>
        <Link
          to='/students/add'
          className='rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
        >
          Add Student
        </Link>
      </div>

      {isLoading && (
        <div role='status' className='mt-6 animate-pulse'>
          <div className='mb-4 h-4  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10 rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <span className='sr-only'>Loading...</span>
        </div>
      )}
      {!isLoading && (
        <Fragment>
          <div className='relative mt-6 overflow-x-auto shadow-md sm:rounded-lg'>
            <table className='w-full text-left text-sm text-gray-500 dark:text-gray-400'>
              <thead className='bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400'>
                <tr>
                  <th scope='col' className='py-3 px-6'>
                    #
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    Avatar
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    Name
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    Email
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    <span className='sr-only'>Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((student) => (
                  <Fragment key={student.id}>
                    <tr
                      onMouseEnter={() => handlePrefetchStudent(student.id)}
                      className='border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600'
                    >
                      <td className='py-4 px-6'>{student.id}</td>
                      <td className='py-4 px-6'>
                        <img src={student.avatar} alt='student' className='h-5 w-5' />
                      </td>
                      <th scope='row' className='whitespace-nowrap py-4 px-6 font-medium text-gray-900 dark:text-white'>
                        {student.last_name}
                      </th>
                      <td className='py-4 px-6'>{student.email}</td>
                      <td className='py-4 px-6 text-right'>
                        <Link
                          to={`/students/${student.id}`}
                          className='mr-5 font-medium text-blue-600 hover:underline dark:text-blue-500'
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className='font-medium text-red-600 dark:text-red-500'
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className='mt-6 flex justify-center'>
            <nav aria-label='Page navigation example'>
              <ul className='inline-flex -space-x-px'>
                <li>
                  {page === 1 ? (
                    <span className='cursor-not-allowed rounded-l-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'>
                      Previous
                    </span>
                  ) : (
                    <Link
                      to={`/students?page=${page - 1}`}
                      className='rounded-l-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                    >
                      Previous
                    </Link>
                  )}
                </li>
                {Array(totalPage)
                  .fill(0)
                  .map((_, index) => {
                    const pageNumber = index + 1
                    const isActive = page === pageNumber
                    return (
                      <Fragment key={pageNumber}>
                        <li>
                          <Link
                            className={classnames(
                              'border border-gray-300 py-2 px-3 leading-tight text-gray-500  hover:bg-gray-100 hover:text-gray-700',
                              {
                                'bg-gray-100 text-gray-700': isActive,
                                'bg-white': !isActive
                              }
                            )}
                            to={`/students?page=${pageNumber}`}
                          >
                            {pageNumber}
                          </Link>
                        </li>
                      </Fragment>
                    )
                  })}
                <li>
                  {page === totalPage - 1 ? (
                    <span className='cursor-not-allowed rounded-r-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'>
                      Next
                    </span>
                  ) : (
                    <Link
                      className='rounded-r-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                      to={`/students?page=${page + 1}`}
                    >
                      Next
                    </Link>
                  )}
                </li>
              </ul>
            </nav>
          </div>
        </Fragment>
      )}
    </div>
  )
}
