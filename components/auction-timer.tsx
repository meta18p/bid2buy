"use client"

import { useState, useEffect } from "react"
import { calculateTimeLeft } from "@/lib/utils"
import { Clock } from "lucide-react"

interface AuctionTimerProps {
  endTime: Date
  status?: string
}

export default function AuctionTimer({ endTime, status }: AuctionTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime))
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  if (status === "ENDED" || timeLeft.isEnded) {
    return (
      <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
        <Clock className="h-5 w-5 mr-2" />
        <span className="font-medium">Auction ended</span>
      </div>
    )
  }

  return (
    <div className="bg-amber-100 dark:bg-amber-900/20 p-3 rounded-lg">
      <p className="text-sm text-amber-800 dark:text-amber-400 mb-1 flex items-center">
        <Clock className="h-4 w-4 mr-1" />
        Time remaining
      </p>
      <div className="grid grid-cols-4 gap-1 text-center">
        <div>
          <p className="text-xl font-bold">{timeLeft.days}</p>
          <p className="text-xs text-amber-800/70 dark:text-amber-400/70">Days</p>
        </div>
        <div>
          <p className="text-xl font-bold">{timeLeft.hours}</p>
          <p className="text-xs text-amber-800/70 dark:text-amber-400/70">Hours</p>
        </div>
        <div>
          <p className="text-xl font-bold">{timeLeft.minutes}</p>
          <p className="text-xs text-amber-800/70 dark:text-amber-400/70">Minutes</p>
        </div>
        <div>
          <p className="text-xl font-bold">{timeLeft.seconds}</p>
          <p className="text-xs text-amber-800/70 dark:text-amber-400/70">Seconds</p>
        </div>
      </div>
    </div>
  )
}
