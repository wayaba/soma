import React, { useEffect, useContext, useRef } from 'react'
import moment from 'moment'
import AuthContext from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export interface IdleTimeOutHandlerProps {
  timeOutInterval?: number
}

const IdleTimeOutHandler: React.FC<IdleTimeOutHandlerProps> = (props) => {
  const authContext = useContext(AuthContext)
  const navigate = useNavigate()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  if (!authContext) {
    throw new Error('AuthContext is undefined. Make sure your component is wrapped in AuthProvider.')
  }

  const { loggedIn, getLoggedIn } = authContext

  const events = ['click', 'load', 'keydown']
  const eventHandler = () => {
    if (loggedIn) {
      localStorage.setItem('SOMAEXPIREDTIME', moment().toISOString())
      if (timer.current) {
        startTimer()
      }
    }
  }

  useEffect(() => {
    if (loggedIn === true) addEvents()
    return () => {
      removeEvents()
      if (timer.current) clearTimeout(timer.current)
      localStorage.removeItem('SOMAEXPIREDTIME')
    }
    // eslint-disable-next-line
  }, [loggedIn])

  const startTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current)
    }
    timer.current = setTimeout(() => {
      let lastInteractionTime = localStorage.getItem('SOMAEXPIREDTIME') ?? localStorage.getItem('ETICOSEXPIREDTIME')
      if (!lastInteractionTime) {
        localStorage.setItem('SOMAEXPIREDTIME', moment().toISOString())
        lastInteractionTime = localStorage.getItem('SOMAEXPIREDTIME')
      }
      const diff = moment.duration(moment().diff(moment(lastInteractionTime)))
      const timeOutInterval = props.timeOutInterval ?? 60000
      if (!loggedIn) {
        if (timer.current) clearTimeout(timer.current)
      } else {
        if (diff.asMilliseconds() < timeOutInterval) {
          startTimer()
        } else {
          removeEvents()
          if (timer.current) clearTimeout(timer.current)
          localStorage.removeItem('somauser')
          localStorage.removeItem('SOMAEXPIREDTIME')
          localStorage.removeItem('eticosuser')
          localStorage.removeItem('ETICOSEXPIREDTIME')
          getLoggedIn()
          navigate('/', { replace: true })
        }
      }
    }, props.timeOutInterval ?? 60000)
  }

  const addEvents = () => {
    events.forEach((eventName) => {
      window.addEventListener(eventName, eventHandler)
    })
    startTimer()
  }

  const removeEvents = () => {
    events.forEach((eventName) => {
      window.removeEventListener(eventName, eventHandler)
    })
  }

  return <></>
}

export default IdleTimeOutHandler
