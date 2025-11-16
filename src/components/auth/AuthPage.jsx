import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, TrendingUp, Shield, Smartphone } from 'lucide-react'
import { LoginForm } from './LoginForm.jsx'
import { RegisterForm } from './RegisterForm.jsx'
import { ResetPasswordForm } from './ResetPasswordForm.jsx'

const AUTH_MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
  RESET: 'reset'
}

export function AuthPage() {
  const [currentMode, setCurrentMode] = useState(AUTH_MODES.LOGIN)

  const switchToLogin = () => setCurrentMode(AUTH_MODES.LOGIN)
  const switchToRegister = () => setCurrentMode(AUTH_MODES.REGISTER)
  const switchToReset = () => setCurrentMode(AUTH_MODES.RESET)

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 20 }
  }

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen">
          {/* Seção de Informações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Logo e Título Principal */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <div className="p-3 bg-primary rounded-xl">
                  <Wallet className="h-8 w-8 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  Finanças Pessoais
                </h1>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Controle suas finanças com{' '}
                <span className="text-primary">inteligência</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-lg">
                Gerencie suas receitas, despesas, orçamentos e metas financeiras 
                de forma simples e eficiente.
              </p>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Relatórios Inteligentes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize seus gastos com gráficos detalhados e insights personalizados.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-start space-x-4"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Segurança Total
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Seus dados financeiros protegidos com criptografia de ponta.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-start space-x-4"
              >
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Smartphone className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Acesso Multiplataforma
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Use em qualquer dispositivo, seus dados sempre sincronizados.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-start space-x-4"
              >
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Wallet className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Metas Financeiras
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Defina objetivos e acompanhe seu progresso automaticamente.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Estatísticas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-border"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Usuários Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">R$ 50M+</div>
                <div className="text-sm text-muted-foreground">Gerenciados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Seção de Autenticação */}
          <div className="flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMode}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className="w-full max-w-md"
              >
                {currentMode === AUTH_MODES.LOGIN && (
                  <LoginForm
                    onSwitchToRegister={switchToRegister}
                    onSwitchToReset={switchToReset}
                  />
                )}
                {currentMode === AUTH_MODES.REGISTER && (
                  <RegisterForm onSwitchToLogin={switchToLogin} />
                )}
                {currentMode === AUTH_MODES.RESET && (
                  <ResetPasswordForm onSwitchToLogin={switchToLogin} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Background decorativo */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/3 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
