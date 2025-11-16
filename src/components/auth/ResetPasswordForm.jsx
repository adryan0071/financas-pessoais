import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'

export function ResetPasswordForm({ onSwitchToLogin }) {
  const [emailSent, setEmailSent] = useState(false)
  const { resetPassword, isLoading, error, clearError } = useAuth()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm()

  const onSubmit = async (data) => {
    try {
      clearError()
      await resetPassword(data.email)
      setEmailSent(true)
    } catch (err) {
      console.error('Erro na recuperação de senha:', err)
    }
  }

  const handleBackToLogin = () => {
    setEmailSent(false)
    clearError()
    onSwitchToLogin()
  }

  if (emailSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Email Enviado!</CardTitle>
          <CardDescription>
            Enviamos as instruções de recuperação para seu email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              Se não encontrar o email, verifique também a pasta de spam.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button onClick={handleBackToLogin} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Login
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setEmailSent(false)}
              className="w-full"
            >
              Tentar outro email
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Não recebeu o email?</p>
            <Button
              variant="link"
              className="text-sm p-0 h-auto"
              onClick={() => {
                const email = getValues('email')
                if (email) {
                  onSubmit({ email })
                }
              }}
              disabled={isLoading}
            >
              Reenviar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Recuperar Senha
        </CardTitle>
        <CardDescription className="text-center">
          Digite seu email para receber as instruções de recuperação
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

          {/* Erro de recuperação */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Botão de Enviar */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Instruções'
            )}
          </Button>

          {/* Botão Voltar */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleBackToLogin}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Login
          </Button>
        </form>

        {/* Informações adicionais */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2 font-medium">
            Como funciona:
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Você receberá um email com um link seguro</li>
            <li>• O link é válido por 24 horas</li>
            <li>• Clique no link para criar uma nova senha</li>
            <li>• Sua conta permanece segura durante o processo</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
