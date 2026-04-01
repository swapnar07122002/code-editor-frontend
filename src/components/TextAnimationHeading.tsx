'use client';
import { cn } from '@/lib/utils';
import React from 'react'
import { TypeAnimation } from 'react-type-animation'

type TextAnimationHeadingProps = {
  className? : string
}

const TextAnimationHeading = ({className} : TextAnimationHeadingProps) => {
  return (
    <div>
      <div className={cn("mx-auto text-2xl lg:text-5xl my-6 flex flex-col gap-3 lg:gap-5 font-bold text-center",className)}>
        <div className="text-primary drop-shadow-md">Build Space</div>
        <div className="w-fit mx-auto text-center">
          <TypeAnimation
            sequence={[
              'Code together in real-time',
              1000, // wait 1s before replacing "Mice" with "Hamsters"
              'Collab easily with your team',
              1000,
              'Share, edit, and debug instantly',
              1000
            ]}
            wrapper="span"
            speed={50}
            repeat={Infinity}
          />
        </div>
      </div>
    </div>
  )
}

export default TextAnimationHeading