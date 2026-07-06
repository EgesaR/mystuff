import React from 'react'
import { Outlet } from 'react-router'

const AuthLayout = () => {
  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-background'>
          <div className='pointer-events-none absolute right-0 bottom-0 h-105'>
              <div className='absolute bottom-0 left-1/2 h-95 w-200 -translate-1/2 rounded-[50%] bg-linear-to-t from-violet-500/25 via-cyan-400/10 to-transparent blur-3xl dark:from-violet-500/35 dark:via-purple-400/20' style={{ animationDuration: '10s'}} />
      </div>
      <div className='relative z-10 flex h-screen w-full items-center justify-center overflow-hidden px-6'>
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
