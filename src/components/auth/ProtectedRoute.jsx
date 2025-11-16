import { useAuth } from '../../contexts/AuthContext.jsx'
import { AuthPage } from './AuthPage.jsx'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não estiver autenticado, mostra a página de login
  if (!isAuthenticated) {
    return <AuthPage />
  }

  // Se estiver autenticado, mostra o conteúdo protegido
  return children
}
