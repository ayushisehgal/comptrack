'use client'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function Navbar() {
  const { data: session } = useSession()
  return (
    <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-50">
      <Link href="/" className="font-bold text-xl text-indigo-600">CompTrack</Link>
      <div className="flex items-center gap-6 text-sm">
        <Link href="/" className="text-gray-600 hover:text-gray-900">Salaries</Link>
        <Link href="/companies" className="text-gray-600 hover:text-gray-900">Companies</Link>
        <Link href="/compare" className="text-gray-600 hover:text-gray-900">Compare</Link>
        <Link href="/submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          Submit Salary
        </Link>
        {session ? (
          <button onClick={() => signOut()} className="text-gray-500 hover:text-gray-700">Sign out</button>
        ) : (
          <button onClick={() => signIn('google')} className="text-gray-600 hover:text-gray-900">Sign in</button>
        )}
      </div>
    </nav>
  )
} 
