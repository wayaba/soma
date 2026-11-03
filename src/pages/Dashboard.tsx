import { useEffect, useState } from 'react'
import Piece from '@/svg/Piece'
import Card from '@/components/ui/Card'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const [loading, setLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Lógica para obtener el contenido actualizado, por ejemplo, una llamada a una API
  const fetchContent = async () => {
    setLoading(true)
    setHasError(false)
    try {
      //const response = await datoActualService.getDatoActual()
      //setDatoActual(response.data[0])
    } catch (error) {
      console.error(error)
      setHasError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Función para obtener el contenido actualizado
    fetchContent()

    // Actualiza el contenido cada 10 segundos
    const interval = setInterval(fetchContent, 10000)

    // Limpia el intervalo cuando el componente se desmonta
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="brand-panel mx-auto my-8 max-w-4xl p-6 sm:p-9">
      {loading && (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      {hasError ? (
        <div>
          <span className="bg-green-100 ml-3 text-red-800 text-xs font-medium mr-2 px-2.5 rounded dark:bg-gray-700 dark:text-red-400 border border-red-400">
            Hay error consultado datos Actuales, por favor contacte al soporte
          </span>
        </div>
      ) : (
        <div>
          <div className="grid gird-cols-1 md:grid-cols-2 gap-6">
            <Link to="/recetasFab" className="hover:scale-110 ">
              <div className="brand-panel rounded-2xl p-6 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
                <div className="flex flex-row space-x-4 items-center">
                  <div id="stats-1">
                    <Piece></Piece>
                  </div>
                  <Card label={'Reporte de Fabricación'} />
                </div>
              </div>
            </Link>

            <Link to="/recetasCip" className="hover:scale-110 ">
              <div className="brand-panel rounded-2xl p-6 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
                <div className="flex flex-row space-x-4 items-center">
                  <div id="stats-1">
                    <Piece></Piece>
                  </div>
                  <Card label={'Reporte de CIPSIP'} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
