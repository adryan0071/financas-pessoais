import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'

export function RegisterForm({ onSwitchToLogin }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const { register: registerUser, isLoading, error, clearError } = useAuth()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      clearError()
      
      if (!acceptTerms) {
        setError('terms', { 
          type: 'manual', 
          message: 'Você deve aceitar os termos de uso' 
        })
        return
      }

      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword
      })
    } catch (err) {
      console.error('Erro no cadastro:', err)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
        <CardDescription className="text-center">
          Crie sua conta para começar a controlar suas finanças
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                className="pl-10"
                {...register('name', {
                  required: 'Nome é obrigatório',
                  minLength: {
                    value: 2,
                    message: 'Nome deve ter pelo menos 2 caracteres'
                  },
                  maxLength: {
                    value: 50,
                    message: 'Nome deve ter no máximo 50 caracteres'
                  }
                })}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

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
                placeholder="Crie uma senha segura"
                className="pl-10 pr-10"
                {...register('password', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'Senha deve ter pelo menos 6 caracteres'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
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

          {/* Campo Confirmar Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirme sua senha"
                className="pl-10 pr-10"
                {...register('confirmPassword', {
                  required: 'Confirmação de senha é obrigatória',
                  validate: value =>
                    value === password || 'As senhas não coincidem'
                })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Checkbox Termos */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={setAcceptTerms}
            />
            <Label
              htmlFor="terms"
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Aceito os{' '}
              <Button variant="link" className="p-0 h-auto text-sm">
                termos de uso
              </Button>{' '}
              e{' '}
              <Button variant="link" className="p-0 h-auto text-sm">
                política de privacidade
              </Button>
            </Label>
          </div>
          {errors.terms && (
            <p className="text-sm text-destructive">{errors.terms.message}</p>
          )}

          {/* Erro de cadastro */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Botão de Cadastro */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </Button>

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

          {/* Link para login */}
          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
            </span>
            <Button
              type="button"
              variant="link"
              className="text-sm p-0 h-auto font-semibold"
              onClick={onSwitchToLogin}
            >
              Entrar
            </Button>
          </div>
        </form>

        {/* Dicas de segurança */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2 font-medium">
            Dicas para uma senha segura:
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Pelo menos 6 caracteres</li>
            <li>• Misture letras maiúsculas e minúsculas</li>
            <li>• Inclua números</li>
            <li>• Use caracteres especiais quando possível</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
