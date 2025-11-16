import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'

export function LoginForm({ onSwitchToRegister, onSwitchToReset }) {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error, clearError } = useAuth()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm()

  const onSubmit = async (data) => {
    try {
      clearError()
      await login(data.email, data.password)
    } catch (err) {
      // O erro já é tratado no contexto, mas podemos adicionar validações específicas aqui
      console.error('Erro no login:', err)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
        <CardDescription className="text-center">
          Entre com sua conta para acessar suas finanças
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="pl-10"
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Campo Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                className="pl-10 pr-10"
                {...register('password', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'Senha deve ter pelo menos 6 caracteres'
                  }
                })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Erro de autenticação */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Botão de Login */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>

          {/* Link para recuperar senha */}
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="text-sm text-muted-foreground hover:text-primary"
              onClick={onSwitchToReset}
            >
              Esqueceu sua senha?
            </Button>
          </div>

          {/* Divisor */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou
              </span>
            </div>
          </div>

          {/* Link para cadastro */}
          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              Não tem uma conta?{' '}
            </span>
            <Button
              type="button"
              variant="link"
              className="text-sm p-0 h-auto font-semibold"
              onClick={onSwitchToRegister}
            >
              Cadastre-se
            </Button>
          </div>
        </form>

        {/* Informações de teste */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2 font-medium">
            Contas de teste disponíveis:
          </p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>
              <strong>Admin:</strong> admin@financas.com / 123456
            </div>
            <div>
              <strong>Usuário:</strong> usuario@teste.com / senha123
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
