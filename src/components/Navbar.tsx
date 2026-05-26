'use client'

import Link from 'next/link'
import { signIn, signOut, useSession } from "next-auth/react"

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg">
            CompTrack
          </Link>

          <Link href="/" className="text-gray-600 hover:text-black">
            Salaries
          </Link>

          <Link href="/compare" className="text-gray-600 hover:text-black">
            Compare
          </Link>

          <Link href="/companies" className="text-gray-600 hover:text-black">
            Companies
          </Link>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          <Link
            href="/submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Submit Salary
          </Link>

          {!session ? (
            <button
              onClick={() => signIn("google")}
              className="border px-4 py-2 rounded hover:bg-gray-100"
            >
              Sign in
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {session.user?.name}
              </span>
              <button
                onClick={() => signOut()}
                className="border px-3 py-2 rounded hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  )
}